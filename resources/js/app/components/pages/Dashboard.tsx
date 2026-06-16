import { useEffect, useState } from "react";
import { Users, BookOpen, Calendar, GraduationCap, TrendingUp, Bell } from "lucide-react";
import { adminService, akademikService, dataMasterService } from "../../services/apiServices";
import { ErrorState, LoadingState, valueOf } from "./apiPageUtils";

const statsCards = [
  { title: "Total Mahasiswa", value: "2,847", icon: Users, color: "bg-blue-500", trend: "+12%" },
  { title: "Total Dosen", value: "187", icon: GraduationCap, color: "bg-green-500", trend: "+3%" },
  { title: "Total Kelas", value: "156", icon: Calendar, color: "bg-purple-500", trend: "+8%" },
  { title: "Mata Kuliah", value: "324", icon: BookOpen, color: "bg-orange-500", trend: "+5%" },
];

const recentActivities = [
  { action: "Mahasiswa baru terdaftar", user: "Ahmad Fauzi", time: "5 menit yang lalu", type: "success" },
  { action: "Jadwal kuliah diperbarui", user: "Dr. Siti Aminah", time: "15 menit yang lalu", type: "info" },
  { action: "Nilai UAS diinput", user: "Prof. Budi Santoso", time: "1 jam yang lalu", type: "success" },
  { action: "KRS disetujui", user: "Muhammad Rizki", time: "2 jam yang lalu", type: "success" },
  { action: "Absensi ditambahkan", user: "Dr. Rina Kusuma", time: "3 jam yang lalu", type: "info" },
];

const todaySchedule = [
  { time: "08:00 - 10:00", course: "Pemrograman Web", class: "TI-3A", room: "Lab Komputer 1", lecturer: "Dr. Ahmad Yani" },
  { time: "10:00 - 12:00", course: "Basis Data", class: "SI-2B", room: "Ruang 301", lecturer: "Prof. Siti Nurhaliza" },
  { time: "13:00 - 15:00", course: "Jaringan Komputer", class: "TI-4A", room: "Lab Jaringan", lecturer: "Dr. Bambang Sutrisno" },
  { time: "15:00 - 17:00", course: "Sistem Informasi", class: "SI-3C", room: "Ruang 205", lecturer: "M. Rizal, M.Kom" },
];

export default function Dashboard() {
  const [cards, setCards] = useState(statsCards);
  const [schedule, setSchedule] = useState(todaySchedule);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      const errors: string[] = [];
      const [usersResult, kelasResult, mataKuliahResult, jadwalResult] = await Promise.allSettled([
        adminService.getUsers(),
        akademikService.getKelas(),
        dataMasterService.getMataKuliah(),
        akademikService.getKelasMk(),
      ]);

      if (!isMounted) return;

      const users = usersResult.status === "fulfilled" ? usersResult.value : [];
      const kelas = kelasResult.status === "fulfilled" ? kelasResult.value : [];
      const mataKuliah = mataKuliahResult.status === "fulfilled" ? mataKuliahResult.value : [];
      const jadwal = jadwalResult.status === "fulfilled" ? jadwalResult.value : [];

      [usersResult, kelasResult, mataKuliahResult, jadwalResult].forEach((result) => {
        if (result.status === "rejected") {
          errors.push(result.reason instanceof Error ? result.reason.message : "Failed to load API data.");
        }
      });

      if (users.length || kelas.length || mataKuliah.length) {
        const totalMahasiswa = users.filter((user: any) =>
          JSON.stringify(user.roles ?? user.role ?? "").toLowerCase().includes("mahasiswa")
        ).length;
        const totalDosen = users.filter((user: any) =>
          JSON.stringify(user.roles ?? user.role ?? "").toLowerCase().includes("dosen")
        ).length;

        setCards([
          { ...statsCards[0], value: String(totalMahasiswa || statsCards[0].value) },
          { ...statsCards[1], value: String(totalDosen || statsCards[1].value) },
          { ...statsCards[2], value: String(kelas.length || statsCards[2].value) },
          { ...statsCards[3], value: String(mataKuliah.length || statsCards[3].value) },
        ]);
      }

      if (jadwal.length) {
        setSchedule(
          jadwal.slice(0, 6).map((item: any) => {
            const mataKuliah = item.mata_kuliah ?? item.mataKuliah ?? {};
            const kelasItem = item.kelas ?? item.kelas_master ?? {};
            const dosen = item.dosen ?? item.pegawai ?? {};
            const ruang = item.ruang ?? item.ruangan ?? {};
            const mulai = valueOf(item.JAM_MULAI, item.jam_mulai, item.waktu_mulai, "");
            const selesai = valueOf(item.JAM_SELESAI, item.jam_selesai, item.waktu_selesai, "");

            return {
              time: mulai || selesai ? `${mulai} - ${selesai}` : valueOf(item.waktu, "-"),
              course: valueOf(
                item.NAMA_MATA_KULIAH,
                item.nama_mata_kuliah,
                mataKuliah.NAMA_MATA_KULIAH,
                mataKuliah.nama_mata_kuliah,
                "-"
              ),
              class: valueOf(item.KELAS_NAMA, item.nama_kelas, kelasItem.KELAS_NAMA, kelasItem.nama_kelas, "-"),
              room: valueOf(item.NAMA_RUANG, item.nama_ruang, ruang.NAMA_RUANG, ruang.nama_ruang, "-"),
              lecturer: valueOf(item.NAMA_DOSEN, item.nama_dosen, dosen.name, dosen.nama, "-"),
            };
          })
        );
      }

      if (errors.length) {
        setError(`${errors[0]} Showing fallback data where API data is unavailable.`);
      }

      setLoading(false);
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Sistem Informasi Manajemen Pendidikan Akademik - POLIBAN</p>
      </div>

      {loading && <LoadingState label="Memuat ringkasan dashboard..." />}
      {error && <ErrorState message={error} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {cards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>{stat.trend}</span>
              </div>
            </div>
            <h3 className="text-gray-600 text-sm">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="col-span-2 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-600 mt-1">oleh {activity.user}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Notifikasi</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Pengumuman</p>
                <p className="text-xs text-blue-700 mt-1">Jadwal UAS semester genap telah tersedia</p>
                <p className="text-xs text-blue-500 mt-2">2 jam yang lalu</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-900">KRS Dibuka</p>
                <p className="text-xs text-green-700 mt-1">Periode pengisian KRS semester baru dibuka</p>
                <p className="text-xs text-green-500 mt-2">5 jam yang lalu</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm font-medium text-orange-900">Reminder</p>
                <p className="text-xs text-orange-700 mt-1">Batas input nilai UAS: 15 Mei 2026</p>
                <p className="text-xs text-orange-500 mt-2">1 hari yang lalu</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="mt-6 bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Jadwal Kuliah Hari Ini</h2>
          <p className="text-sm text-gray-600 mt-1">Senin, 12 Mei 2026</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Waktu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Mata Kuliah</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Kelas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Ruangan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Dosen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {schedule.map((schedule, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{schedule.time}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{schedule.course}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{schedule.class}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{schedule.room}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{schedule.lecturer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
