<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class KelasMasterUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'NO_ABSEN'          => 'sometimes|integer|min:1',
            'ID_KELAS'          => 'sometimes|integer|exists:kelas,ID_KELAS',
            'NIM'               => 'sometimes|string|size:11',
            'ID_TAHUN_AKADEMIK' => 'sometimes|integer|exists:tahun_akademik,ID_TAHUN_AKADEMIK',
            'ID_STATUS_MHS'     => 'nullable|integer',
        ];
    }
}
