<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('import_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('file_name', 255);
            $table->string('file_path', 500)->nullable();
            $table->string('file_hash', 64)->nullable(); // SHA-256 for idempotency check
            $table->unsignedBigInteger('file_size')->nullable();
            $table->enum('mode', ['create_only', 'update_existing', 'upsert'])->default('create_only');
            $table->unsignedBigInteger('total_rows')->default(0);
            $table->unsignedBigInteger('valid_rows')->default(0);
            $table->unsignedBigInteger('warning_rows')->default(0);
            $table->unsignedBigInteger('error_rows')->default(0);
            $table->unsignedBigInteger('created_rows')->default(0);
            $table->unsignedBigInteger('updated_rows')->default(0);
            $table->unsignedBigInteger('skipped_rows')->default(0);
            $table->unsignedBigInteger('failed_rows')->default(0);
            $table->unsignedBigInteger('processed_rows')->default(0); // for progress tracking
            $table->enum('status', ['pending', 'queued', 'processing', 'completed', 'completed_with_errors', 'failed', 'cancelled'])->default('pending');
            $table->json('column_mapping')->nullable(); // saved column mapping
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->string('error_file_path', 500)->nullable();
            $table->text('error_message')->nullable(); // global error message if failed
            $table->timestamps();

            $table->index('created_at');
            $table->index('status');
        });

        Schema::create('import_errors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('import_job_id')->constrained('import_jobs')->cascadeOnDelete();
            $table->unsignedBigInteger('row_number');
            $table->string('asset_code', 50)->nullable();
            $table->string('field', 100)->nullable();
            $table->text('value')->nullable();
            $table->string('error_type', 50)->nullable(); // duplicate, invalid_date, required, etc
            $table->text('message');
            $table->timestamps();

            $table->index('import_job_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('import_errors');
        Schema::dropIfExists('import_jobs');
    }
};
