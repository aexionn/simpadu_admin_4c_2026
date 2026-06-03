<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class jurusantoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): arrayP
    {
        return [
            'nama_jurusan' => 'required|string|max:255|unique:jurusan,nama_jurusan',
            'visi'         => 'nullable|string',
            'misi'         => 'nullable|string',
        ];
    }
}
