<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PresensiMahasiswaUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'ID_KELAS_MASTER' => 'sometimes|integer|exists:kelas_master,ID_KELAS_MASTER',
            'ID_KELAS_MK'     => 'nullable|integer|exists:kelas_mk,ID_KELAS_MK',
            'NIM'             => 'sometimes|string|size:11',
            'WAKTU_PRESENSI'  => 'nullable|date_format:Y-m-d H:i:s',
            'PERTEMUAN_KE'    => 'nullable|integer|min:1',
            'STATUS_PRESENSI' => 'sometimes|in:H,I,S,A',
            'METODE'          => 'nullable|string|max:50',
        ];
    }
}
