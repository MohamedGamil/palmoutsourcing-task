<?php

namespace Database\Seeders;

use App\Models\Task;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create 10 tasks with a good distribution of statuses
        Task::factory(3)->pending()->create();
        Task::factory(4)->inProgress()->create();
        Task::factory(3)->done()->create();
    }
}
