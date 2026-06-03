<?php

namespace App\Http\Requests;

use App\Rules\ProdiExist;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class KelasUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'ID_PRODI'        => ['sometimes', 'integer', new ProdiExist],
            'ID_PROGRAM'      => 'sometimes|integer|exists:program_kelas,ID_PROGRAM',
            'SEMESTER'        => 'sometimes|integer|min:1|max:14',
            'ALIAS'           => 'sometimes|string|size:2',
            'KELAS_NAMA'      => 'sometimes|string|max:60',
        ];
    }
}