<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30)->unique();
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->enum('status', ['draft', 'scheduled', 'in_progress', 'completed', 'cancelled'])->default('draft');
            $table->enum('scope_type', ['all', 'department', 'location', 'category', 'selection'])->default('all');
            $table->json('scope_ids')->nullable(); // IDs of selected scope (dept/loc/cat/asset ids)
            $table->enum('completion_mode', ['strict', 'flexible'])->default('flexible');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('asset_audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('audit_session_id')->constrained('audit_sessions')->cascadeOnDelete();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->foreignId('auditor_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('audit_time');
            $table->enum('found_status', ['found', 'not_found', 'partially_found'])->default('found');
            $table->foreignId('condition_id')->nullable()->constrained('asset_conditions')->nullOnDelete();
            $table->foreignId('location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->decimal('quantity_found', 15, 2)->nullable();
            $table->enum('result', ['match', 'mismatch', 'issue'])->default('match');
            $table->enum('verification_method', ['manual', 'qr_scan', 'barcode'])->default('manual');
            $table->text('notes')->nullable();
            $table->string('photo_path', 500)->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamps();

            $table->index('asset_id');
            $table->index('audit_session_id');
            $table->index('auditor_id');
            $table->index('audit_time');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_audits');
        Schema::dropIfExists('audit_sessions');
    }
};
