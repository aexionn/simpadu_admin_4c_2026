<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NilaiStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'id_dosen'            => 'required|integer',
            'nim'                 => 'required|string|size:11',
            'id_kelas'            => 'required|integer|exists:kelas,ID_KELAS',
            'id_mk'               => 'required|integer|exists:mata_kuliah,ID_MK',
            'participation_score' => 'required|numeric|min:0|max:100',
            'assignment_score'    => 'required|numeric|min:0|max:100',
            'quiz_score'          => 'required|numeric|min:0|max:100',
            'uts_score'           => 'required|numeric|min:0|max:100',
            'uas_score'           => 'required|numeric|min:0|max:100',
        ];
    }
}
