<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class KabupatenUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id');

        return [
            'KODE_PROVINSI'  => 'sometimes|integer|exists:provinsi,KODE_PROVINSI',
            'NAMA_KABUPATEN' => 'sometimes|string|max:255',
        ];
    }
}
