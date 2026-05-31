<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class KelasMkStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'ID_KELAS'         => 'required|integer|exists:kelas,ID_KELAS',
            'ID_KURIKULUM_MK'  => 'required|integer|exists:kurikulum_mk,ID_KURIKULUM_MK',
            'NIP'              => 'nullable|string|max:20',
            'ID_HARI'          => 'nullable|integer',
            'WAKTU_MULAI'      => 'nullable|date_format:H:i:s',
            'WAKTU_AKHIR'      => 'nullable|date_format:H:i:s',
            'ID_RUANG'         => 'required|integer',
            'TEMA'             => 'nullable|string|max:20',
            'DESKRIPSI'        => 'nullable|string',
        ];
    }
}
