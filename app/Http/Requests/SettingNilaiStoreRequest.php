<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class SettingNilaiStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'id_dosen'      => 'required|integer',
            'id_kelas'      => 'required|integer|exists:kelas,ID_KELAS',
            'id_mk'         => 'required|integer|exists:mata_kuliah,ID_MK',
            'participation' => 'required|numeric|min:0|max:100',
            'assignment'    => 'required|numeric|min:0|max:100',
            'quiz'          => 'required|numeric|min:0|max:100',
            'uts'           => 'required|numeric|min:0|max:100',
            'uas'           => 'required|numeric|min:0|max:100',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $total = array_sum(array_map('floatval', [
                $this->input('participation'),
                $this->input('assignment'),
                $this->input('quiz'),
                $this->input('uts'),
                $this->input('uas'),
            ]));

            if (abs($total - 100) > 0.00001) {
                $validator->errors()->add('weights', 'Total bobot nilai harus sama dengan 100.');
            }
        });
    }
}
