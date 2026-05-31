<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PresensiMahasiswaBatchStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'presensi'                    => 'required|array|min:1',
            'presensi.*.id_kelas_master'  => 'required|integer|exists:kelas_master,ID_KELAS_MASTER',
            'presensi.*.nim'              => 'required|string|size:11',
            'presensi.*.id_kelas_mk'      => 'required|integer|exists:kelas_mk,ID_KELAS_MK',
            'presensi.*.pertemuan_ke'     => 'required|integer|min:1',
            'presensi.*.status_presensi'  => 'required|in:H,I,S,A',
            'presensi.*.metode'           => 'required|in:Manual',
        ];
    }

    public function messages(): array
    {
        return [
            'presensi.*.id_kelas_master.exists'   => 'Satu atau lebih data siswa tidak ditemukan di kelas ini.',
            'presensi.*.id_kelas_mk.exists'       => 'ID jadwal kelas tidak valid.',
            'presensi.*.status_presensi.in'       => 'Status presensi harus H, I, S, atau A.',
        ];
    }
}
