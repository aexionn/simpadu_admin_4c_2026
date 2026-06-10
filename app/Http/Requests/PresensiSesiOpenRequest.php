<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PresensiSesiOpenRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'ID_KELAS_MK'      => 'required|integer|exists:kelas_mk,ID_KELAS_MK',
            'PERTEMUAN_KE'     => 'required|integer|min:1',
            'duration_minutes' => 'nullable|integer|min:1|max:180',
        ];
    }
}
