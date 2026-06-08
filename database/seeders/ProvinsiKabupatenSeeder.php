<?php

namespace Database\Seeders;

use App\Models\Kabupaten;
use App\Models\Provinsi;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProvinsiKabupatenSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $provinsiData = [
                ['KODE_PROVINSI' => 61, 'NAMA_PROVINSI' => 'Kalimantan Barat'],
                ['KODE_PROVINSI' => 62, 'NAMA_PROVINSI' => 'Kalimantan Tengah'],
                ['KODE_PROVINSI' => 63, 'NAMA_PROVINSI' => 'Kalimantan Selatan'],
                ['KODE_PROVINSI' => 64, 'NAMA_PROVINSI' => 'Kalimantan Timur'],
                ['KODE_PROVINSI' => 65, 'NAMA_PROVINSI' => 'Kalimantan Utara'],
            ];

            foreach ($provinsiData as $row) {
                Provinsi::updateOrCreate(
                    ['KODE_PROVINSI' => $row['KODE_PROVINSI']],
                    $row
                );
            }

            $kabupatenData = [
                // Kalimantan Barat (61)
                ['KODE_KABUPATEN' => 6101, 'KODE_PROVINSI' => 61, 'NAMA_KABUPATEN' => 'Kabupaten Sambas'],
                ['KODE_KABUPATEN' => 6102, 'KODE_PROVINSI' => 61, 'NAMA_KABUPATEN' => 'Kabupaten Mempawah'],
                ['KODE_KABUPATEN' => 6103, 'KODE_PROVINSI' => 61, 'NAMA_KABUPATEN' => 'Kabupaten Sanggau'],
                ['KODE_KABUPATEN' => 6104, 'KODE_PROVINSI' => 61, 'NAMA_KABUPATEN' => 'Kabupaten Ketapang'],
                ['KODE_KABUPATEN' => 6105, 'KODE_PROVINSI' => 61, 'NAMA_KABUPATEN' => 'Kabupaten Sintang'],
                ['KODE_KABUPATEN' => 6106, 'KODE_PROVINSI' => 61, 'NAMA_KABUPATEN' => 'Kabupaten Kapuas Hulu'],
                ['KODE_KABUPATEN' => 6107, 'KODE_PROVINSI' => 61, 'NAMA_KABUPATEN' => 'Kabupaten Bengkayang'],
                ['KODE_KABUPATEN' => 6108, 'KODE_PROVINSI' => 61, 'NAMA_KABUPATEN' => 'Kabupaten Landak'],
                ['KODE_KABUPATEN' => 6109, 'KODE_PROVINSI' => 61, 'NAMA_KABUPATEN' => 'Kabupaten Sekadau'],
                ['KODE_KABUPATEN' => 6110, 'KODE_PROVINSI' => 61, 'NAMA_KABUPATEN' => 'Kabupaten Melawi'],
                ['KODE_KABUPATEN' => 6111, 'KODE_PROVINSI' => 61, 'NAMA_KABUPATEN' => 'Kabupaten Kayong Utara'],
                ['KODE_KABUPATEN' => 6112, 'KODE_PROVINSI' => 61, 'NAMA_KABUPATEN' => 'Kabupaten Kubu Raya'],
                ['KODE_KABUPATEN' => 6171, 'KODE_PROVINSI' => 61, 'NAMA_KABUPATEN' => 'Kota Pontianak'],
                ['KODE_KABUPATEN' => 6172, 'KODE_PROVINSI' => 61, 'NAMA_KABUPATEN' => 'Kota Singkawang'],
                // Kalimantan Tengah (62)
                ['KODE_KABUPATEN' => 6201, 'KODE_PROVINSI' => 62, 'NAMA_KABUPATEN' => 'Kabupaten Kotawaringin Barat'],
                ['KODE_KABUPATEN' => 6202, 'KODE_PROVINSI' => 62, 'NAMA_KABUPATEN' => 'Kabupaten Kotawaringin Timur'],
                ['KODE_KABUPATEN' => 6203, 'KODE_PROVINSI' => 62, 'NAMA_KABUPATEN' => 'Kabupaten Kapuas'],
                ['KODE_KABUPATEN' => 6204, 'KODE_PROVINSI' => 62, 'NAMA_KABUPATEN' => 'Kabupaten Barito Selatan'],
                ['KODE_KABUPATEN' => 6205, 'KODE_PROVINSI' => 62, 'NAMA_KABUPATEN' => 'Kabupaten Barito Utara'],
                ['KODE_KABUPATEN' => 6206, 'KODE_PROVINSI' => 62, 'NAMA_KABUPATEN' => 'Kabupaten Katingan'],
                ['KODE_KABUPATEN' => 6207, 'KODE_PROVINSI' => 62, 'NAMA_KABUPATEN' => 'Kabupaten Seruyan'],
                ['KODE_KABUPATEN' => 6208, 'KODE_PROVINSI' => 62, 'NAMA_KABUPATEN' => 'Kabupaten Sukamara'],
                ['KODE_KABUPATEN' => 6209, 'KODE_PROVINSI' => 62, 'NAMA_KABUPATEN' => 'Kabupaten Lamandau'],
                ['KODE_KABUPATEN' => 6210, 'KODE_PROVINSI' => 62, 'NAMA_KABUPATEN' => 'Kabupaten Gunung Mas'],
                ['KODE_KABUPATEN' => 6211, 'KODE_PROVINSI' => 62, 'NAMA_KABUPATEN' => 'Kabupaten Pulang Pisau'],
                ['KODE_KABUPATEN' => 6212, 'KODE_PROVINSI' => 62, 'NAMA_KABUPATEN' => 'Kabupaten Murung Raya'],
                ['KODE_KABUPATEN' => 6213, 'KODE_PROVINSI' => 62, 'NAMA_KABUPATEN' => 'Kabupaten Barito Timur'],
                ['KODE_KABUPATEN' => 6271, 'KODE_PROVINSI' => 62, 'NAMA_KABUPATEN' => 'Kota Palangkaraya'],
                // Kalimantan Selatan (63)
                ['KODE_KABUPATEN' => 6301, 'KODE_PROVINSI' => 63, 'NAMA_KABUPATEN' => 'Kabupaten Tanah Laut'],
                ['KODE_KABUPATEN' => 6302, 'KODE_PROVINSI' => 63, 'NAMA_KABUPATEN' => 'Kabupaten Kotabaru'],
                ['KODE_KABUPATEN' => 6303, 'KODE_PROVINSI' => 63, 'NAMA_KABUPATEN' => 'Kabupaten Banjar'],
                ['KODE_KABUPATEN' => 6304, 'KODE_PROVINSI' => 63, 'NAMA_KABUPATEN' => 'Kabupaten Barito Kuala'],
                ['KODE_KABUPATEN' => 6305, 'KODE_PROVINSI' => 63, 'NAMA_KABUPATEN' => 'Kabupaten Tapin'],
                ['KODE_KABUPATEN' => 6306, 'KODE_PROVINSI' => 63, 'NAMA_KABUPATEN' => 'Kabupaten Hulu Sungai Selatan'],
                ['KODE_KABUPATEN' => 6307, 'KODE_PROVINSI' => 63, 'NAMA_KABUPATEN' => 'Kabupaten Hulu Sungai Tengah'],
                ['KODE_KABUPATEN' => 6308, 'KODE_PROVINSI' => 63, 'NAMA_KABUPATEN' => 'Kabupaten Hulu Sungai Utara'],
                ['KODE_KABUPATEN' => 6309, 'KODE_PROVINSI' => 63, 'NAMA_KABUPATEN' => 'Kabupaten Tabalong'],
                ['KODE_KABUPATEN' => 6310, 'KODE_PROVINSI' => 63, 'NAMA_KABUPATEN' => 'Kabupaten Tanah Bumbu'],
                ['KODE_KABUPATEN' => 6311, 'KODE_PROVINSI' => 63, 'NAMA_KABUPATEN' => 'Kabupaten Balangan'],
                ['KODE_KABUPATEN' => 6371, 'KODE_PROVINSI' => 63, 'NAMA_KABUPATEN' => 'Kota Banjarmasin'],
                ['KODE_KABUPATEN' => 6372, 'KODE_PROVINSI' => 63, 'NAMA_KABUPATEN' => 'Kota Banjarbaru'],
            ];

            foreach ($kabupatenData as $row) {
                Kabupaten::updateOrCreate(
                    ['KODE_KABUPATEN' => $row['KODE_KABUPATEN']],
                    $row
                );
            }
        });

        $this->command->info('Provinsi & Kabupaten data seeded successfully.');
    }
}
