<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RuangUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id = $this->route('id');
        return [
            'nama_ruang' => 'sometimes|string|max:40|unique:ruang,nama_ruang,' . $id . ',id_ruang',
        ];
    }
}
