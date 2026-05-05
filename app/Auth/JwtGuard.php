<?php 

namespace App\Auth;

use App\Models\User;
use App\Services\JwtService;
use Illuminate\Auth\GuardHelpers;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Auth\UserProvider;
use Illuminate\Http\Request;

class JwtGuard implements Guard
{
    use GuardHelpers;

    protected Request $request;
    protected JwtService $jwtService;

    public function __construct(UserProvider $provider, Request $request, JwtService $jwtService)
    {
        $this->provider = $provider;
        $this->request = $request;
        $this->jwtService = $jwtService;
    }

    public function user(): ?user
    {
        if ($this->user !== null) {
            return $this->user;
        }

        $token = $this->request->bearerToken();

        if (!$token) {
            return null;
        }

        $payload = $this->jwtService->verifyToken($token);

        if (! $payload || ($payload->type ?? null) !== 'access') {
            return null;
        }

        $this->user = $this->provider->retrieveById($payload->sub);

        return $this->user;
    }

    public function validate(array $credentials = []): bool
    {
        $user = $this->provider->retrieveByCredentials($crediantials);

        if ($user && $this->provider->validateCredentials($user, $credentials)) {
            $this->user = $user;
            return true;
        }

        return false;
    }
}