<?php
namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;
use App\Models\User;
use stdClass;

class JwtService
{
    protected string $secret;
    protected string $algo;
    protected int $ttl;
    protected int $refresh_ttl;
    protected string $issuer;

    public function __construct()
    {
        $this->secret = config('jwt.secret');
        $this->algo = config('jwt.algo');
        $this->ttl = config('jwt.ttl');
        $this->refresh_ttl = config('jwt.refresh_ttl');
        $this->issuer = config('jwt.issuer');
    }

    public function issueAccessToken(User $user): string
    {
        $now = time();

        $payload = [
            'iss' => $this->issuer,
            'sub' => $user->id_user,
            'iat' => $now,
            'exp' => $now + $this->ttl,
            'type' => 'access',
            'email' => $user->email,
        ];

        return JWT::encode($payload, $this->secret, $this->algo);
    }

    public function issueRefreshToken(User $user): string
    {
        $now = time();

        $payload = [
            'iss' => $this->issuer,
            'sub' => $user->id_user,
            'iat' => $now,
            'exp' => $now + $this->refresh_ttl,
            'type' => 'refresh',
        ];

        return JWT::encode($payload, $this->secret, $this->algo);
    }

    public function verifyToken(string $token): stdClass
    {
        try {
            return JWT::decode($token, new Key($this->secret, $this->algo));
        } catch (ExpiredException $e) {
            throw new ExpiredException('Token has expired');
        } catch (SignatureInvalidException $e) {
            throw new SignatureInvalidException('Invalid token signature');
        } catch (\Exception $e) {
            throw new \Exception('Token verification failed: ' . $e->getMessage());
        }
    }

    public function refreshAccessToken(string $refreshToken): string
    {
        $payload = $this->verifyToken($refreshToken);

        if ($payload->type !== 'refresh') {
            throw new \Exception('Invalid token type');
        } 

        $user = User::find($payload->sub);

        if (!$user) {
            throw new \Exception('User not found');
        }

        return $this->issueAccessToken($user);
    }

    public function getTtl(): int
    {
        return $this->ttl;
    }
}