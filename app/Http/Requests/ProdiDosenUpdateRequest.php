<?php

namespace App\Http\Requests;

use App\Rules\ProdiExist;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ProdiDosenUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'ID_PRODI'         => ['sometimes', 'integer', new ProdiExist],
            'NIP'              => 'sometimes|string|max:20',
        ];
    }
}
