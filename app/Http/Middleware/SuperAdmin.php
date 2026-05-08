<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SuperAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user){
            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        }

        if ($user->is_active !== 'Y'){
            return response()->json([
                'message' => 'Your account is inactive',
            ], 403);
        }

        if (!$user->hasRole('superadmin')) {
            return response()->json([
                'message' => 'Forbidden',
            ], 403);
        }

        return $next($request);
    }
}
