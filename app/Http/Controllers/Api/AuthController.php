<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\LoginRequest;
use App\Models\User;
use App\Models\RefreshToken;
use App\Services\JwtService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(JwtService $jwtService)
    {
        $this->jwtService = $jwtService;
    }

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
            $this->jwtService->revokeToken($token);
        }

        return response()->json([
            "message" => "Successfully logged out"
        ]);
    }

    public function refresh(Request $request): JsonResponse
    {
        $refreshToken = $request->input('refresh_token') ?? $request->bearerToken();

        if(!$refreshToken) {
            return response()->json([
                "errors" => [
                    "message" => [
                        "refresh token is required"
                    ]
                ]
            ], 422);
        }

        $payload = $this->jwtService->verifyToken($refreshToken);

        if (!$payload || ($payload->type ?? null) !== 'refresh') {
            return response()->json([
                "errors" => [
                    "message" => [
                        "invalid refresh token"
                    ]
                ]
            ], 401);
        }

        $user = User::find($payload->sub);

        if (!$user){
            return response()->json([
                "errors" => [
                    "message" => [
                        "user not found"
                    ]
                ]
            ], 404);
        }

        return $this->tokenResponse($user);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    private function tokenResponse(User $user, int $status = 200): JsonResponse
    {
        $refreshToken = $this->jwtService->issueRefreshToken($user);
        
        $refresh = RefreshToken::create([
            "user_id" => $user->id_user,
            "token" => $refreshToken,
            "expires_at" => now()->addMinutes($this->jwtService->getRefreshTtl()),
        ]);
        
        return response()->json([
            'access_token'  => $this->jwtService->issueAccessToken($user),
            'refresh_token' => $refreshToken,
            'token_type'    => 'Bearer',
            'expires_in'    => $this->jwtService->getTtl(),
            'user'          => $user,
        ], $status);
    }
}
