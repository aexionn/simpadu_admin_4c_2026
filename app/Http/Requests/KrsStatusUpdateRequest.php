<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class KrsStatusUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'status' => 'required|in:Disetujui,Ditolak,Menunggu Persetujuan',
        ];
    }
}
