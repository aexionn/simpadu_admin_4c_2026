<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class NilaiUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'ID_KHS'      => 'sometimes|integer|exists:khs,ID_KHS',
            'ID_MK'       => 'sometimes|integer|exists:mata_kuliah,ID_MK',
            'TOTAL_NILAI' => 'nullable|numeric|min:0',
            'NILAI_HURUF' => 'nullable|in:A,AB,B,BC,C,D,E',
            'NIM'         => 'sometimes|string|size:11',
        ];
    }
}
