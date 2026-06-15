<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ManageKelasMkRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'id_kelas_mk' => 'required|integer|exists:kelas_mk,ID_KELAS_MK',
        ];
    }
}
