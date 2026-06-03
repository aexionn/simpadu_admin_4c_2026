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
            'NIP'             => 'sometimes|string|max:20',
            'STATUS_PRESENSI' => 'sometimes|in:H,I,S,A',
            'WAKTU_MASUK'     => 'nullable|date_format:H:i',
            'WAKTU_KELUAR'    => 'nullable|date_format:H:i|after:WAKTU_MASUK',
            'TANGGAL'         => 'sometimes|date',
            'KETERANGAN'      => 'nullable|string',
        ];
    }
}
