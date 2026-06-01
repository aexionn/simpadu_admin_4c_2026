<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RefreshTokenRequest;
use App\Models\User;
use App\Models\RefreshToken;
use App\Http\Resources\UserResource;
use App\Services\JwtService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(protected JwtService $jwtService){}

    /**
     * @unauthenticated
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $payload = $request->validated();

        $user = User::firstWhere('email', $payload["email"]);

        if (!$user || !Hash::check($payload["password"], $user->password)) {
            throw ValidationException::withMessages([
                "message" => [
                    "user not found"
                ]
            ]);
        }

       return $this->tokenResponse($user);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->bearerToken();

        if($token){
            $this->jwtService->revokeAccessToken($token);
            RefreshToken::where('id_user', $request->user()->getKey())->delete();
        }

        return $this->successMessage('Successfully logged out');
    }

    /**
     * @unauthenticated
     */
    public function refresh(RefreshTokenRequest $request): JsonResponse
    {
        $refreshToken = $request->input('refresh_token') ?? $request->bearerToken();

        if(!$refreshToken) {
            return $this->errorResponse("Refresh token is required", 400);
        }

        $payload = $this->jwtService->verifyToken($refreshToken);

        if (!$payload || ($payload->type ?? null) !== 'refresh') {
            return $this->errorResponse('Invalid refresh token', 401);
        }

        $stored = RefreshToken::where('id_user', $payload->sub)
            ->where('token_hash', $this->jwtService->hashToken($refreshToken))
            ->whereNull('revoked_at')
            ->where('expires_at', '>', now())
            ->first();
            
        if (!$stored) {
            $previouslyValid = RefreshToken::where('id_user', $payload->sub)
                ->where('token_hash', $this->jwtService->hashToken($refreshToken))
                ->whereNotNull('revoked_at')
                ->exists();

            if ($previouslyValid) {
                // True replay attempt — burn everything.
                RefreshToken::where('id_user', $payload->sub)->update(['revoked_at' => now()]);
            }

            return $this->errorResponse('Refresh token not found or expired', 401);
        }

        $user = User::find($payload->sub);

        if (!$user){
            return $this->errorResponse('User not found', 404);
        }
        $stored->update(['revoked_at' => now()]);

        return $this->tokenResponse($user);
    }

    private function tokenResponse(User $user): JsonResponse
    {
        return DB::transaction(function () use ($user) {
            [$refreshToken, $jti] = $this->jwtService->issueRefreshToken($user);

            RefreshToken::create([
                'id_user'    => $user->getKey(),
                'jti'        => $jti,
                'token_hash' => $this->jwtService->hashToken($refreshToken),
                'expires_at' => now()->addMinutes($this->jwtService->getRefreshTtl()),
            ]);

            return $this->successResponse([
                'access_token'  => $this->jwtService->issueAccessToken($user),
                'refresh_token' => $refreshToken,
                'token_type'    => 'Bearer',
                'expires_in'    => $this->jwtService->getTtl(),
                'user'          => new UserResource($user->load('roles')),
            ], 'Login Berhasil');
        });
    }
}
