<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class KrsStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'NAMA_KELAS' => 'required|string|max:2',
            'NIM'        => 'required|string|size:11',
            'SEMESTER'   => 'required|integer|min:1|max:14',
        ];
    }
}