import { useState } from "react";
import { Search, Filter, Download, Calendar } from "lucide-react";
import { akademikService } from "../../services/apiServices";
import { ErrorState, LoadingState, useApiData, valueOf } from "./apiPageUtils";

const absensiData = [
  { id: 1, nim: "2301010001", nama: "Ahmad Fauzi", mataKuliah: "Pemrograman Web", kelas: "TI-3A", pertemuan: 1, tanggal: "2026-05-05", status: "Hadir", keterangan: "-" },
  { id: 2, nim: "2301010002", nama: "Siti Nurhaliza", mataKuliah: "Pemrograman Web", kelas: "TI-3A", pertemuan: 1, tanggal: "2026-05-05", status: "Hadir", keterangan: "-" },
  { id: 3, nim: "2301010003", nama: "Muhammad Rizki", mataKuliah: "Pemrograman Web", kelas: "TI-3A", pertemuan: 1, tanggal: "2026-05-05", status: "Izin", keterangan: "Sakit" },
  { id: 4, nim: "2301010004", nama: "Rina Wati", mataKuliah: "Pemrograman Web", kelas: "TI-3A", pertemuan: 1, tanggal: "2026-05-05", status: "Hadir", keterangan: "-" },
  { id: 5, nim: "2301010005", nama: "Bambang Sutrisno", mataKuliah: "Basis Data", kelas: "SI-2B", pertemuan: 2, tanggal: "2026-05-06", status: "Alpha", keterangan: "-" },
  { id: 6, nim: "2301010006", nama: "Sri Lestari", mataKuliah: "Basis Data", kelas: "SI-2B", pertemuan: 2, tanggal: "2026-05-06", status: "Hadir", keterangan: "-" },
  { id: 7, nim: "2301010007", nama: "Fajar Nugroho", mataKuliah: "Basis Data", kelas: "SI-2B", pertemuan: 2, tanggal: "2026-05-06", status: "Hadir", keterangan: "-" },
  { id: 8, nim: "2301010008", nama: "Dewi Kartika", mataKuliah: "Basis Data", kelas: "SI-2B", pertemuan: 2, tanggal: "2026-05-06", status: "Izin", keterangan: "Keperluan Keluarga" },
];

function normalizeAbsensiStatus(value: any) {
  const status = String(valueOf(value, "Alpha")).toLowerCase();
  if (status.includes("hadir")) return "Hadir";
  if (status.includes("izin") || status.includes("sakit")) return "Izin";
  return "Alpha";
}

function mapAbsensiMahasiswa(item: any) {
  const mahasiswa = item.mahasiswa ?? item.user ?? {};
  const mataKuliah = item.mata_kuliah ?? item.mataKuliah ?? {};

  return {
    id: valueOf(item.ID_PRESENSI, item.id_presensi, item.id),
    nim: valueOf(item.NIM, item.nim, mahasiswa.NIM, mahasiswa.nim, "-"),
    nama: valueOf(item.NAMA_MAHASISWA, item.nama_mahasiswa, mahasiswa.name, mahasiswa.nama, "-"),
    mataKuliah: valueOf(
      item.NAMA_MATA_KULIAH,
      item.nama_mata_kuliah,
      mataKuliah.NAMA_MATA_KULIAH,
      mataKuliah.nama_mata_kuliah,
      "-"
    ),
    kelas: valueOf(item.KELAS_NAMA, item.nama_kelas, item.kelas, "-"),
    pertemuan: Number(valueOf(item.PERTEMUAN_KE, item.pertemuan_ke, item.pertemuan, 0)),
    tanggal: valueOf(item.TANGGAL, item.tanggal, item.created_at, "-"),
    status: normalizeAbsensiStatus(valueOf(item.STATUS, item.status, item.keterangan_status)),
    keterangan: valueOf(item.KETERANGAN, item.keterangan, "-"),
  };
}

export default function AbsensiMahasiswa() {
  const { data, loading, error } = useApiData({
    fallback: absensiData,
    fetcher: akademikService.getPresensiMahasiswa,
    mapper: mapAbsensiMahasiswa,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mataKuliah.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hadir":
        return "bg-green-100 text-green-800";
      case "Izin":
        return "bg-yellow-100 text-yellow-800";
      case "Alpha":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalHadir = data.filter((item) => item.status === "Hadir").length;
  const totalIzin = data.filter((item) => item.status === "Izin").length;
  const totalAlpha = data.filter((item) => item.status === "Alpha").length;
  const persentaseHadir = data.length > 0 ? ((totalHadir / data.length) * 100).toFixed(1) : "0.0";

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Absensi Mahasiswa</h1>
        <p className="text-gray-600 mt-1">Kelola data absensi mahasiswa</p>
      </div>

      {loading && <LoadingState label="Memuat data absensi mahasiswa..." />}
      {error && <ErrorState message={error} />}

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan NIM, nama, atau mata kuliah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download className="w-5 h-5" />
            <span>Export Excel</span>
          </button>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Status</option>
            <option value="Hadir">Hadir</option>
            <option value="Izin">Izin</option>
            <option value="Alpha">Alpha</option>
          </select>
          <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg">
            <Calendar className="w-5 h-5 text-gray-600" />
            <input type="date" className="text-sm text-gray-600 border-0 focus:ring-0" defaultValue="2026-05-12" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Hadir</p>
          <p className="text-2xl font-bold text-green-600">{totalHadir}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Izin</p>
          <p className="text-2xl font-bold text-yellow-600">{totalIzin}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Alpha</p>
          <p className="text-2xl font-bold text-red-600">{totalAlpha}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Persentase Hadir</p>
          <p className="text-2xl font-bold text-blue-600">{persentaseHadir}%</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">NIM</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nama Mahasiswa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Mata Kuliah</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Kelas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Pertemuan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nim}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.nama}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.mataKuliah}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.kelas}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.pertemuan}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.tanggal}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.keterangan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Menampilkan <span className="font-medium">{filteredData.length}</span> dari{" "}
            <span className="font-medium">{data.length}</span> data
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
              Previous
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">1</button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
