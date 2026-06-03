<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class proditoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'nama_prodi'  => 'required|string|max:100|unique:prodi,nama_prodi',
            'jenjang'     => 'required|string|max:50',
            'id_jurusan'  => 'required|integer|exists:jurusan,id_jurusan',
            'visi'        => 'nullable|string',
        ];
    }
}
