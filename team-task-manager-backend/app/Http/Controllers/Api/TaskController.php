<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    /**
     * Get tasks.
     *
     * Admin:
     * - Can see all tasks.
     *
     * Member:
     * - Can see only tasks assigned to them.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Task::with([
            'project:id,name',
            'assignee:id,name,email',
            'creator:id,name,email',
        ])->latest();

        if ($user->role !== 'admin') {
            $query->where('assigned_to', $user->id);
        }

        $tasks = $query->paginate(10);

        return response()->json([
            'message' => 'Tasks retrieved successfully.',
            'data' => $tasks,
        ]);
    }

    /**
     * Create a task.
     * Admin only.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => [
                'required',
                'integer',
                'exists:projects,id',
            ],

            'assigned_to' => [
                'nullable',
                'integer',
                'exists:users,id',
            ],

            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'status' => [
                'nullable',
                'in:todo,in_progress,completed',
            ],

            'priority' => [
                'nullable',
                'in:low,medium,high',
            ],

            'due_date' => [
                'nullable',
                'date',
            ],
        ]);

        $project = Project::findOrFail(
            $validated['project_id']
        );

        // If a member is assigned, make sure
        // that member belongs to this project.
        if (!empty($validated['assigned_to'])) {
            $isMember = $project->members()
                ->where('users.id', $validated['assigned_to'])
                ->exists();

            if (!$isMember) {
                return response()->json([
                    'message' => 'User must be a member of this project.',
                ], 422);
            }
        }

        $task = Task::create([
            ...$validated,
            'created_by' => $request->user()->id,
            'status' => $validated['status'] ?? 'todo',
            'priority' => $validated['priority'] ?? 'medium',
        ]);

        $task->load([
            'project:id,name',
            'assignee:id,name,email',
            'creator:id,name,email',
        ]);

        return response()->json([
            'message' => 'Task created successfully.',
            'data' => $task,
        ], 201);
    }

    /**
     * Get a single task.
     */
    public function show(Request $request, Task $task): JsonResponse
    {
        $user = $request->user();

        if (
            $user->role !== 'admin' &&
            $task->assigned_to !== $user->id
        ) {
            return response()->json([
                'message' => 'Forbidden. You can only view your assigned tasks.',
            ], 403);
        }

        $task->load([
            'project:id,name',
            'assignee:id,name,email',
            'creator:id,name,email',
        ]);

        return response()->json([
            'message' => 'Task retrieved successfully.',
            'data' => $task,
        ]);
    }

    /**
     * Update a task.
     *
     * Admin can update everything.
     * Member can only update status of their task.
     */
    public function update(
        Request $request,
        Task $task
    ): JsonResponse {
        $user = $request->user();

        // -------------------------------
        // MEMBER
        // -------------------------------

        if ($user->role !== 'admin') {
            if ($task->assigned_to !== $user->id) {
                return response()->json([
                    'message' => 'Forbidden. You can only update your assigned tasks.',
                ], 403);
            }

            $validated = $request->validate([
                'status' => [
                    'required',
                    'in:todo,in_progress,completed',
                ],
            ]);

            $task->update([
                'status' => $validated['status'],
            ]);
        }

        // -------------------------------
        // ADMIN
        // -------------------------------

        else {
            $validated = $request->validate([
                'project_id' => [
                    'sometimes',
                    'required',
                    'integer',
                    'exists:projects,id',
                ],

                'assigned_to' => [
                    'nullable',
                    'integer',
                    'exists:users,id',
                ],

                'title' => [
                    'sometimes',
                    'required',
                    'string',
                    'max:255',
                ],

                'description' => [
                    'nullable',
                    'string',
                ],

                'status' => [
                    'sometimes',
                    'required',
                    'in:todo,in_progress,completed',
                ],

                'priority' => [
                    'sometimes',
                    'required',
                    'in:low,medium,high',
                ],

                'due_date' => [
                    'nullable',
                    'date',
                ],
            ]);

            $projectId =
                $validated['project_id']
                ?? $task->project_id;

            $project = Project::findOrFail($projectId);

            if (
                array_key_exists('assigned_to', $validated) &&
                !empty($validated['assigned_to'])
            ) {
                $isMember = $project->members()
                    ->where(
                        'users.id',
                        $validated['assigned_to']
                    )
                    ->exists();

                if (!$isMember) {
                    return response()->json([
                        'message' => 'User must be a member of this project.',
                    ], 422);
                }
            }

            $task->update($validated);
        }

        $task->load([
            'project:id,name',
            'assignee:id,name,email',
            'creator:id,name,email',
        ]);

        return response()->json([
            'message' => 'Task updated successfully.',
            'data' => $task,
        ]);
    }

    /**
     * Delete a task.
     * Admin only.
     */
    public function destroy(
        Request $request,
        Task $task
    ): JsonResponse {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Forbidden. Admin access required.',
            ], 403);
        }

        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully.',
        ]);
    }
}
