<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class KrsUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'id_kelas_master' => 'sometimes|integer|exists:kelas_master,ID_KELAS_MASTER',
            'nim'             => 'sometimes|string|max:11',
            'semester'        => 'sometimes|integer|min:1|max:14',
            'status'          => 'sometimes|in:Disetujui,Ditolak,Menunggu Persetujuan',
        ];
    }
}
