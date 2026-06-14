<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NilaiUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'id_dosen'            => 'sometimes|integer',
            'nim'                 => 'sometimes|string|size:11',
            'id_kelas'            => 'sometimes|integer|exists:kelas,ID_KELAS',
            'id_mk'               => 'sometimes|integer|exists:mata_kuliah,ID_MK',
            'participation_score' => 'sometimes|numeric|min:0|max:100',
            'assignment_score'    => 'sometimes|numeric|min:0|max:100',
            'quiz_score'          => 'sometimes|numeric|min:0|max:100',
            'uts_score'           => 'sometimes|numeric|min:0|max:100',
            'uas_score'           => 'sometimes|numeric|min:0|max:100',
        ];
    }
}
