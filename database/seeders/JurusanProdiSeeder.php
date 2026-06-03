<?php

namespace Database\Seeders;

use App\Models\Jurusan;
use App\Models\Prodi;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class Jurusanprodieeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            // ── jurusan ──────────────────────────────────────────────────────
            $sipil   = Jurusan::firstOrCreate(['nama_jurusan' => 'Teknik Sipil dan Kebumian']);
            $mesin   = Jurusan::firstOrCreate(['nama_jurusan' => 'Teknik Mesin']);
            $elektro = Jurusan::firstOrCreate(['nama_jurusan' => 'Teknik Elektro']);
            $akun    = Jurusan::firstOrCreate(['nama_jurusan' => 'Akuntansi']);
            $bisnis  = Jurusan::firstOrCreate(['nama_jurusan' => 'Administrasi Bisnis']);

            // ── prodi ────────────────────────────────────────────────────────
            $prodi = [
                // Teknik Sipil dan Kebumian
                ['nama_prodi' => 'Teknik Sipil',                                          'jenjang' => 'Diploma 3',       'id_jurusan' => $sipil->id_jurusan],
                ['nama_prodi' => 'Teknik Pertambangan',                                   'jenjang' => 'Diploma 3',       'id_jurusan' => $sipil->id_jurusan],
                ['nama_prodi' => 'Teknik Bangunan Rawa',                                  'jenjang' => 'Sarjana Terapan', 'id_jurusan' => $sipil->id_jurusan],
                ['nama_prodi' => 'Teknologi Rekayasa Konstruksi Jalan dan Jembatan',      'jenjang' => 'Sarjana Terapan', 'id_jurusan' => $sipil->id_jurusan],
                ['nama_prodi' => 'Teknologi Rekayasa Geomatika dan Survei',               'jenjang' => 'Sarjana Terapan', 'id_jurusan' => $sipil->id_jurusan],

                // Teknik Mesin
                ['nama_prodi' => 'Tata Operasi dan Pemeliharaan Prediktif Alat Berat',    'jenjang' => 'Diploma 2',       'id_jurusan' => $mesin->id_jurusan],
                ['nama_prodi' => 'Teknik Mesin',                                          'jenjang' => 'Diploma 3',       'id_jurusan' => $mesin->id_jurusan],
                ['nama_prodi' => 'Alat Berat',                                            'jenjang' => 'Diploma 3',       'id_jurusan' => $mesin->id_jurusan],
                ['nama_prodi' => 'Teknologi Rekayasa Otomotif',                           'jenjang' => 'Sarjana Terapan', 'id_jurusan' => $mesin->id_jurusan],

                // Teknik Elektro
                ['nama_prodi' => 'Teknik Listrik',                                        'jenjang' => 'Diploma 3',       'id_jurusan' => $elektro->id_jurusan],
                ['nama_prodi' => 'Elektronika',                                           'jenjang' => 'Diploma 3',       'id_jurusan' => $elektro->id_jurusan],
                ['nama_prodi' => 'Teknik Informatika',                                    'jenjang' => 'Diploma 3',       'id_jurusan' => $elektro->id_jurusan],
                ['nama_prodi' => 'Teknologi Rekayasa Pembangkit Energi',                  'jenjang' => 'Sarjana Terapan', 'id_jurusan' => $elektro->id_jurusan],
                ['nama_prodi' => 'Sistem Informasi Kota Cerdas',                          'jenjang' => 'Sarjana Terapan', 'id_jurusan' => $elektro->id_jurusan],
                ['nama_prodi' => 'Teknologi Rekayasa Otomasi',                            'jenjang' => 'Sarjana Terapan', 'id_jurusan' => $elektro->id_jurusan],
                ['nama_prodi' => 'Sistem Informasi',                                      'jenjang' => 'Diploma 3',       'id_jurusan' => $elektro->id_jurusan],

                // Akuntansi
                ['nama_prodi' => 'Akuntansi',                                             'jenjang' => 'Diploma 3',       'id_jurusan' => $akun->id_jurusan],
                ['nama_prodi' => 'Komputerisasi Akuntansi',                               'jenjang' => 'Diploma 3',       'id_jurusan' => $akun->id_jurusan],
                ['nama_prodi' => 'Akuntansi Lembaga Keuangan Syariah (ALKS)',             'jenjang' => 'Sarjana Terapan', 'id_jurusan' => $akun->id_jurusan],

                // Administrasi Bisnis
                ['nama_prodi' => 'Administrasi Bisnis',                                   'jenjang' => 'Diploma 3',       'id_jurusan' => $bisnis->id_jurusan],
                ['nama_prodi' => 'Bisnis Digital',                                        'jenjang' => 'Sarjana Terapan', 'id_jurusan' => $bisnis->id_jurusan],
            ];

            foreach ($prodi as $prodi) {
                Prodi::firstOrCreate(
                    ['nama_prodi' => $prodi['nama_prodi']],
                    $prodi
                );
            }
        });

        $this->command->info('Jurusan & Prodi data seeded successfully.');
    }
}
