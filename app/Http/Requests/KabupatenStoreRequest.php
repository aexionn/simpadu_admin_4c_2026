<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class KabupatenStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'KODE_KABUPATEN' => 'required|integer|unique:kabupaten,KODE_KABUPATEN',
            'KODE_PROVINSI'  => 'required|integer|exists:provinsi,KODE_PROVINSI',
            'NAMA_KABUPATEN' => 'required|string|max:255',
        ];
    }
}
