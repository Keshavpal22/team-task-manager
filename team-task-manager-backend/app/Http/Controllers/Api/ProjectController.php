<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProjectController extends Controller
{
    /**
     * Display a listing of projects.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Project::with('creator:id,name,email');

        // Admin can see all projects.
        // Members can only see projects assigned to them.
        if ($user->role === 'member') {
            $query->whereHas('members', function ($q) use ($user) {
                $q->where('users.id', $user->id);
            });
        }

        $projects = $query
            ->latest()
            ->paginate(10);

        return response()->json([
            'message' => 'Projects retrieved successfully.',
            'data' => $projects,
        ]);
    }

    /**
     * Store a newly created project.
     */
    public function store(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Forbidden. Admin access required.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => [
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
                Rule::in([
                    'planning',
                    'active',
                    'completed',
                ]),
            ],
            'start_date' => [
                'nullable',
                'date',
            ],
            'due_date' => [
                'nullable',
                'date',
                'after_or_equal:start_date',
            ],
        ]);

        $validated['status'] = $validated['status'] ?? 'planning';
        $validated['created_by'] = $request->user()->id;

        $project = Project::create($validated);

        $project->load('creator:id,name,email');

        return response()->json([
            'message' => 'Project created successfully.',
            'data' => $project,
        ], 201);
    }

    /**
     * Display the specified project.
     */
    public function show(Request $request, Project $project): JsonResponse
    {
        $user = $request->user();

        // Member can only view projects assigned to them.
        if (
            $user->role === 'member' &&
            !$project->members()->where('users.id', $user->id)->exists()
        ) {
            return response()->json([
                'message' => 'Forbidden. You are not assigned to this project.',
            ], 403);
        }

        $project->load('creator:id,name,email');

        return response()->json([
            'message' => 'Project retrieved successfully.',
            'data' => $project,
        ]);
    }

    /**
     * Update the specified project.
     */
    public function update(Request $request, Project $project): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Forbidden. Admin access required.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],
            'description' => [
                'sometimes',
                'nullable',
                'string',
            ],
            'status' => [
                'sometimes',
                Rule::in([
                    'planning',
                    'active',
                    'completed',
                ]),
            ],
            'start_date' => [
                'sometimes',
                'nullable',
                'date',
            ],
            'due_date' => [
                'sometimes',
                'nullable',
                'date',
                'after_or_equal:start_date',
            ],
        ]);

        $project->update($validated);

        $project->load('creator:id,name,email');

        return response()->json([
            'message' => 'Project updated successfully.',
            'data' => $project,
        ]);
    }

    /**
     * Remove the specified project.
     */
    public function destroy(Request $request, Project $project): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Forbidden. Admin access required.',
            ], 403);
        }

        $project->delete();

        return response()->json([
            'message' => 'Project deleted successfully.',
        ]);
    }
}
