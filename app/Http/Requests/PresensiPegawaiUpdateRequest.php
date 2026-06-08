<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PresensiPegawaiUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'ID_USER'         => 'sometimes|integer|exists:users,id_user',
            'STATUS_PRESENSI' => 'sometimes|in:H,I,S,A',
            'WAKTU_MASUK'     => 'nullable|date_format:H:i:s',
            'WAKTU_KELUAR'    => 'nullable|date_format:H:i:s|after:WAKTU_MASUK',
            'TANGGAL'         => 'sometimes|date_format:Y-m-d',
            'KETERANGAN'      => 'nullable|string',
        ];
    }
}
