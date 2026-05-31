<?php

namespace App\Http\Requests;

use App\Rules\ProdiExists;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ProdiDosenUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'ID_PRODI'         => ['sometimes', 'integer', new ProdiExists],
            'NIP'              => 'sometimes|string|max:20',
        ];
    }
}
