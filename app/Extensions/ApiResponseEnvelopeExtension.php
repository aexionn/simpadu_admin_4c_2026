<?php

namespace App\Extensions;

use Dedoc\Scramble\Extensions\OperationExtension;
use Dedoc\Scramble\Support\Generator\Operation;
use Dedoc\Scramble\Support\Generator\Reference;
use Dedoc\Scramble\Support\Generator\Response;
use Dedoc\Scramble\Support\Generator\Schema;
use Dedoc\Scramble\Support\Generator\Types as OpenApiTypes;
use Dedoc\Scramble\Support\RouteInfo;

/**
 * Globally wraps all API controller responses with the standard
 * envelope structure defined in App\Traits\ApiResponse.
 *
 * ── Behavior ────────────────────────────────────────────────────────────
 * - If a 2xx response already contains a `success` property (e.g. it was
 *   produced by one of the trait methods), the response is left untouched.
 * - All other 2xx responses are wrapped in:
 *       { success: true, message: string, data: <original_schema> }
 * - All 4xx/5xx responses are wrapped in:
 *       { success: false, message: string, errors: object }
 *
 * Register via Scramble::registerExtension() or config('scramble.extensions').
 */
class ApiResponseEnvelopeExtension extends OperationExtension
{
    public function handle(Operation $operation, RouteInfo $routeInfo): void
    {
        if ($operation->responses === null) {
            return;
        }

        foreach ($operation->responses as $response) {
            if ($response instanceof Reference) {
                continue;
            }

            $this->wrapIfNeeded($response);
        }
    }

    /**
     * Inspect a single Response object and wrap its content schema
     * when it does not already carry the API envelope.
     */
    private function wrapIfNeeded(Response $response): void
    {
        $content = $response->getContent('application/json');

        if (! $content) {
            return;
        }

        // Resolve the underlying OpenApi type (follows $ref if needed)
        $responseType = $this->resolveType($content);

        // Already carries the envelope — nothing to do.
        if ($responseType instanceof OpenApiTypes\ObjectType
            && $responseType->hasProperty('success')) {
            return;
        }

        $code = $response->code;

        if ($code >= 200 && $code < 300) {
            $this->applySuccessEnvelope($response, $content);
        } elseif ($code >= 400) {
            $this->applyErrorEnvelope($response, $content);
        }
    }

    /**
     * Wrap a 2xx response in { success: true, message: string, data: … }.
     *
     * The original content schema is placed verbatim inside the `data` field
     * so the response shape is preserved.
     */
    private function applySuccessEnvelope(Response $response, Schema|Reference $originalContent): void
    {
        $envelope = new OpenApiTypes\ObjectType;
        $envelope
            ->addProperty('success', (new OpenApiTypes\BooleanType)->const(true))
            ->addProperty('message', new OpenApiTypes\StringType)
            ->addProperty('data', $originalContent->type)
            ->setRequired(['success', 'message', 'data']);

        $response->setContent('application/json', Schema::fromType($envelope));
    }

    /**
     * Wrap a 4xx/5xx response in { success: false, message: string, errors: … }.
     *
     * The original error-body schema (e.g. validation error detail) is placed
     * inside the `errors` field so that Scramble's structured exception
     * responses (422, 401, 403, 404, …) are preserved rather than replaced.
     */
    private function applyErrorEnvelope(Response $response, Schema|Reference $originalContent): void
    {
        $envelope = new OpenApiTypes\ObjectType;
        $envelope
            ->addProperty('success', (new OpenApiTypes\BooleanType)->const(false))
            ->addProperty('message', new OpenApiTypes\StringType)
            ->addProperty('errors', $originalContent->type)
            ->setRequired(['success', 'message']);

        $response->setContent('application/json', Schema::fromType($envelope));
    }

    /**
     * Return the OpenApiType held by a Schema or resolve it through a Reference.
     */
    private function resolveType(Schema|Reference $content): OpenApiTypes\Type|Reference
    {
        $type = $content instanceof Schema ? $content->type : $content;

        if ($type instanceof Reference) {
            $resolved = $type->resolve();

            return $resolved instanceof Schema ? $resolved->type : $type;
        }

        return $type;
    }
}
