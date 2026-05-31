<?php

namespace App\Http\Requests;

use App\Rules\ProdiExists;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class KelasStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'ID_PRODI'        => ['required', 'integer', new ProdiExists],
            'ID_PROGRAM'      => 'required|integer|exists:program_kelas,ID_PROGRAM',
            'ID_TAHUN_AKADEMIK' => 'required|integer|exists:tahun_akademik,ID_TAHUN_AKADEMIK',
            'SEMESTER'        => 'required|integer|min:1|max:14',
            'ALIAS'           => 'required|string|size:1',
            'KELAS_NAMA'      => 'required|string|max:60',
        ];
    }
}