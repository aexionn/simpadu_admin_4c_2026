<?php

namespace App\Rules;

use App\Services\ProdiClientService;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

class ProdiExists implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  Closure(string, ?string=): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $service = app(ProdiClientService::class);

        if ($service->getProdi((int) $value) === null) {
            $fail('The selected prodi is invalid.');
        }
    }
}