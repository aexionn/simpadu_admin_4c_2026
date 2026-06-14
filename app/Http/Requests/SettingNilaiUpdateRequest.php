<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SettingNilaiUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'id_dosen'      => 'sometimes|integer',
            'id_kelas'      => 'sometimes|integer|exists:kelas,ID_KELAS',
            'id_mk'         => 'sometimes|integer|exists:mata_kuliah,ID_MK',
            'participation' => 'sometimes|numeric|min:0|max:100',
            'assignment'    => 'sometimes|numeric|min:0|max:100',
            'quiz'          => 'sometimes|numeric|min:0|max:100',
            'uts'           => 'sometimes|numeric|min:0|max:100',
            'uas'           => 'sometimes|numeric|min:0|max:100',
        ];
    }
}
