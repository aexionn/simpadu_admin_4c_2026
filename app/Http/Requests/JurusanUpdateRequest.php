<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class JurusanUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id = $this->route('id');
        return [
            'nama_jurusan' => 'sometimes|string|max:255|unique:jurusan,nama_jurusan,' . $id . ',id_jurusan',
            'visi'         => 'nullable|string',
            'misi'         => 'nullable|string',
        ];
    }
}
