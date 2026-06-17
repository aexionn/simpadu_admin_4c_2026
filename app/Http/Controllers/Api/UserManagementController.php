<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\Role;
use App\Models\LogAktivitas;
use App\Enums\StatusAktif;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UserUpdateRequest;

class UserManagementController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $payload = $request->validated();

        $user = DB::transaction(function () use ($payload) {
            $user = User::create([
                'email'     => $payload['email'],
                'name'      => $payload['name'],
                'password'  => Hash::make($payload['password']),
                'is_active' => $payload['is_active'] ?? 'Y',
            ]);

            $role = Role::where('role_name', $payload['role'])->firstOrFail();
            $user->roles()->syncWithoutDetaching([$role->getKey()]);

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

    public function update(UserUpdateRequest $request, int $id_user): JsonResponse
    {
        $user = User::findOrFail($id_user);
        $old = ['name' => $user->name, 'email' => $user->email, 'is_active' => $user->is_active];
        $validated = $request->validated();

        DB::transaction(function () use ($user, $validated, $old) {
            $user->update($validated);

            // Force logout when deactivated
            $newActive = $validated['is_active'] ?? $old['is_active'];
            if ($newActive === StatusAktif::TidakAktif->value) {
                $user->refreshTokens()->delete();
            }

            // Append-only audit log
            LogAktivitas::create([
                'TIPE_AKTIVITAS'  => 'UPDATE_USER',
                'PESAN'           => sprintf(
                    'Data user (%s %s) diperbarui',
                    $old['email'],
                    $old['name']
                ),
                'ENTITAS_TERKAIT' => 'users:' . $user->id_user,
            ]);
        });

        return $this->successResponse(
            new UserResource($user->fresh()->load('roles')),
            'User updated successfully'
        );
    }

    public function toggleActiveStatus(int $id_user): JsonResponse
    {
        $user = User::findOrFail($id_user);

        if ($user->id_user === auth('jwt')->user()->getKey()) {
            return $this->errorResponse('You cannot change your own active status', 403);
        }

        DB::transaction(function () use ($user) {
            $newStatus = $user->is_active == StatusAktif::Aktif->value
                ? StatusAktif::TidakAktif->value
                : StatusAktif::Aktif->value;

            $user->update(['is_active' => $newStatus]);

            // Force logout if deactivated
            if ($newStatus === StatusAktif::TidakAktif->value) {
                $user->refreshTokens()->delete();
            }

            LogAktivitas::create([
                'TIPE_AKTIVITAS'  => 'TOGGLE_USER_STATUS',
                'PESAN'           => sprintf(
                    'Status user %s (%s) diubah menjadi %s',
                    $user->email,
                    $user->name,
                    $newStatus === StatusAktif::Aktif->value ? 'Aktif' : 'Tidak Aktif'
                ),
                'ENTITAS_TERKAIT' => 'users:' . $user->id_user,
            ]);
        });

        return $this->successResponse(
            new UserResource($user->fresh()->load('roles')),
            'User status updated'
        );
    }

    public function destroy(int $id_user): JsonResponse
    {
        $user = User::findOrFail($id_user);

        if ($user->id_user === auth('jwt')->user()->getKey()) {
            return $this->errorResponse('You cannot delete your own account', 403);
        }

        DB::transaction(function () use ($user) {
            $user->refreshTokens()->delete();
            $user->delete();  // soft delete

            LogAktivitas::create([
                'TIPE_AKTIVITAS'  => 'SOFT_DELETE_USER',
                'PESAN'           => sprintf(
                    'User %s (%s) dihapus (soft delete)',
                    $user->email,
                    $user->name
                ),
                'ENTITAS_TERKAIT' => 'users:' . $user->id_user,
            ]);
        });

        return $this->successMessage('User deleted successfully');
    }

    // ── Soft Delete Management ─────────────────────────────────────────────────

    public function trashed(): JsonResponse
    {
        $users = User::onlyTrashed()
            ->with('roles')
            ->select('id_user', 'name', 'email', 'is_active', 'created_at', 'updated_at', 'deleted_at')
            ->get();

        return $this->successCollection(
            UserResource::collection($users),
            'Trashed users retrieved successfully'
        );
    }

    public function restore(int $id_user): JsonResponse
    {
        $user = User::onlyTrashed()->findOrFail($id_user);

        DB::transaction(function () use ($user) {
            $user->restore();

            LogAktivitas::create([
                'TIPE_AKTIVITAS'  => 'RESTORE_USER',
                'PESAN'           => sprintf(
                    'User %s (%s) dipulihkan',
                    $user->email,
                    $user->name
                ),
                'ENTITAS_TERKAIT' => 'users:' . $user->id_user,
            ]);
        });

        return $this->successResponse(
            new UserResource($user->fresh()->load('roles')),
            'User restored successfully'
        );
    }

    public function forceDelete(int $id_user): JsonResponse
    {
        $user = User::onlyTrashed()->findOrFail($id_user);

        DB::transaction(function () use ($user) {
            $user->roles()->detach();
            $user->refreshTokens()->delete();

            // Store info for log before deleting
            $email = $user->email;
            $name  = $user->name;
            $id    = $user->id_user;

            $user->forceDelete();

            LogAktivitas::create([
                'TIPE_AKTIVITAS'  => 'FORCE_DELETE_USER',
                'PESAN'           => sprintf(
                    'User %s (%s) dihapus permanen',
                    $email,
                    $name
                ),
                'ENTITAS_TERKAIT' => 'users:' . $id,
            ]);
        });

        return $this->successMessage('User permanently deleted');
    }
}
