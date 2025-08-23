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
 *         description="Task ID",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="title",
 *         type="string",
 *         maxLength=150,
 *         description="Task title",
 *         example="Complete project documentation"
 *     ),
 *     @OA\Property(
 *         property="description",
 *         type="string",
 *         nullable=true,
 *         description="Task description",
 *         example="Write comprehensive documentation for the project"
 *     ),
 *     @OA\Property(
 *         property="status",
 *         type="string",
 *         enum={"pending", "inProgress", "done"},
 *         description="Task status",
 *         example="pending"
 *     ),
 *     @OA\Property(
 *         property="status_label",
 *         type="string",
 *         description="Human-readable status label",
 *         example="Pending"
 *     ),
 *     @OA\Property(
 *         property="is_done",
 *         type="boolean",
 *         description="Whether the task is completed",
 *         example=false
 *     ),
 *     @OA\Property(
 *         property="created_at",
 *         type="string",
 *         format="date-time",
 *         description="Creation timestamp in ISO format",
 *         example="2024-06-01T12:00:00.000Z"
 *     ),
 *     @OA\Property(
 *         property="updated_at",
 *         type="string",
 *         format="date-time",
 *         description="Last update timestamp in ISO format",
 *         example="2024-06-01T12:00:00.000Z"
 *     ),
 *     @OA\Property(
 *         property="created_at_human",
 *         type="string",
 *         description="Human-readable creation date",
 *         example="2 hours ago"
 *     ),
 *     @OA\Property(
 *         property="updated_at_human",
 *         type="string",
 *         description="Human-readable update date",
 *         example="1 hour ago"
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
