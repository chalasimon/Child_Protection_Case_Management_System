<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
         // For MySQL/MariaDB
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE case_histories MODIFY COLUMN action ENUM('created','updated','assigned','status_changed','note_added','deleted')");
        }
        // For PostgreSQL
        elseif (DB::getDriverName() === 'pgsql') {
            // PostgreSQL uses CHECK constraints instead of ENUM
            // You might need to handle this differently
        }
        // For SQLite - skip the migration or handle differently
        else {
            // SQLite doesn't support MODIFY or ENUM, so we skip this
            // You could recreate the table if needed, but for testing it's often fine to skip
        }
    }

    public function down(): void
    {
        if(DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE case_histories MODIFY COLUMN action ENUM('created','updated','assigned','status_changed','note_added')");
        }
    }

};
