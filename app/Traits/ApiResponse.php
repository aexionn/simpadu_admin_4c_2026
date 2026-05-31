<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;

trait ApiResponse
{
    protected function successResponse(
        mixed $data,
        string $message = 'Data berhasil diambil',
        int $status = 200,
        ?int $total = null
    ): JsonResponse {
        $response = [
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ];

        if ($total !== null) {
            $response['total'] = $total;
        }

        return response()->json($response, $status);
    }

    protected function successCollection(
        ResourceCollection|array $data,
        string $message = 'Data berhasil diambil',
        int $status = 200
    ): JsonResponse {
        $response = [
            'success' => true,
            'message' => $message,
            'total'   => $data instanceof ResourceCollection ? $data->count() : count($data),
            'data'    => $data,
        ];

        return response()->json($response, $status);
    }

    protected function successMessage(string $message, int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
        ], $status);
    }

    protected function errorResponse(string $message, int $status = 400, mixed $errors = null): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $status);
    }
}