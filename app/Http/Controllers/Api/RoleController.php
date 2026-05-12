<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index(): JsonResponse
    {
        $roles = Role::select('id_roles', 'roles_name')->get();

        return response()->json([
            "roles" => $roles
        ]);
    }

    public function store (Request $request): JsonResponse
    {
        $validated = $request->validate([
            'role_name' =>['required','string','unique:roles,role_name','max:255']
        ]);

        $role = Role::create($validated);

        return response()->json([
            "message" => "Role created successfully",
            "role" => [
                'id_roles' => $role->getKey(),
                'role_name' => $role->role_name,
            ]
        ], 201);
    }

    public function assignToUser(Request $request, int $userId): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['required', 'string', 'exists:roles,role_name'],
        ]);

        $user = User::findOrFail($userId);
        $role = Role::where('role_name', $validated['role'])->first();

        $user->roles()->syncWithoutDetaching([$role->id_role]);

        return response()->json([
            "message" => "Role '{$role->role_name}' assigned to user successfully",
            'roles' => $user->roles->pluck('role_name'),
        ]);
    }

    public function revokeFromUser(Request $request, int $userId): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['required', 'string', 'exists:roles,role_name'],
        ]);

        $user = User::findOrFail($userId);
        $role = Role::where('role_name', $validated['role'])->first();

        $user->roles()->detach($role->id_role);

        return response()->json([
            "message" => "Role '{$role->role_name}' revoked from user successfully",
            'roles' => $user->roles->pluck('role_name'),
        ]);
    }
}
