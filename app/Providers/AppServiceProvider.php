<?php

namespace App\Providers;

use App\Extensions\ApiOperationDescriptionExtension;
use App\Extensions\ApiResponseEnvelopeExtension;
use Illuminate\Support\ServiceProvider;
use Dedoc\Scramble\Scramble;
use Dedoc\Scramble\Support\Generator\OpenApi;
use Dedoc\Scramble\Support\Generator\SecurityScheme;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // ── Global API response envelope ──────────────────────────────────────
        Scramble::registerExtension(ApiResponseEnvelopeExtension::class);
        Scramble::configure()->withOperationTransformers(ApiOperationDescriptionExtension::class);

        // ── JWT bearer security scheme ────────────────────────────────────────
        Scramble::configure()
            ->withDocumentTransformers(function (OpenApi $openApi) {
                $openApi->secure(
                    SecurityScheme::http('bearer', 'JWT')
                );
            });
    }
}
