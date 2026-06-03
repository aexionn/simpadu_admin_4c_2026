<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Mahasiswa\MahasiswaPresensiController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserManagementController;
use App\Http\Controllers\Api\ProdiDosenController;
use App\Http\Controllers\Api\Akademik\KelasController;
use App\Http\Controllers\Api\Akademik\KelasMasterController;
use App\Http\Controllers\Api\Akademik\KelasMkController;
use App\Http\Controllers\Api\Akademik\KhsController;
use App\Http\Controllers\Api\Akademik\KrsController;
use App\Http\Controllers\Api\Akademik\KurikulumMataKuliahController;
use App\Http\Controllers\Api\Akademik\NilaiController;
use App\Http\Controllers\Api\Akademik\PresensiMahasiswaController;
use App\Http\Controllers\Api\Akademik\PresensiSesiController;
use App\Http\Controllers\Api\DataMaster\HariController;
use App\Http\Controllers\Api\DataMaster\KurikulumController;
use App\Http\Controllers\Api\DataMaster\MataKuliahController;
use App\Http\Controllers\Api\DataMaster\ProgramKelasController;
use App\Http\Controllers\Api\DataMaster\RuangController;
use App\Http\Controllers\Api\DataMaster\TahunAkademikController;
use Illuminate\Support\Facades\Route;

/*
|─────────────────────────────────────────────────────────────────────────────
| Role groups
|─────────────────────────────────────────────────────────────────────────────
| readRoles       — view-only access for all authenticated roles
| writeRoles      — mutate data-master & general akademik resources
| dosenWriteRoles — manage presensi sessions & manual roll-call
*/
// $readRoles       = 'super_admin,admin_akademik,pegawai,dosen,admin_pegawai,mahasiswa,admin_mahasiswa,keuangan';
// $writeRoles      = 'super_admin,admin_akademik';
// $dosenWriteRoles = 'super_admin,admin_akademik,dosen';

// ── Public ────────────────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/login',   [AuthController::class, 'login']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
});

