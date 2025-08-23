<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("CREATE TYPE task_status AS ENUM ('pending', 'inProgress', 'done');");

        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title', 150);
            $table->text('description')->nullable();

            // Use plain string now; we’ll convert to ENUM after
            // using no default here to avoid cast issues
            $table->string('status');
            $table->timestamps();
        });

        DB::statement("
            UPDATE tasks
            SET status = CASE
                WHEN lower(replace(status, ' ', '')) IN ('pending') THEN 'pending'
                WHEN lower(replace(status, ' ', '')) IN ('inprogress','in_progress') THEN 'inProgress'
                WHEN lower(replace(status, ' ', '')) IN ('done') THEN 'done'
                ELSE 'pending'
            END
        ");

        DB::statement("ALTER TABLE tasks ALTER COLUMN status DROP DEFAULT");
        DB::statement("ALTER TABLE tasks ALTER COLUMN status TYPE task_status USING status::task_status");
        DB::statement("ALTER TABLE tasks ALTER COLUMN status SET DEFAULT 'pending'::task_status");
        DB::statement("ALTER TABLE tasks ALTER COLUMN status SET NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE tasks ALTER COLUMN status DROP DEFAULT");
        DB::statement("ALTER TABLE tasks ALTER COLUMN status TYPE VARCHAR(255)");

        Schema::dropIfExists('tasks');

        DB::statement("DROP TYPE IF EXISTS task_status;");
    }
};
