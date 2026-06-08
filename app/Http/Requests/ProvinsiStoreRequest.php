<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProvinsiStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'KODE_PROVINSI' => 'required|integer|unique:provinsi,KODE_PROVINSI',
            'NAMA_PROVINSI' => 'required|string|max:255|unique:provinsi,NAMA_PROVINSI',
        ];
    }
}
