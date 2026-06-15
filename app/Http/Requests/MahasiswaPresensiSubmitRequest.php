<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MahasiswaPresensiSubmitRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'id_kelas_master' => 'required|integer|exists:kelas_master,ID_KELAS_MASTER',
            'id_kelas_mk'     => 'required|integer|exists:kelas_mk,ID_KELAS_MK',
            'nim'             => 'required|string|max:11',
            'pertemuan_ke'    => 'required|integer|min:1',
        ];
    }
}
