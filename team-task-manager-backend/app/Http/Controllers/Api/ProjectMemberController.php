<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectMemberController extends Controller
{
    /**
     * Get all members assigned to a project.
     */
    public function index(Project $project): JsonResponse
    {
        $members = $project->members()
            ->select('users.id', 'users.name', 'users.email', 'users.role')
            ->orderBy('users.name')
            ->get();

        return response()->json([
            'message' => 'Project members retrieved successfully.',
            'data' => $members,
        ]);
    }

    /**
     * Assign a member to a project.
     */
    public function store(Request $request, Project $project): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => [
                'required',
                'integer',
                'exists:users,id',
            ],
        ]);

        $user = User::findOrFail($validated['user_id']);

        if ($user->role !== 'member') {
            return response()->json([
                'message' => 'Only members can be assigned to projects.',
            ], 422);
        }

        if ($project->members()->where('users.id', $user->id)->exists()) {
            return response()->json([
                'message' => 'User is already assigned to this project.',
            ], 422);
        }

        $project->members()->attach($user->id, [
            'assigned_at' => now(),
        ]);

        return response()->json([
            'message' => 'Member assigned successfully.',
            'data' => $user,
        ], 201);
    }

    /**
     * Remove a member from a project.
     */
    public function destroy(Project $project, User $user): JsonResponse
    {
        if (!$project->members()->where('users.id', $user->id)->exists()) {
            return response()->json([
                'message' => 'User is not assigned to this project.',
            ], 404);
        }

        $project->members()->detach($user->id);

        return response()->json([
            'message' => 'Member removed successfully.',
        ]);
    }

    /**
     * Get all users having member role.
     */
    public function availableMembers(): JsonResponse
    {
        $members = User::where('role', 'member')
            ->select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->get();

        return response()->json([
            'message' => 'Available members retrieved successfully.',
            'data' => $members,
        ]);
    }
}
