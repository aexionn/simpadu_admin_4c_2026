<?php

namespace App\Http\Requests;

use App\Models\TahunAkademik;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class TahunAkademikUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id = $this->route('id');

        return [
            'NAMA_TAHUN_AKADEMIK' => "sometimes|string|max:40|unique:tahun_akademik,NAMA_TAHUN_AKADEMIK,{$id},ID_TAHUN_AKADEMIK",
            'AKTIF'               => 'sometimes|in:Y,T',
            'TGL_AWAL_KULIAH'     => 'sometimes|date_format:Y-m-d',
            'TGL_AKHIR_KULIAH'    => ['sometimes', 'date_format:Y-m-d', function ($attr, $value, $fail) {
                $start = $this->input('TGL_AWAL_KULIAH')
                    ?? optional(TahunAkademik::find($this->route('id')))->TGL_AWAL_KULIAH;
                if ($start && strtotime($value) <= strtotime((string) $start)) {
                    $fail('TGL_AKHIR_KULIAH must be after TGL_AWAL_KULIAH.');
                }
            }],
        ];
    }
}