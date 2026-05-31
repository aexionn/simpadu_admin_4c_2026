<?php

namespace App\Http\Requests;

use App\Rules\ProdiExists;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ProdiDosenStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'ID_PRODI'         => ['required', 'integer', new ProdiExists],
            'NIP'              => 'required|string|max:20',
        ];
    }
}
