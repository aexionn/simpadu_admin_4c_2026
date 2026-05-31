<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\Role;
use App\Enums\StatusAktif;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\RegisterRequest;

class UserManagementController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $payload = $request->validated();

        $user = DB::transaction(function () use ($payload) {
            $user = User::create([
                'name'      => $payload['name'],
                'email'     => $payload['email'],
                'password'  => Hash::make($payload['password']),
                'is_active' => $payload['is_active'] ?? 'Y',
            ]);

            $role = Role::where('role_name', $payload['role'])->firstOrFail();
            $user->roles()->attach($role->getKey());

            return $user->load('roles');
        });

        return $this->successResponse(
            new UserResource($user),
            'User registered successfully',
            201
        );
    }

    public function index(): JsonResponse
    {
        $users = User::with('roles')
            ->select('id_user', 'name', 'email', 'is_active', 'created_at', 'updated_at')
            ->get();
        
        return $this->successCollection(
            UserResource::collection($users),
            'Users retrieved successfully'
        );
    }

    public function toggleActiveStatus(int $id_user):JsonResponse
    {
        $user = User::findOrFail($id_user);

        if ($user->id_user === auth('jwt')->user()->getKey()){
            return $this->errorResponse('You cannot change your own active status', 403);
        }

        $user->update([
            'is_active'=>$user->is_active == StatusAktif::Aktif ? 'T' : 'Y',
        ]);

        return $this->successResponse(
            new UserResource($user->fresh()->load('roles')),
            'User status updated'
        );
    }

    public function destroy(int $id_user): JsonResponse
    {
        $user = User::findOrFail($id_user);
        
        if ($user->id_user === auth('jwt')->user()->getKey()){
            return $this->errorResponse('You cannot delete your own account', 403);
        }

        DB::transaction(function () use ($user) {
            $user->roles()->detach();
            $user->refreshTokens()->delete();
            $user->delete();
        });

        return $this->successMessage('User deleted successfully');
    }
}
