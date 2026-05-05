<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
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
        ]);

        return $this->tokenResponse($user, 201);
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

    public function refresh(Request $request): JsonResponse
    {
        $refrreshToken = $request->input('refresh_token') ?? $request->bearerToken();

        if(!$refrreshToken) {
            return response()->json([
                "errors" => [
                    "message" => [
                        "refresh token is required"
                    ]
                ]
            ], 422);
        }

        $payload = $this->jwtService->verifyToken($refrreshToken);

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
        return response()->json([
            'access_token'  => $this->jwtService->issueAccessToken($user),
            'refresh_token' => $this->jwtService->issueRefreshToken($user),
            'token_type'    => 'Bearer',
            'expires_in'    => $this->jwtService->getTtl(),
            'user'          => $user,
        ], $status);
    }
}
