<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProvinsiUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id');

        return [
            'NAMA_PROVINSI' => 'sometimes|string|max:255|unique:provinsi,NAMA_PROVINSI,' . $id . ',KODE_PROVINSI',
        ];
    }
}
