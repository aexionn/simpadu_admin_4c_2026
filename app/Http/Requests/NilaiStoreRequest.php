<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class NilaiStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'ID_KHS'      => 'required|integer|exists:khs,ID_KHS',
            'ID_MK'       => 'required|integer|exists:mata_kuliah,ID_MK',
            'TOTAL_NILAI' => 'nullable|numeric|min:0',
            'NILAI_HURUF' => 'nullable|in:A,AB,B,BC,C,D,E',
            'NIM'         => 'required|string|size:11',
        ];
    }
}
