<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AbsensiPegawaiStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'NIP'             => 'required|string|max:20',
            'STATUS_PRESENSI' => 'required|in:H,I,S,A',
            'WAKTU_MASUK'     => 'nullable|date_format:H:i',
            'WAKTU_KELUAR'    => 'nullable|date_format:H:i|after:WAKTU_MASUK',
            'TANGGAL'         => 'required|date',
            'KETERANGAN'      => 'nullable|string',
        ];
    }
}
