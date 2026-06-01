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
            'NAMA_RUANG' => 'sometimes|string|max:40|unique:ruang,NAMA_RUANG,' . $id . ',id_ruang',
        ];
    }
}
