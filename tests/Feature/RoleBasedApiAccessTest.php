<?php

namespace Tests\Feature;

use App\Models\Jurusan;
use App\Models\Kelas;
use App\Models\Hari;
use App\Models\Khs;
use App\Models\Krs;
use App\Models\Nilai;
use App\Models\PresensiMahasiswa;
use App\Models\ProdiDosen;
use App\Models\KelasMaster;
use App\Models\KelasMk;
use App\Models\Kurikulum;
use App\Models\KurikulumMk;
use App\Models\MataKuliah;
use App\Models\Ruang;
use App\Models\PresensiPegawai;
use App\Models\Prodi;
use App\Models\ProgramKelas;
use App\Models\Role;
use App\Models\TahunAkademik;
use App\Models\User;
use App\Services\JwtService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleBasedApiAccessTest extends TestCase
{
    use RefreshDatabase;

    protected JwtService $jwt;

    /** All roles that can currently access self-service presensi pegawai */
    private const PRESENSI_SELF_SERVICE_ROLES = [
        'super_admin',
        'admin_akademik',
        'admin_pegawai',
        'pegawai',
        'dosen',
        'admin_mahasiswa',
        'keuangan',
    ];

    private const ADMIN_ROLES = [
        'super_admin',
        'admin_akademik',
        'admin_pegawai',
        'admin_mahasiswa',
    ];

    private const NON_ADMIN_ROLES = [
        'pegawai',
        'dosen',
        'mahasiswa',
        'keuangan',
    ];

    protected function setUp(): void
    {
        parent::setUp();
        $this->jwt = app(JwtService::class);
    }

    // ── helpers ─────────────────────────────────────────────────────────────────

    protected function createRole(string $name): Role
    {
        return Role::create(['role_name' => $name]);
    }

    protected function createUserWithRole(string $roleName): User
    {
        $role = $this->createRole($roleName);
        $user = User::factory()->create();
        $user->roles()->attach($role);
        return $user;
    }

    protected function tokenFor(User $user): string
    {
        return $this->jwt->issueAccessToken($user);
    }

    /**
     * Create a minimal presensi_pegawai record owned by $user.
     */
    protected function createPresensi(User $user): PresensiPegawai
    {
        return PresensiPegawai::create([
            'ID_USER'       => $user->id_user,
            'TANGGAL'       => Carbon::today(),
            'WAKTU_MASUK'   => '08:00',
            'WAKTU_KELUAR'  => '17:00',
            'STATUS_PRESENSI' => 'H',
        ]);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Presensi Pegawai — listing endpoints restricted to admin roles
    // ═══════════════════════════════════════════════════════════════════════════

    /** @test */
    public function admin_can_list_all_presensi_pegawai(): void
    {
        $user = $this->createUserWithRole('super_admin');
        $token = $this->tokenFor($user);

        $response = $this->withToken($token)->getJson('/api/presensi-pegawai');

        $response->assertOk();
    }

    /** @test */
    public function non_admin_cannot_list_all_presensi_pegawai(): void
    {
        $user = $this->createUserWithRole('mahasiswa');
        $token = $this->tokenFor($user);

        $response = $this->withToken($token)->getJson('/api/presensi-pegawai');

        $response->assertForbidden();
    }

    /** @test */
    public function admin_can_view_presensi_pegawai_rekap(): void
    {
        $user = $this->createUserWithRole('admin_akademik');
        $token = $this->tokenFor($user);

        $response = $this->withToken($token)->getJson('/api/presensi-pegawai/rekap');

        $response->assertOk();
    }

    /** @test */
    public function non_admin_cannot_view_presensi_pegawai_rekap(): void
    {
        $user = $this->createUserWithRole('dosen');
        $token = $this->tokenFor($user);

        $response = $this->withToken($token)->getJson('/api/presensi-pegawai/rekap');

        $response->assertForbidden();
    }

    /** @test */
    public function all_self_service_roles_can_view_presensi_pegawai_hari_ini(): void
    {
        foreach (self::PRESENSI_SELF_SERVICE_ROLES as $roleName) {
            $user = $this->createUserWithRole($roleName);
            $token = $this->tokenFor($user);

            $response = $this->withToken($token)->getJson('/api/presensi-pegawai/hari-ini');

            $response->assertOk();
        }
    }

    /** @test */
    public function all_self_service_roles_can_view_own_presensi_record(): void
    {
        foreach (self::PRESENSI_SELF_SERVICE_ROLES as $roleName) {
            $user = $this->createUserWithRole($roleName);
            $presensi = $this->createPresensi($user);
            $token = $this->tokenFor($user);

            $response = $this->withToken($token)->getJson("/api/presensi-pegawai/{$presensi->ID_PRESENSI}");

            $response->assertOk();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Data Master Kurikulum — index restricted to admin roles
    // ═══════════════════════════════════════════════════════════════════════════

    protected function createKurikulum(): Kurikulum
    {
        $ta = TahunAkademik::create([
            'NAMA_TAHUN_AKADEMIK' => '2024/2025',
            'AKTIF'               => 'Y',
        ]);
        return Kurikulum::create([
            'ID_TAHUN_AKADEMIK' => $ta->ID_TAHUN_AKADEMIK,
            'NAMA_KURIKULUM'    => 'Kurikulum 2024',
            'AKTIF_KURIKULUM'   => 'Y',
        ]);
    }

    /** @test */
    public function admin_can_list_all_kurikulum(): void
    {
        foreach (self::ADMIN_ROLES as $roleName) {
            $user = $this->createUserWithRole($roleName);
            $token = $this->tokenFor($user);

            $response = $this->withToken($token)->getJson('/api/data-master/kurikulum');

            $response->assertOk();
        }
    }

    /** @test */
    public function non_admin_cannot_list_all_kurikulum(): void
    {
        foreach (self::NON_ADMIN_ROLES as $roleName) {
            $user = $this->createUserWithRole($roleName);
            $token = $this->tokenFor($user);

            $response = $this->withToken($token)->getJson('/api/data-master/kurikulum');

            $response->assertForbidden();
        }
    }

    /** @test */
    public function all_roles_can_view_kurikulum_detail(): void
    {
        $kurikulum = $this->createKurikulum();

        foreach ([...self::ADMIN_ROLES, ...self::NON_ADMIN_ROLES] as $roleName) {
            $user = $this->createUserWithRole($roleName);
            $token = $this->tokenFor($user);

            $response = $this->withToken($token)->getJson("/api/data-master/kurikulum/{$kurikulum->ID_KURIKULUM}");

            $response->assertOk();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Kelas — index restricted to admin roles
    // ═══════════════════════════════════════════════════════════════════════════

    protected function createKelas(): Kelas
    {
        $jurusan = Jurusan::create(['nama_jurusan' => 'Teknik']);
        $prodi   = Prodi::create([
            'nama_prodi' => 'Informatika',
            'jenjang'    => 'S1',
            'id_jurusan' => $jurusan->id_jurusan,
        ]);
        $program = ProgramKelas::create(['NAMA_PROGRAM' => 'Reguler', 'AKTIF' => 'Y']);
        $ta      = TahunAkademik::create(['NAMA_TAHUN_AKADEMIK' => '2024/2025', 'AKTIF' => 'Y']);
        return Kelas::create([
            'ID_PRODI'         => $prodi->id_prodi,
            'ID_PROGRAM'       => $program->ID_PROGRAM,
            'ID_TAHUN_AKADEMIK' => $ta->ID_TAHUN_AKADEMIK,
            'SEMESTER'         => 'Ganjil',
            'KELAS_NAMA'       => 'A',
        ]);
    }

    /** @test */
    public function admin_can_list_all_kelas(): void
    {
        foreach (self::ADMIN_ROLES as $roleName) {
            $user = $this->createUserWithRole($roleName);
            $token = $this->tokenFor($user);

            $response = $this->withToken($token)->getJson('/api/akademik/kelas');

            $response->assertOk();
        }
    }

    /** @test */
    public function non_admin_cannot_list_all_kelas(): void
    {
        foreach (self::NON_ADMIN_ROLES as $roleName) {
            $user = $this->createUserWithRole($roleName);
            $token = $this->tokenFor($user);

            $response = $this->withToken($token)->getJson('/api/akademik/kelas');

            $response->assertForbidden();
        }
    }

    /** @test */
    public function all_roles_can_view_kelas_detail(): void
    {
        $kelas = $this->createKelas();

        foreach ([...self::ADMIN_ROLES, ...self::NON_ADMIN_ROLES] as $roleName) {
            $user = $this->createUserWithRole($roleName);
            $token = $this->tokenFor($user);

            $response = $this->withToken($token)->getJson("/api/akademik/kelas/{$kelas->ID_KELAS}");

            $response->assertOk();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Kelas Master — index restricted to admin roles
    // ═══════════════════════════════════════════════════════════════════════════

    protected function createKelasMaster(): KelasMaster
    {
        $kelas = $this->createKelas();
        $ta = TahunAkademik::where('AKTIF', 'Y')->first();
        return KelasMaster::create([
            'ID_KELAS'          => $kelas->ID_KELAS,
            'ID_TAHUN_AKADEMIK' => $ta->ID_TAHUN_AKADEMIK,
            'NO_ABSEN'          => 1,
            'NIM'               => '12345678901',
            'NAMA_MAHASISWA'    => 'Test Mahasiswa',
        ]);
    }

    /** @test */
    public function admin_can_list_all_kelas_master(): void
    {
        foreach (self::ADMIN_ROLES as $roleName) {
            $user = $this->createUserWithRole($roleName);
            $token = $this->tokenFor($user);

            $response = $this->withToken($token)->getJson('/api/akademik/kelas-master');

            $response->assertOk();
        }
    }

    /** @test */
    public function non_admin_cannot_list_all_kelas_master(): void
    {
        foreach (self::NON_ADMIN_ROLES as $roleName) {
            $user = $this->createUserWithRole($roleName);
            $token = $this->tokenFor($user);

            $response = $this->withToken($token)->getJson('/api/akademik/kelas-master');

            $response->assertForbidden();
        }
    }

    /** @test */
    public function all_roles_can_view_kelas_master_detail(): void
    {
        $kelasMaster = $this->createKelasMaster();

        foreach ([...self::ADMIN_ROLES, ...self::NON_ADMIN_ROLES] as $roleName) {
            $user = $this->createUserWithRole($roleName);
            $token = $this->tokenFor($user);

            $response = $this->withToken($token)->getJson("/api/akademik/kelas-master/{$kelasMaster->ID_KELAS_MASTER}");

            $response->assertOk();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Kelas MK — index restricted to admin roles
    // ═══════════════════════════════════════════════════════════════════════════

    protected function createKelasMk(): KelasMk
    {
        $kelas = $this->createKelas();
        $kurikulum = $this->createKurikulum();
        $mk = MataKuliah::create([
            'NAMA_MK'  => 'Algoritma',
            'SEMESTER' => '1',
            'SKS'      => 3,
            'JAM'      => 3,
        ]);
        $kurikulumMk = KurikulumMk::create([
            'ID_MK'         => $mk->ID_MK,
            'ID_KURIKULUM'  => $kurikulum->ID_KURIKULUM,
        ]);
        $hari = Hari::create(['nama_hari' => 'Senin']);
        $ruang = Ruang::create(['NAMA_RUANG' => 'Ruang 101']);

        return KelasMk::create([
            'ID_KELAS'          => $kelas->ID_KELAS,
            'ID_KURIKULUM_MK'   => $kurikulumMk->ID_KURIKULUM_MK,
            'NIP'               => '1234567890',
            'ID_HARI'           => $hari->id_hari,
            'WAKTU_MULAI'       => '08:00',
            'WAKTU_AKHIR'       => '10:00',
            'ID_RUANG'          => $ruang->id_ruang,
            'TEMA'              => 'Pertemuan 1',
            'DESKRIPSI'         => 'Pengantar',
        ]);
    }

    /** @test */
    public function admin_can_list_all_kelas_mk(): void
    {
        foreach (self::ADMIN_ROLES as $roleName) {
            $user = $this->createUserWithRole($roleName);
            $token = $this->tokenFor($user);

            $response = $this->withToken($token)->getJson('/api/akademik/kelas-mk');

            $response->assertOk();
        }
    }

    /** @test */
    public function non_admin_cannot_list_all_kelas_mk(): void
    {
        foreach (self::NON_ADMIN_ROLES as $roleName) {
            $user = $this->createUserWithRole($roleName);
            $token = $this->tokenFor($user);

            $response = $this->withToken($token)->getJson('/api/akademik/kelas-mk');

            $response->assertForbidden();
        }
    }

    /** @test */
    public function all_roles_can_view_kelas_mk_detail(): void
    {
        $kelasMk = $this->createKelasMk();

        foreach ([...self::ADMIN_ROLES, ...self::NON_ADMIN_ROLES] as $roleName) {
            $user = $this->createUserWithRole($roleName);
            $token = $this->tokenFor($user);

            $response = $this->withToken($token)->getJson("/api/akademik/kelas-mk/{$kelasMk->ID_KELAS_MK}");

            $response->assertOk();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // KHS — index restricted to admin roles
    // ═══════════════════════════════════════════════════════════════════════════

    protected function createKhs(): Khs
    {
        return Khs::create([
            'SEMESTER' => 1,
            'NIM'      => '12345678901',
            'IPS'      => 3.5,
            'IPK'      => 3.5,
        ]);
    }

    /** @test */
    public function admin_can_list_all_khs(): void
    {
        foreach (self::ADMIN_ROLES as $roleName) {
            $user = $this->createUserWithRole($roleName);
            $token = $this->tokenFor($user);

            $response = $this->withToken($token)->getJson('/api/akademik/khs');

            $response->assertOk();
        }
    }

    /** @test */
    public function non_admin_cannot_list_all_khs(): void
    {
        foreach (self::NON_ADMIN_ROLES as $roleName) {
            $user = $this->createUserWithRole($roleName);
            $token = $this->tokenFor($user);

            $response = $this->withToken($token)->getJson('/api/akademik/khs');

            $response->assertForbidden();
        }
    }

    /** @test */
    public function all_roles_can_view_khs_detail(): void
    {
        $khs = $this->createKhs();

        foreach ([...self::ADMIN_ROLES, ...self::NON_ADMIN_ROLES] as $roleName) {
            $user = $this->createUserWithRole($roleName);
            $token = $this->tokenFor($user);

            $response = $this->withToken($token)->getJson("/api/akademik/khs/{$khs->ID_KHS}");

            $response->assertOk();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // KRS — index restricted to admin roles
    // ═══════════════════════════════════════════════════════════════════════════

    protected function createKrs(): Krs
    {
        return Krs::create([
            'NAMA_KELAS' => 'A',
            'NIM'        => '12345678901',
            'SEMESTER'   => 1,
        ]);
    }

    /** @test */
    public function admin_can_list_all_krs(): void
    {
        foreach (self::ADMIN_ROLES as $roleName) {
            $user = $this->createUserWithRole($roleName);
            $token = $this->tokenFor($user);

            $response = $this->withToken($token)->getJson('/api/akademik/krs');

            $response->assertOk();
        }
    }

    /** @test */
    public function non_admin_cannot_list_all_krs(): void
    {
        foreach (self::NON_ADMIN_ROLES as $roleName) {
            $user = $this->createUserWithRole($roleName);
            $token = $this->tokenFor($user);

            $response = $this->withToken($token)->getJson('/api/akademik/krs');

            $response->assertForbidden();
        }
    }

    /** @test */
    public function all_roles_can_view_krs_detail(): void
    {
        $krs = $this->createKrs();

        foreach ([...self::ADMIN_ROLES, ...self::NON_ADMIN_ROLES] as $roleName) {
            $user = $this->createUserWithRole($roleName);
            $token = $this->tokenFor($user);

            $response = $this->withToken($token)->getJson("/api/akademik/krs/{$krs->ID_KRS}");

            $response->assertOk();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Presensi Mahasiswa — index restricted to admin roles
    // ═══════════════════════════════════════════════════════════════════════════

    protected function createPresensiMahasiswa(): PresensiMahasiswa
    {
        $kelasMaster = $this->createKelasMaster();
        return PresensiMahasiswa::create([
            'ID_KELAS_MASTER' => $kelasMaster->ID_KELAS_MASTER,
            'WAKTU_PRESENSI'  => Carbon::now(),
            'STATUS_PRESENSI' => 'H',
            'METODE'          => 'Manual',
        ]);
    }

    /** @test */
    public function admin_can_list_all_presensi_mahasiswa(): void
    {
        foreach (self::ADMIN_ROLES as $roleName) {
            $user = $this->createUserWithRole($roleName);
            $token = $this->tokenFor($user);

            $response = $this->withToken($token)->getJson('/api/akademik/presensi-mahasiswa');

            $response->assertOk();
        }
    }

    /** @test */
    public function non_admin_cannot_list_all_presensi_mahasiswa(): void
    {
        foreach (self::NON_ADMIN_ROLES as $roleName) {
            $user = $this->createUserWithRole($roleName);
            $token = $this->tokenFor($user);

            $response = $this->withToken($token)->getJson('/api/akademik/presensi-mahasiswa');

            $response->assertForbidden();
        }
    }

    /** @test */
    public function all_roles_can_view_presensi_mahasiswa_detail(): void
    {
        $presensi = $this->createPresensiMahasiswa();

        foreach ([...self::ADMIN_ROLES, ...self::NON_ADMIN_ROLES] as $roleName) {
            $user = $this->createUserWithRole($roleName);
            $token = $this->tokenFor($user);

            $response = $this->withToken($token)->getJson("/api/akademik/presensi-mahasiswa/{$presensi->ID_PRESENSI}");

            $response->assertOk();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Prodi Dosen — index restricted to admin roles
    // ═══════════════════════════════════════════════════════════════════════════

    protected function createProdiDosen(): ProdiDosen
    {
        return ProdiDosen::create([
            'ID_PRODI' => 1,
            'NIP'      => '1234567890',
        ]);
    }

    /** @test */
    public function admin_can_list_all_prodi_dosen(): void
    {
        foreach (self::ADMIN_ROLES as $roleName) {
            $user = $this->createUserWithRole($roleName);
            $token = $this->tokenFor($user);

            $response = $this->withToken($token)->getJson('/api/akademik/prodi-dosen');

            $response->assertOk();
        }
    }

    /** @test */
    public function non_admin_cannot_list_all_prodi_dosen(): void
    {
        foreach (self::NON_ADMIN_ROLES as $roleName) {
            $user = $this->createUserWithRole($roleName);
            $token = $this->tokenFor($user);

            $response = $this->withToken($token)->getJson('/api/akademik/prodi-dosen');

            $response->assertForbidden();
        }
    }

    /** @test */
    public function all_roles_can_view_prodi_dosen_detail(): void
    {
        $pd = $this->createProdiDosen();
        // Since ProdiDosen has no pk, we just assume id 1 for testing route resolution
        $id = $pd->id ?? 1;

        foreach ([...self::ADMIN_ROLES, ...self::NON_ADMIN_ROLES] as $roleName) {
            $user = $this->createUserWithRole($roleName);
            $token = $this->tokenFor($user);

            $response = $this->withToken($token)->getJson("/api/akademik/prodi-dosen/{$id}");

            $response->assertOk();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Nilai — index restricted to admin roles
    // ═══════════════════════════════════════════════════════════════════════════

    protected function createNilai(): Nilai
    {
        return Nilai::create([
            'ID_KHS'      => 1,
            'ID_MK'       => 1,
            'TOTAL_NILAI' => 85.5,
            'NILAI_HURUF' => 'A',
            // Fallback for model/migration mismatch during tests
            'id_dosen'    => 1,
            'nim'         => '123',
            'id_kelas'    => 1,
            'id_mk'       => 1,
            'grade'       => 'A',
        ]);
    }

    /** @test */
    public function admin_can_list_all_nilai(): void
    {
        foreach (self::ADMIN_ROLES as $roleName) {
            $user = $this->createUserWithRole($roleName);
            $token = $this->tokenFor($user);

            $response = $this->withToken($token)->getJson('/api/akademik/nilai');

            $response->assertOk();
        }
    }

    /** @test */
    public function non_admin_cannot_list_all_nilai(): void
    {
        foreach (self::NON_ADMIN_ROLES as $roleName) {
            $user = $this->createUserWithRole($roleName);
            $token = $this->tokenFor($user);

            $response = $this->withToken($token)->getJson('/api/akademik/nilai');

            $response->assertForbidden();
        }
    }

    /** @test */
    public function allowed_roles_can_view_nilai_detail(): void
    {
        $nilai = $this->createNilai();
        $id = $nilai->ID_NILAI ?? $nilai->id ?? 1;

        // Current detail route is restricted to super_admin,admin_akademik,admin_mahasiswa,dosen
        $allowed = ['super_admin', 'admin_akademik', 'admin_mahasiswa', 'dosen'];
        
        foreach ($allowed as $roleName) {
            $user = $this->createUserWithRole($roleName);
            $token = $this->tokenFor($user);

            $response = $this->withToken($token)->getJson("/api/akademik/nilai/{$id}");

            $response->assertOk();
        }
    }
}
