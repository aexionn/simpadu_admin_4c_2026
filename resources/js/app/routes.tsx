import { createBrowserRouter } from "react-router";
import { RequireAuth, GuestOnly } from "./components/guards/AuthGuard";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./components/pages/Dashboard";
import JurusanManagement from "./components/pages/JurusanManagement";
import ProgramStudiManagement from "./components/pages/ProgramStudiManagement";
import MataKuliahManagement from "./components/pages/MataKuliahManagement";
import KelasManagement from "./components/pages/KelasManagement";
import ProgramKelasManagement from "./components/pages/ProgramKelasManagement";
import TahunAkademikManagement from "./components/pages/TahunAkademikManagement";
import KurikulumManagement from "./components/pages/KurikulumManagement";
import JadwalKuliah from "./components/pages/JadwalKuliah";
import PertemuanPerkuliahan from "./components/pages/PertemuanPerkuliahan";
import KRSManagement from "./components/pages/KRSManagement";
import KHSManagement from "./components/pages/KHSManagement";
import NilaiMahasiswa from "./components/pages/NilaiMahasiswa";
import AbsensiMahasiswa from "./components/pages/AbsensiMahasiswa";
import AbsensiPegawai from "./components/pages/AbsensiPegawai";
import UserManagement from "./components/pages/UserManagement";
import RoleManagement from "./components/pages/RoleManagement";
import Pengaturan from "./components/pages/Pengaturan";
import LoginAdmin from "./components/pages/LoginAdmin";
import NotFound from "./components/pages/NotFound";

export const router = createBrowserRouter([
  // ── Route publik: hanya bisa diakses saat belum login ──
  {
    element: <GuestOnly />,
    children: [
      { path: "/login", Component: LoginAdmin },
    ],
  },

  // ── Route privat: wajib login ──
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/",
        Component: DashboardLayout,
        children: [
          { index: true, Component: Dashboard },
          { path: "jurusan", Component: JurusanManagement },
          { path: "program-studi", Component: ProgramStudiManagement },
          { path: "mata-kuliah", Component: MataKuliahManagement },
          { path: "kelas", Component: KelasManagement },
          { path: "program-kelas", Component: ProgramKelasManagement },
          { path: "tahun-akademik", Component: TahunAkademikManagement },
          { path: "kurikulum", Component: KurikulumManagement },
          { path: "jadwal-kuliah", Component: JadwalKuliah },
          { path: "pertemuan-perkuliahan", Component: PertemuanPerkuliahan },
          { path: "krs", Component: KRSManagement },
          { path: "khs", Component: KHSManagement },
          { path: "nilai-mahasiswa", Component: NilaiMahasiswa },
          { path: "absensi-mahasiswa", Component: AbsensiMahasiswa },
          { path: "absensi-pegawai", Component: AbsensiPegawai },
          { path: "user-management", Component: UserManagement },
          { path: "role-management", Component: RoleManagement },
          { path: "pengaturan", Component: Pengaturan },
          { path: "*", Component: NotFound },
        ],
      },
    ],
  },
]);
