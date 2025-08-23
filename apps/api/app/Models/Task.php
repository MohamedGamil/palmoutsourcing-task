<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="Task",
 *     type="object",
 *     title="Task",
 *     description="Task model",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         description="Task ID"
 *     ),
 *     @OA\Property(
 *         property="title",
 *         type="string",
 *         maxLength=150,
 *         description="Task title"
 *     ),
 *     @OA\Property(
 *         property="description",
 *         type="string",
 *         nullable=true,
 *         description="Task description"
 *     ),
 *     @OA\Property(
 *         property="status",
 *         type="string",
 *         enum={"pending", "inProgress", "done"},
 *         description="Task status"
 *     ),
 *     @OA\Property(
 *         property="created_at",
 *         type="string",
 *         format="date-time",
 *         description="Creation timestamp"
 *     ),
 *     @OA\Property(
 *         property="updated_at",
 *         type="string",
 *         format="date-time",
 *         description="Last update timestamp"
 *     )
 * )
 */
class Task extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'title',
        'description',
        'status',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Status constants (camelCase).
     */
    public const STATUS_PENDING     = 'pending';
    public const STATUS_IN_PROGRESS = 'inProgress';
    public const STATUS_DONE        = 'done';

    /**
     * Helper: get all valid statuses.
     */
    public static function statuses(): array
    {
        return [
            self::STATUS_PENDING,
            self::STATUS_IN_PROGRESS,
            self::STATUS_DONE,
        ];
    }

    /**
     * Helper: check if task is done.
     */
    public function isDone(): bool
    {
        return $this->status === self::STATUS_DONE;
    }

    /**
     * Mutator: normalize status before saving
     * Converts inputs like "In Progress" → "inProgress"
     */
    public function setStatusAttribute(string $value): void
    {
        // Check if already in correct format
        if (in_array($value, self::statuses(), true)) {
            $this->attributes['status'] = $value;
            return;
        }

        // Normalize: lowercase, replace underscores with spaces, then camelCase
        $normalized = Str::camel(str_replace('_', ' ', strtolower(trim($value))));

        // Ensure it matches one of the allowed statuses
        if (! in_array($normalized, self::statuses(), true)) {
            throw new \InvalidArgumentException("Invalid status value: {$value}");
        }

        $this->attributes['status'] = $normalized;
    }
}
