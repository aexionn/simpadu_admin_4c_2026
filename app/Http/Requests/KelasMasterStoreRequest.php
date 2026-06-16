<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class KelasMasterStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'NO_ABSEN'          => 'required|integer|min:1',
            'ID_KELAS'          => 'required|integer|exists:kelas,ID_KELAS',
            'NIM'               => 'required|string|min:9|max:11',
            'NAMA_MAHASISWA'    => 'required|string|max:100',
            'ID_TAHUN_AKADEMIK' => 'required|integer|exists:tahun_akademik,ID_TAHUN_AKADEMIK',
            'STATUS_MHS'     => 'sometimes|in:Y,T',
        ];
    }
}
