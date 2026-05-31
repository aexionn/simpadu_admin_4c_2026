<?php

namespace App\Services;

use App\Enums\StatusAktif;
use App\Models\Kurikulum;
use Illuminate\Support\Facades\DB;

class KurikulumService
{
    public function activate(Kurikulum $kurikulum): void
    {
        DB::transaction(function () use ($kurikulum) {
            // Mark all currently-active others as superseded and inactive.
            Kurikulum::where('AKTIF_KURIKULUM', StatusAktif::Aktif->value)
                ->where('ID_KURIKULUM', '!=', $kurikulum->ID_KURIKULUM)
                ->update([
                    'AKTIF_KURIKULUM' => StatusAktif::TidakAktif->value,
                    'superseded_at'   => now(),
                ]);

            $kurikulum->AKTIF_KURIKULUM = StatusAktif::Aktif;
            $kurikulum->superseded_at   = null;
            $kurikulum->save();
        });
    }
}