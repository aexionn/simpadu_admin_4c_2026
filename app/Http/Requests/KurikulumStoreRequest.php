<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class KurikulumStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'ID_TAHUN_AKADEMIK' => 'required|integer|exists:tahun_akademik,ID_TAHUN_AKADEMIK',
            'NAMA_KURIKULUM'    => 'required|string|max:40',
            'CATATAN_KURIKULUM' => 'nullable|string',
            'AKTIF_KURIKULUM'   => 'required|in:Y,T'
        ];
    }
}