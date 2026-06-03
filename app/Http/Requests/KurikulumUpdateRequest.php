<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class KurikulumUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'ID_TAHUN_AKADEMIK' => 'sometimes|integer|exists:tahun_akademik,ID_TAHUN_AKADEMIK',
            'NAMA_KURIKULUM'    => 'sometimes|string|max:40',
            'CATATAN_KURIKULUM' => 'nullable|string',
            'AKTIF_KURIKULUM'   => 'sometimes|in:Y,T',
            'superseded_at'     => 'sometimes|date'
        ];
    }
}