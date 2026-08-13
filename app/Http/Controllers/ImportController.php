<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessAssetImport;
use App\Models\ImportJob;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Rap2hpoutre\FastExcel\FastExcel;

class ImportController extends Controller
{
    // Default column mapping
    const DEFAULT_MAPPING = [
        'Kode'            => 'asset_code',
        'Barang'          => 'asset_name',
        'Lokasi'          => 'location',
        'Qty'             => 'quantity',
        'Tgl. Oleh'       => 'acquisition_date',
        'Tgl Susut Akhir' => 'depreciation_end_date',
        'Nilai Perolehan' => 'acquisition_value',
        'Prev. Akum'      => 'previous_accumulated_depreciation',
        'Akum. Total'     => 'accumulated_depreciation',
        'Nilai Per-Akum'  => 'depreciation_per_period',
        'Nilai Buku'      => 'book_value',
    ];

    public function index(): Response
    {
        return Inertia::render('Import/Index', [
            'default_mapping' => self::DEFAULT_MAPPING,
        ]);
    }

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls|max:10240',
        ], [
            'file.required' => 'File harus dipilih.',
            'file.mimes'    => 'Format file harus .xlsx atau .xls.',
            'file.max'      => 'Ukuran file tidak boleh lebih dari 10MB.',
        ]);

        $file     = $request->file('file');
        $fileName = $file->getClientOriginalName();
        $fileHash = md5_file($file->getRealPath());

        // Check idempotency - same file uploaded before
        $duplicateJob = ImportJob::where('file_hash', $fileHash)
            ->whereIn('status', ['completed', 'processing'])
            ->latest()
            ->first();

        $duplicateWarning = null;
        if ($duplicateJob) {
            $duplicateWarning = "File dengan isi identik pernah diimport pada {$duplicateJob->created_at->diffForHumans()}. Anda tetap dapat melanjutkan import jika diperlukan.";
        }

        // Store file
        $filePath = $file->store('imports', 'local');

        // Read headers to detect columns
        $rows    = [];
        $headers = [];

        try {
            $collection = (new FastExcel)->import(Storage::path($filePath));
            $headers    = array_keys($collection->first() ?? []);
            $rows       = $collection->take(5)->values()->toArray(); // Preview first 5 rows
        } catch (\Throwable $e) {
            Storage::delete($filePath);
            return response()->json(['error' => 'File tidak dapat dibaca. Pastikan format Excel valid.'], 422);
        }

        // Create import job record
        $job = ImportJob::create([
            'file_name'  => $fileName,
            'file_path'  => $filePath,
            'file_hash'  => $fileHash,
            'file_size'  => $file->getSize(),
            'status'     => 'pending',
            'uploaded_by'=> auth()->id(),
        ]);

        ActivityLogService::log('upload', 'import', get_class($job), $job->id, description: "File {$fileName} diupload untuk import");

        return response()->json([
            'job_id'  => $job->id,
            'headers' => $headers,
            'preview' => $rows,
            'default_mapping' => self::DEFAULT_MAPPING,
            'warning' => $duplicateWarning,
            'previous_job_id' => $duplicateJob?->id,
        ]);
    }

    public function validateRows(Request $request, ImportJob $job): JsonResponse
    {
        $request->validate([
            'mapping' => 'required|array',
            'mode'    => 'required|in:create_only,update_existing,upsert',
        ]);

        // Update job with mapping and mode
        $job->update([
            'column_mapping' => $request->get('mapping'),
            'mode'           => $request->get('mode'),
        ]);

        // Quick validation preview (not full validation - that happens in queue)
        try {
            $collection = (new FastExcel)->import(Storage::path($job->file_path));
            $totalRows  = $collection->count();

            $job->update(['total_rows' => $totalRows]);

            return response()->json([
                'total_rows' => $totalRows,
                'job_id'     => $job->id,
                'mode'       => $job->mode,
            ]);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Gagal membaca file: ' . $e->getMessage()], 422);
        }
    }

    public function startImport(Request $request, ImportJob $job): RedirectResponse
    {
        if ($job->status !== 'pending') {
            return back()->with('error', 'Import sudah diproses atau sedang berjalan.');
        }

        ActivityLogService::log('start', 'import', get_class($job), $job->id, description: "Import {$job->file_name} dimulai (mode: {$job->mode})");

        $job->update(['status' => 'queued']);
        ProcessAssetImport::dispatch($job->fresh());

        return redirect()->route('import.show', $job)->with('info', 'Import sedang diproses di background.');
    }

    public function show(ImportJob $job): Response
    {
        return Inertia::render('Import/Show', [
            'job' => $job->load(['uploader', 'errors' => fn ($q) => $q->limit(100)]),
        ]);
    }

    public function progress(ImportJob $job): JsonResponse
    {
        return response()->json([
            'status'          => $job->status,
            'total_rows'      => $job->total_rows,
            'processed_rows'  => $job->processed_rows,
            'progress_percent'=> $job->progress_percent,
            'created_rows'    => $job->created_rows,
            'updated_rows'    => $job->updated_rows,
            'error_rows'      => $job->error_rows,
            'skipped_rows'    => $job->skipped_rows,
        ]);
    }

    public function history(Request $request): Response
    {
        $jobs = ImportJob::with('uploader')
            ->when($request->get('status'), fn ($q, $v) => $q->where('status', $v))
            ->orderByDesc('created_at')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Import/History', [
            'jobs'    => $jobs,
            'filters' => $request->only(['status']),
        ]);
    }

    public function downloadErrors(ImportJob $job)
    {
        if ($job->error_file_path && Storage::exists($job->error_file_path)) {
            return Storage::download($job->error_file_path, "import-errors-{$job->id}.xlsx");
        }

        // Generate on-the-fly
        $errors = $job->errors()->get()->map(fn ($e) => [
            'Row'      => $e->row_number,
            'Kode'     => $e->asset_code,
            'Field'    => $e->field,
            'Value'    => $e->value,
            'Error'    => $e->message,
        ]);

        return (new FastExcel($errors))->download("import-errors-{$job->id}.xlsx");
    }

    public function downloadTemplate()
    {
        $template = collect([[
            'No'              => '1',
            'Kode'            => 'CLD001',
            'Barang'          => 'Contoh Nama Aset',
            'Lokasi'          => 'Hotel',
            'Qty'             => '1',
            'Tgl. Oleh'       => '01/01/2020',
            'Tgl Susut Akhir' => '01/01/2025',
            'Nilai Perolehan' => '1000000',
            'Prev. Akum'      => '200000',
            'Akum. Total'     => '400000',
            'Nilai Per-Akum'  => '100000',
            'Nilai Buku'      => '600000',
        ]]);

        return (new FastExcel($template))->download('template-import-aset.xlsx');
    }
}

