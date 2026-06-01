<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class HariUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id = $this->route('id');
        return [
            'NAMA_HARI' => 'sometimes|string|size:6|unique:hari,NAMA_HARI,' . $id . ',id_hari',
        ];
    }
}
