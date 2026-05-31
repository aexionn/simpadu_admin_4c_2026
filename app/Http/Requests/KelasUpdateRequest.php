<?php

namespace App\Http\Requests;

use App\Rules\ProdiExists;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class KelasUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'ID_PRODI'        => ['sometimes', 'integer', new ProdiExists],
            'ID_PROGRAM'      => 'sometimes|integer|exists:program_kelas,ID_PROGRAM',
            'ID_TAHUN_AKADEMIK' => 'sometimes|integer|exists:tahun_akademik,ID_TAHUN_AKADEMIK',
            'SEMESTER'        => 'sometimes|integer|min:1|max:14',
            'ALIAS'           => 'sometimes|string|size:1',
            'KELAS_NAMA'      => 'sometimes|string|max:60',
        ];
    }
}