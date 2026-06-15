<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class KhsUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'SEMESTER' => 'sometimes|integer|min:1|max:14',
            'NIM'      => 'sometimes|string|max:11',
            'IPS'      => 'nullable|numeric|min:0|max:4',
            'IPK'      => 'nullable|numeric|min:0|max:4',
        ];
    }
}