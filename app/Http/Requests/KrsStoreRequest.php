<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class KrsStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'id_kelas_master' => 'required|integer|exists:kelas_master,ID_KELAS_MASTER',
            'nim'             => 'required|string|max:11',
            'semester'        => 'required|integer|min:1|max:14',
            'kelas_mk_ids'    => 'required|array|min:1',
            'kelas_mk_ids.*'  => 'required|integer|distinct|exists:kelas_mk,ID_KELAS_MK',
        ];
    }
}
