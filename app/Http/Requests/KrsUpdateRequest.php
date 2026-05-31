<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class KrsUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'NAMA_KELAS' => 'sometimes|string|max:2',
            'NIM'        => 'sometimes|string|size:11',
            'SEMESTER'   => 'sometimes|integer|min:1|max:14',
        ];
    }
}