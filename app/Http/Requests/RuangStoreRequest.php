<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RuangStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'NAMA_RUANG' => 'required|string|max:40|unique:ruang,NAMA_RUANG',
        ];
    }
}
