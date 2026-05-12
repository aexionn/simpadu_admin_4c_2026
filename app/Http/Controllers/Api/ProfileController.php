<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->load('roles');

        return response()->json([
            'user' => [
                'id_user' => $user->id_user,
                'email' => $user->email,
                'is_active' => $user->is_active,
                'roles' => $user->roles->pluck('nama_role'),
            ]
        ]);
    }

    public function changeEmail(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'email' => ['required', 'email', Rule::unique('user', 'email')->ignore($user->getKey(), 'id_user')],
        ]);

        $user->update([
            'email' => $validated['email'],
        ]);

        return response()->json([
            'message' => 'Email updated successfully',
            'user' => [
                'email' => $user->email
            ] 
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8', 'confirmed', 'different:current:password'],
        ]);

        if (!\Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect',
            ], 422);
        }

        $user->update([
            'password' => \Hash::make($validated['new_password']),
        ]);

        return response()->json([
            'message' => 'Password updated successfully, please login again',
        ]);
    }
}
