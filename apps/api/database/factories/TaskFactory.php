<?php

namespace Database\Factories;

use App\Models\Task;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Task>
 */
class TaskFactory extends Factory
{
    protected $model = Task::class;

    public function definition(): array
    {
        return [
            // e.g., "Fix login bug"
            'title'       => $this->faker->sentence(3),  

            'description' => $this->faker->optional()->paragraph(),

            // camelCase: pending, inProgress, done
            'status'      => $this->faker->randomElement(Task::statuses()), 
        ];
    }

    /**
     * State: Pending
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Task::STATUS_PENDING,
        ]);
    }

    /**
     * State: In Progress
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Task::STATUS_IN_PROGRESS,
        ]);
    }

    /**
     * State: Done
     */
    public function done(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Task::STATUS_DONE,
        ]);
    }
}
