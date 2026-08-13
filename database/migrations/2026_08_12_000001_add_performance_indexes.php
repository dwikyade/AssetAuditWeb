<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->index(['status_id', 'created_at']);
            $table->index(['category_id', 'created_at']);
            $table->index(['department_id', 'created_at']);
            $table->index(['location_id', 'created_at']);
        });

        Schema::table('asset_audits', function (Blueprint $table) {
            $table->index(['audit_session_id', 'found_status']);
            $table->index(['audit_session_id', 'result']);
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            $table->index(['module', 'created_at']);
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'created_at']);
            $table->dropIndex(['module', 'created_at']);
        });

        Schema::table('asset_audits', function (Blueprint $table) {
            $table->dropIndex(['audit_session_id', 'result']);
            $table->dropIndex(['audit_session_id', 'found_status']);
        });

        Schema::table('assets', function (Blueprint $table) {
            $table->dropIndex(['location_id', 'created_at']);
            $table->dropIndex(['department_id', 'created_at']);
            $table->dropIndex(['category_id', 'created_at']);
            $table->dropIndex(['status_id', 'created_at']);
        });
    }
};
