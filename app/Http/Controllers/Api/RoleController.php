<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index(): JsonResponse
    {
        $roles = Role::select('id_role', 'role_name')->get();

        return $this->successCollection(
            RoleResource::collection($roles),
            'Roles retrieved successfully'
        );
    }

    public function store (Request $request): JsonResponse
    {
        $validated = $request->validate([
            'role_name' =>['required','string','unique:roles,role_name','max:255']
        ]);

        $role = Role::create($validated);

        return $this->successResponse(
            new RoleResource($role),
            'Role created successfully',
            201
        );
    }

    public function destroy(int $roleId): JsonResponse
    {
        $role = Role::findOrFail($roleId);
        
        DB::transaction(function () use ($role) {
            $role->users()->detach();
            $role->delete();
        });

        return $this->successMessage('Role deleted successfully');
    }

    public function assignToUser(Request $request, int $userId): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['required', 'string', 'exists:roles,role_name'],
        ]);

        $user = User::findOrFail($userId);
        $role = Role::where('role_name', $validated['role'])->first();
        $user->roles()->syncWithoutDetaching([$role->id_role]);

        return $this->successResponse(
            ['roles' => $user->roles->pluck('role_name')],
            "Role '{$role->role_name}' assigned to user successfully"
        );
    }

    public function revokeFromUser(Request $request, int $userId): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['required', 'string', 'exists:roles,role_name'],
        ]);

        $user = User::findOrFail($userId);
        $role = Role::where('role_name', $validated['role'])->first();
        $user->roles()->detach($role->id_role);

        return $this->successResponse(
            ['roles' => $user->roles->pluck('role_name')],
            "Role '{$role->role_name}' revoked from user successfully"
        );
    }
}