// ── Authenticated ─────────────────────────────────────────────────────────────
Route::middleware('auth:jwt')->group(function () {

    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::prefix('profile')->group(function () {
        Route::get('/',                  [ProfileController::class, 'show']);
        Route::patch('/',                [ProfileController::class, 'changeNameAndEmail']);
        Route::patch('/change-password', [ProfileController::class, 'changePassword']);
    });

    // ── Super Admin only ───────────────────────────────────────────────────────
    Route::middleware('role:super_admin')->prefix('admin')->group(function () {
        Route::post('/users',              [UserManagementController::class, 'register']);
        Route::get('/users',               [UserManagementController::class, 'index']);
        Route::get('/users/trashed',             [UserManagementController::class, 'trashed']);
        Route::patch('/users/{id_user}',         [UserManagementController::class, 'update']);
        Route::patch('/users/{id_user}/toggle',  [UserManagementController::class, 'toggleActiveStatus']);
        Route::delete('/users/{id_user}',        [UserManagementController::class, 'destroy']);
        Route::post('/users/{id_user}/restore',  [UserManagementController::class, 'restore']);
        Route::delete('/users/{id_user}/force',  [UserManagementController::class, 'forceDelete']);

        Route::get('/roles',               [RoleController::class, 'index']);
        Route::post('/roles',              [RoleController::class, 'store']);
        Route::delete('/roles/{id}',       [RoleController::class, 'destroy']);
        Route::post('/users/{id}/roles',   [RoleController::class, 'assignToUser']);
        Route::delete('/users/{id}/roles', [RoleController::class, 'revokeFromUser']);
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // ── Mahasiswa ──────────────────────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════
    Route::middleware('role:mahasiswa')->prefix('mahasiswa')->group(function () {
        Route::post('presensi/scan-qr', [MahasiswaPresensiController::class, 'submitQrAttendance']);
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // ── Data Master ────────────────────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════
    Route::prefix('data-master')->group(function () {

        // Read: all roles
        Route::middleware('role:super_admin,admin_akademik,pegawai,dosen,admin_pegawai,mahasiswa,admin_mahasiswa,keuangan')->group(function () {
            Route::get('hari',                       [HariController::class, 'index']);
            Route::get('hari/{id}',                  [HariController::class, 'show']);
            Route::get('ruang',                      [RuangController::class, 'index']);
            Route::get('ruang/{id}',                 [RuangController::class, 'show']);
            Route::get('program-kelas',              [ProgramKelasController::class, 'index']);
            Route::get('program-kelas/{id}',         [ProgramKelasController::class, 'show']);
            Route::get('mata-kuliah',                [MataKuliahController::class, 'index']);
            Route::get('mata-kuliah/{id}',           [MataKuliahController::class, 'show']);
            Route::get('tahun-akademik',             [TahunAkademikController::class, 'index']);
            Route::get('tahun-akademik/{id}',        [TahunAkademikController::class, 'show']);
            Route::get('kurikulum',                  [KurikulumController::class, 'index']);
            Route::get('kurikulum/{id}',             [KurikulumController::class, 'show']);
        });

        // Write: super_admin + admin_akademik
        Route::middleware('role:super_admin,admin_akademik')->group(function () {
            Route::post('hari',                      [HariController::class, 'store']);
            Route::patch('hari/{id}',                [HariController::class, 'update']);
            Route::delete('hari/{id}',               [HariController::class, 'destroy']);
            Route::post('ruang',                     [RuangController::class, 'store']);
            Route::patch('ruang/{id}',               [RuangController::class, 'update']);
            Route::delete('ruang/{id}',              [RuangController::class, 'destroy']);
            Route::post('program-kelas',             [ProgramKelasController::class, 'store']);
            Route::patch('program-kelas/{id}',       [ProgramKelasController::class, 'update']);
            Route::delete('program-kelas/{id}',      [ProgramKelasController::class, 'destroy']);
            Route::post('mata-kuliah',               [MataKuliahController::class, 'store']);
            Route::patch('mata-kuliah/{id}',         [MataKuliahController::class, 'update']);
            Route::delete('mata-kuliah/{id}',        [MataKuliahController::class, 'destroy']);
            Route::post('tahun-akademik',            [TahunAkademikController::class, 'store']);
            Route::patch('tahun-akademik/{id}',      [TahunAkademikController::class, 'update']);
            Route::delete('tahun-akademik/{id}',     [TahunAkademikController::class, 'destroy']);
            Route::post('kurikulum',                 [KurikulumController::class, 'store']);
            Route::patch('kurikulum/{id}',           [KurikulumController::class, 'update']);
            Route::delete('kurikulum/{id}',          [KurikulumController::class, 'destroy']);
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // ── Akademik ───────────────────────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════
    Route::prefix('akademik')->group(function () {

        // ── Read: all roles ────────────────────────────────────────────────────
        Route::middleware('role:super_admin,admin_akademik,dosen,pegawai,admin_pegawai,mahasiswa,admin_mahasiswa,keuangan')->group(function () {
            // Kelas
            Route::get('kelas',                     [KelasController::class, 'index']);
            Route::get('kelas/{id}',                [KelasController::class, 'show']);
            // Kelas Master
            Route::get('kelas-master',              [KelasMasterController::class, 'index']);
            Route::get('kelas-master/{id}',         [KelasMasterController::class, 'show']);
            // Kelas MK
            Route::get('kelas-mk',                  [KelasMkController::class, 'index']);
            Route::get('kelas-mk/{id}',             [KelasMkController::class, 'show']);
            // KHS
            Route::get('khs',                       [KhsController::class, 'index']);
            Route::get('khs/{id}',                  [KhsController::class, 'show']);
            // KRS
            Route::get('krs',                       [KrsController::class, 'index']);
            Route::get('krs/{id}',                  [KrsController::class, 'show']);
            // Nilai
            Route::get('nilai',                     [NilaiController::class, 'index']);
            Route::get('nilai/{id}',                [NilaiController::class, 'show']);
            // Presensi Mahasiswa
            Route::get('presensi-mahasiswa',        [PresensiMahasiswaController::class, 'index']);
            Route::get('presensi-mahasiswa/{id}',   [PresensiMahasiswaController::class, 'show']);
            // Prodi Dosen
            Route::get('prodi-dosen',               [ProdiDosenController::class, 'index']);
            Route::get('prodi-dosen/{id}',          [ProdiDosenController::class, 'show']);
        });

        // ── Write: super_admin + admin_akademik ────────────────────────────────
        Route::middleware('role:super_admin,admin_akademik')->group(function () {
            // Kelas
            Route::post('kelas',                    [KelasController::class, 'store']);
            Route::patch('kelas/{id}',              [KelasController::class, 'update']);
            Route::delete('kelas/{id}',             [KelasController::class, 'destroy']);
            // Kelas Master
            Route::post('kelas-master',             [KelasMasterController::class, 'store']);
            Route::patch('kelas-master/{id}',       [KelasMasterController::class, 'update']);
            Route::delete('kelas-master/{id}',      [KelasMasterController::class, 'destroy']);
            // Kelas MK
            Route::post('kelas-mk',                 [KelasMkController::class, 'store']);
            Route::patch('kelas-mk/{id}',           [KelasMkController::class, 'update']);
            Route::delete('kelas-mk/{id}',          [KelasMkController::class, 'destroy']);
            // KHS
            Route::post('khs',                      [KhsController::class, 'store']);
            Route::patch('khs/{id}',                [KhsController::class, 'update']);
            Route::delete('khs/{id}',               [KhsController::class, 'destroy']);
            // KRS
            Route::post('krs',                      [KrsController::class, 'store']);
            Route::patch('krs/{id}',                [KrsController::class, 'update']);
            Route::delete('krs/{id}',               [KrsController::class, 'destroy']);
            // KRS ↔ Mata Kuliah
            Route::post('krs/{krsId}/mata-kuliah',       [KrsController::class, 'addMataKuliah']);
            Route::delete('krs/{krsId}/mata-kuliah/{mkId}', [KrsController::class, 'removeMataKuliah']);
            // Nilai
            Route::post('nilai',                    [NilaiController::class, 'store']);
            Route::patch('nilai/{id}',              [NilaiController::class, 'update']);
            Route::delete('nilai/{id}',             [NilaiController::class, 'destroy']);
            // Prodi Dosen
            Route::post('prodi-dosen',              [ProdiDosenController::class, 'store']);
            Route::patch('prodi-dosen/{id}',        [ProdiDosenController::class, 'update']);
            Route::delete('prodi-dosen/{id}',       [ProdiDosenController::class, 'destroy']);
            // Presensi Mahasiswa — admin correction only (with audit log)
            Route::patch('presensi-mahasiswa/{id}', [PresensiMahasiswaController::class, 'update']);
        });

        // ── Presensi (dosen access) ────────────────────────────────────────────
        Route::middleware('role:super_admin,admin_akademik,dosen,pegawai')->group(function () {
            // QR Session management
            Route::post('presensi-sesi/generate',        [PresensiSesiController::class, 'generateSession']);
            Route::post('presensi-sesi/{id}/close',      [PresensiSesiController::class, 'closeSession']);
            // Manual roll-call batch
            Route::post('presensi-mahasiswa/batch-roll-call', [PresensiMahasiswaController::class, 'submitBatchRollCall']);
        });

        // ── Nested: Kurikulum ↔ Mata Kuliah ────────────────────────────────────
        Route::middleware('role:super_admin,admin_akademik')->prefix('kurikulum/{kurikulumId}/mata-kuliah')->group(function () {
            Route::get('/',    [KurikulumMataKuliahController::class, 'index']);
            Route::post('/',   [KurikulumMataKuliahController::class, 'store']);
            Route::delete('/{mkId}', [KurikulumMataKuliahController::class, 'destroy']);
        });
    });
});