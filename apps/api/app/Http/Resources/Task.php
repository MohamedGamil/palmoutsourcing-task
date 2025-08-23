<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class Task extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'status_label' => $this->getStatusLabel(),
            'is_done' => $this->isDone(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'created_at_human' => $this->created_at?->diffForHumans(),
            'updated_at_human' => $this->updated_at?->diffForHumans(),
        ];
    }

    /**
     * Get human-readable status label
     */
    private function getStatusLabel(): string
    {
        return match ($this->status) {
            'pending' => 'Pending',
            'inProgress' => 'In Progress',
            'done' => 'Done',
            default => ucfirst($this->status),
        };
    }
}
