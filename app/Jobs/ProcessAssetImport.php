<?php

namespace App\Jobs;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\AssetCondition;
use App\Models\AssetStatus;
use App\Models\Department;
use App\Models\ImportError;
use App\Models\ImportJob;
use App\Models\Location;
use App\Services\CacheService;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Rap2hpoutre\FastExcel\FastExcel;

class ProcessAssetImport implements ShouldQueue
{
    use Queueable;

    public int $timeout = 600;
    public int $tries   = 1;

    public function __construct(public ImportJob $importJob) {}

    public function handle(): void
    {
        $job = $this->importJob;

        try {
            $totalRows = count($collection);
            $job->update([
                'status'     => 'processing',
                'started_at' => now(),
                'total_rows' => $totalRows > 0 ? $totalRows : $job->total_rows,
            ]);

            $collection = (new FastExcel)->import(Storage::path($job->file_path));
            $mapping    = $job->column_mapping ?? [];
            $mode       = $job->mode ?? 'create_only';

            // Cache lookups for performance
            $statuses    = AssetStatus::where('is_active', true)->get()->keyBy(fn ($s) => strtolower($s->name));
            $conditions  = AssetCondition::where('is_active', true)->get()->keyBy(fn ($c) => strtolower($c->name));
            $departments = Department::where('is_active', true)->get()->keyBy(fn ($d) => strtolower($d->name));
            $locations   = Location::where('is_active', true)->get()->keyBy(fn ($l) => strtolower($l->name));
            $defaultStatus = AssetStatus::where('is_default', true)->first();
            $defaultCondition = AssetCondition::where('is_default', true)->first();

            $rowNumber   = 1;
            $created     = 0;
            $updated     = 0;
            $skipped     = 0;
            $errors      = 0;
            $errorsData  = [];

            foreach ($collection as $row) {
                $rowNumber++;

                try {
                    $mapped = $this->mapRow($row, $mapping);
                    $assetCode = trim($mapped['asset_code'] ?? '');

                    if (empty($assetCode)) {
                        $errorsData[] = [
                            'import_job_id' => $job->id,
                            'row_number'    => $rowNumber,
                            'asset_code'    => null,
                            'field'         => 'asset_code',
                            'value'         => null,
                            'error_type'    => 'required',
                            'message'       => 'Kode aset wajib diisi.',
                        ];
                        $errors++;
                        continue;
                    }

                    $existingAsset = Asset::withTrashed()->where('asset_code', $assetCode)->first();

                    if ($existingAsset && $mode === 'create_only') {
                        $skipped++;
                        continue;
                    }

                    if (!$existingAsset && $mode === 'update_existing') {
                        $skipped++;
                        continue;
                    }

                    // Resolve relations
                    $assetData = [
                        'asset_code'  => $assetCode,
                        'asset_name'  => trim($mapped['asset_name'] ?? 'Unknown'),
                        'quantity'    => $this->parseNumber($mapped['quantity'] ?? 1),
                        'status_id'   => $defaultStatus?->id,
                        'condition_id'=> $defaultCondition?->id,
                    ];

                    // Location
                    if (!empty($mapped['location'])) {
                        $loc = $locations->get(strtolower(trim($mapped['location'])));
                        if ($loc) {
                            $assetData['location_id'] = $loc->id;
                        }
                    }

                    // Dates
                    if (!empty($mapped['acquisition_date'])) {
                        $assetData['acquisition_date'] = $this->parseDate($mapped['acquisition_date']);
                    }
                    if (!empty($mapped['depreciation_end_date'])) {
                        $assetData['depreciation_end_date'] = $this->parseDate($mapped['depreciation_end_date']);
                    }

                    // Financial
                    foreach (['acquisition_value', 'previous_accumulated_depreciation', 'accumulated_depreciation', 'depreciation_per_period', 'book_value'] as $field) {
                        if (isset($mapped[$field])) {
                            $assetData[$field] = $this->parseNumber($mapped[$field]);
                        }
                    }

                    if ($existingAsset) {
                        $existingAsset->update($assetData);
                        $updated++;
                    } else {
                        $assetData['qr_token'] = Str::random(32);
                        Asset::create($assetData);
                        $created++;
                    }
                } catch (\Throwable $e) {
                    $errorsData[] = [
                        'import_job_id' => $job->id,
                        'row_number'    => $rowNumber,
                        'asset_code'    => $mapped['asset_code'] ?? null,
                        'field'         => null,
                        'value'         => null,
                        'error_type'    => 'exception',
                        'message'       => $e->getMessage(),
                    ];
                    $errors++;
                }

                // Update progress every 50 rows
                if ($rowNumber % 50 === 0) {
                    $job->update(['processed_rows' => $rowNumber - 1]);
                }
            }

            // Save errors in batch
            if (!empty($errorsData)) {
                ImportError::insert($errorsData);
            }

            $finalStatus = $errors > 0 ? 'completed_with_errors' : 'completed';
            $job->update([
                'status'         => $finalStatus,
                'processed_rows' => $rowNumber - 1,
                'total_rows'     => $rowNumber - 1,
                'created_rows'   => $created,
                'updated_rows'   => $updated,
                'skipped_rows'   => $skipped,
                'failed_rows'    => $errors,
                'error_rows'     => $errors,
                'completed_at'   => now(),
            ]);
            CacheService::clearDashboardCache();
            CacheService::clearMasterData();

        } catch (\Throwable $e) {
            $job->update([
                'status'        => 'failed',
                'error_message' => $e->getMessage(),
                'completed_at'  => now(),
            ]);
        }
    }

    private function mapRow(array $row, array $mapping): array
    {
        $mapped = [];
        foreach ($mapping as $sourceColumn => $targetField) {
            if (isset($row[$sourceColumn])) {
                $mapped[$targetField] = $row[$sourceColumn];
            }
        }
        return $mapped;
    }

    private function parseNumber($value): float
    {
        if ($value === null || $value === '') return 0;
        $cleaned = preg_replace('/[^0-9.,\-]/', '', (string) $value);
        $cleaned = str_replace(',', '.', str_replace('.', '', $cleaned));
        return (float) $cleaned;
    }

    private function parseDate($value): ?string
    {
        if (empty($value)) return null;

        if (is_numeric($value)) {
            // Excel serial number
            try {
                return Carbon::createFromFormat('Y-m-d', '1899-12-30')
                    ->addDays((int) $value)
                    ->format('Y-m-d');
            } catch (\Throwable) {
                return null;
            }
        }

        $formats = ['d/m/Y', 'Y-m-d', 'd-m-Y', 'm/d/Y', 'd/m/y'];
        foreach ($formats as $format) {
            try {
                return Carbon::createFromFormat($format, (string) $value)->format('Y-m-d');
            } catch (\Throwable) {
                continue;
            }
        }

        return null;
    }
}
