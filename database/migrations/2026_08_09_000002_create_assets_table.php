<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('asset_code', 50)->unique();
            $table->string('asset_name', 255);
            $table->text('description')->nullable();
            $table->foreignId('category_id')->nullable()->constrained('asset_categories')->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->decimal('quantity', 15, 2)->default(1);
            $table->string('unit', 30)->nullable();
            $table->date('acquisition_date')->nullable();
            $table->date('depreciation_end_date')->nullable();
            $table->decimal('acquisition_value', 18, 2)->nullable();
            $table->decimal('previous_accumulated_depreciation', 18, 2)->nullable();
            $table->decimal('accumulated_depreciation', 18, 2)->nullable();
            $table->decimal('depreciation_per_period', 18, 2)->nullable();
            $table->decimal('book_value', 18, 2)->nullable();
            $table->foreignId('status_id')->nullable()->constrained('asset_statuses')->nullOnDelete();
            $table->foreignId('condition_id')->nullable()->constrained('asset_conditions')->nullOnDelete();
            $table->string('serial_number', 100)->nullable();
            $table->string('brand', 100)->nullable();
            $table->string('model', 100)->nullable();
            $table->string('qr_token', 64)->unique()->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('asset_code');
            $table->index('category_id');
            $table->index('department_id');
            $table->index('location_id');
            $table->index('status_id');
            $table->index('condition_id');
            $table->index('created_at');
        });

        Schema::create('asset_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->string('file_path', 500);
            $table->string('file_name', 255);
            $table->string('mime_type', 100)->nullable();
            $table->unsignedBigInteger('file_size')->nullable(); // in bytes
            $table->boolean('is_primary')->default(false);
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('asset_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->foreignId('from_department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('to_department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('from_location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->foreignId('to_location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->text('reason')->nullable();
            $table->foreignId('moved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('moved_at')->nullable();
            $table->timestamps();

            $table->index('asset_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_movements');
        Schema::dropIfExists('asset_photos');
        Schema::dropIfExists('assets');
    }
};
