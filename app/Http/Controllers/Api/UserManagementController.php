<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\RegisterRequest;

class UserManagementController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $payload = $request->validated();

        if (User::firstWhere("email", $payload["email"])) {
            return response()->json([
                "errors" => [
                    "email" => [
                        "email already registered"
                    ]
                ]
            ], 400);
        }


        $user = User::create([
            "name" => $payload["name"],
            "email" => $payload["email"],
            "password" => Hash::make($payload["password"]),
            'is_active' => $payload["is_active"] ?? 'Y',
        ]);

        $role = Role::where('nama_role', $payload["role"])->first();
        $user->roles()->attach($role->id_role);

        return response()->json([
            "message" => "User registered successfully",
            "user" => [
                'id_user' => $user->getKey(),
                'name' => $user->name,
                'email' => $user->email,
                'is_active' => $user->is_active,
                'role' => $role->role_name,
            ]
        ], 201);
    }

    public function index(): JsonResponse
    {
        $users = User::with('roles')
            ->select('id_user', 'name', 'email', 'is_active', 'created_at', 'updated_at')
            ->get()
            ->map(function ($user) {
                return [
                    'id_user' => $user->id_user,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_active' => $user->is_active,
                    'roles' => $user->roles->pluck('role_name'),
                ];
            });
        
        return response()->json(['users' => $users]);
    }

    public function toggleActiveStatus(int $id_user):JsonResponse
    {
        $user = User::findOrFail($id_user);

        if ($user->id_user === auth('jwt')->user()->getKey()){
            return response()->json([
                'message' => 'You cannot change your own active status'
            ], 403);
        }

        $user->update([
            'is_active'=>$user->is_active == 'Y' ? 'T' : 'Y',
        ]);

        // if ($user->is_active == 'Y') {
        //     $user->update(['is_active' => 'T']);
        // } else {
        //     $user->update(['is_active' => 'Y']);
        // }

        return response()->json([
            'message' => 'User status updated',
            'id_user' => $user->id_user,
            'is_active' => $user->is_active,
        ]);
    }

    public function destroy(int $id_user): JsonResponse
    {
        $user = User::findOrFail($id_user);
        
        if ($user->id_user === auth('jwt')->user()->getKey()){
            return response()->json([
                'message' => 'You cannot delete your own account'
            ], 403);
        }

        $user->roles()->detach();
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully',
            'id_user' => $id_user,
        ]);
    }
}
