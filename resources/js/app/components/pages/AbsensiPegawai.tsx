import { useState } from "react";
import { Search, Filter, Download, Calendar } from "lucide-react";
import { presensiService } from "../../services/apiServices";
import { ErrorState, LoadingState, useApiData, valueOf } from "./apiPageUtils";

const absensiPegawaiData = [
  { id: 1, nip: "198501012010011001", nama: "Dr. Ahmad Yani, M.Kom.", jabatan: "Dosen", tanggal: "2026-05-12", jamMasuk: "07:45", jamKeluar: "16:10", status: "Hadir", keterangan: "-" },
  { id: 2, nip: "198703152011012002", nama: "Prof. Siti Nurhaliza, M.Kom.", jabatan: "Dosen", tanggal: "2026-05-12", jamMasuk: "07:50", jamKeluar: "16:05", status: "Hadir", keterangan: "-" },
  { id: 3, nip: "198905102012011003", nama: "Dr. Bambang Sutrisno, M.T.", jabatan: "Dosen", tanggal: "2026-05-12", jamMasuk: "08:15", jamKeluar: "-", status: "Hadir", keterangan: "Belum Checkout" },
  { id: 4, nip: "199001202013012004", nama: "Dr. Rina Wati, M.Kom.", jabatan: "Dosen", tanggal: "2026-05-12", jamMasuk: "-", jamKeluar: "-", status: "Izin", keterangan: "Sakit" },
  { id: 5, nip: "198812152010011005", nama: "M. Rizal, M.Kom.", jabatan: "Dosen", tanggal: "2026-05-12", jamMasuk: "07:55", jamKeluar: "16:00", status: "Hadir", keterangan: "-" },
  { id: 6, nip: "199203102014012006", nama: "Dr. Sri Lestari, M.Kom.", jabatan: "Dosen", tanggal: "2026-05-12", jamMasuk: "07:40", jamKeluar: "16:15", status: "Hadir", keterangan: "-" },
  { id: 7, nip: "198607252009011007", nama: "Ahmad Fauzi, S.Kom.", jabatan: "Tendik", tanggal: "2026-05-12", jamMasuk: "07:30", jamKeluar: "16:00", status: "Hadir", keterangan: "-" },
  { id: 8, nip: "199105182015012008", nama: "Siti Aminah, S.E.", jabatan: "Tendik", tanggal: "2026-05-12", jamMasuk: "-", jamKeluar: "-", status: "Alpha", keterangan: "-" },
];

function normalizePegawaiStatus(value: any) {
  const status = String(valueOf(value, "Alpha")).toLowerCase();
  if (status.includes("hadir")) return "Hadir";
  if (status.includes("izin") || status.includes("sakit")) return "Izin";
  return "Alpha";
}

function mapAbsensiPegawai(item: any) {
  const pegawai = item.pegawai ?? item.user ?? {};
  return {
    id: valueOf(item.ID_PRESENSI_PEGAWAI, item.id_presensi_pegawai, item.id),
    nip: valueOf(item.NIP, item.nip, pegawai.NIP, pegawai.nip, "-"),
    nama: valueOf(item.NAMA_PEGAWAI, item.nama_pegawai, pegawai.name, pegawai.nama, "-"),
    jabatan: valueOf(item.JABATAN, item.jabatan, pegawai.jabatan, "Dosen"),
    tanggal: valueOf(item.TANGGAL, item.tanggal, item.created_at, "-"),
    jamMasuk: valueOf(item.JAM_MASUK, item.jam_masuk, item.masuk, "-"),
    jamKeluar: valueOf(item.JAM_KELUAR, item.jam_keluar, item.keluar, "-"),
    status: normalizePegawaiStatus(valueOf(item.STATUS, item.status)),
    keterangan: valueOf(item.KETERANGAN, item.keterangan, "-"),
  };
}

export default function AbsensiPegawai() {
  const { data, loading, error } = useApiData({
    fallback: absensiPegawaiData,
    fetcher: presensiService.getPresensiPegawai,
    mapper: mapAbsensiPegawai,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterJabatan, setFilterJabatan] = useState("all");

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nip.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    const matchesJabatan = filterJabatan === "all" || item.jabatan === filterJabatan;
    return matchesSearch && matchesStatus && matchesJabatan;
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
  const persentaseHadir = data.length > 0 ? Math.round((totalHadir / data.length) * 100) : 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Absensi Pegawai</h1>
        <p className="text-gray-600 mt-1">Kelola data absensi dosen dan tenaga kependidikan</p>
      </div>

      {loading && <LoadingState label="Memuat data absensi pegawai..." />}
      {error && <ErrorState message={error} />}

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan NIP atau nama..."
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

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={filterJabatan}
            onChange={(e) => setFilterJabatan(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Jabatan</option>
            <option value="Dosen">Dosen</option>
            <option value="Tendik">Tenaga Kependidikan</option>
          </select>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">NIP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nama Pegawai</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Jabatan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Jam Masuk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Jam Keluar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nip}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.nama}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      item.jabatan === 'Dosen' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {item.jabatan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.tanggal}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.jamMasuk}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.jamKeluar}</td>
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
