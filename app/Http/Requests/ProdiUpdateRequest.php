<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ProdiUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id = $this->route('id');
        return [
            'nama_prodi'  => 'sometimes|string|max:100|unique:prodi,nama_prodi,' . $id . ',id_prodi',
            'jenjang'     => 'sometimes|string|max:50',
            'id_jurusan'  => 'sometimes|integer|exists:jurusan,id_jurusan',
            'visi'        => 'nullable|string',
        ];
    }
}
