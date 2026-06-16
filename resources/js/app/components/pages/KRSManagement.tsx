import { useState } from "react";
import { Search, Filter, Eye, CheckCircle, XCircle } from "lucide-react";
import { akademikService } from "../../services/apiServices";
import { ErrorState, LoadingState, useApiData, valueOf } from "./apiPageUtils";

const krsData = [
  { id: 1, nim: "2301010001", nama: "Ahmad Fauzi", semester: 5, tahunAkademik: "2025/2026 Genap", totalSKS: 21, jumlahMK: 7, status: "Disetujui", tanggalPengisian: "2026-02-05" },
  { id: 2, nim: "2301010002", nama: "Siti Nurhaliza", semester: 3, tahunAkademik: "2025/2026 Genap", totalSKS: 20, jumlahMK: 6, status: "Disetujui", tanggalPengisian: "2026-02-03" },
  { id: 3, nim: "2301010003", nama: "Muhammad Rizki", semester: 5, tahunAkademik: "2025/2026 Genap", totalSKS: 22, jumlahMK: 7, status: "Menunggu", tanggalPengisian: "2026-02-10" },
  { id: 4, nim: "2301010004", nama: "Rina Wati", semester: 1, tahunAkademik: "2025/2026 Genap", totalSKS: 20, jumlahMK: 6, status: "Disetujui", tanggalPengisian: "2026-02-02" },
  { id: 5, nim: "2301010005", nama: "Bambang Sutrisno", semester: 3, tahunAkademik: "2025/2026 Genap", totalSKS: 18, jumlahMK: 6, status: "Ditolak", tanggalPengisian: "2026-02-08" },
  { id: 6, nim: "2301010006", nama: "Sri Lestari", semester: 5, tahunAkademik: "2025/2026 Genap", totalSKS: 21, jumlahMK: 7, status: "Menunggu", tanggalPengisian: "2026-02-11" },
];

function normalizeKrsStatus(value: any) {
  const status = String(valueOf(value, "Menunggu")).toLowerCase();
  if (status.includes("setuju") || status === "approved") return "Disetujui";
  if (status.includes("tolak") || status === "rejected") return "Ditolak";
  return "Menunggu";
}

function mapKrs(item: any) {
  const mahasiswa = item.mahasiswa ?? item.user ?? {};
  return {
    id: valueOf(item.ID_KRS, item.id_krs, item.id),
    nim: valueOf(item.NIM, item.nim, mahasiswa.NIM, mahasiswa.nim, "-"),
    nama: valueOf(item.NAMA_MAHASISWA, item.nama_mahasiswa, mahasiswa.name, mahasiswa.nama, "-"),
    semester: Number(valueOf(item.SEMESTER, item.semester, 0)),
    tahunAkademik: valueOf(item.NAMA_TAHUN_AKADEMIK, item.tahun_akademik, item.tahunAkademik, "-"),
    totalSKS: Number(valueOf(item.TOTAL_SKS, item.total_sks, item.totalSKS, 0)),
    jumlahMK: Number(valueOf(item.JUMLAH_MK, item.jumlah_mk, item.jumlahMK, 0)),
    status: normalizeKrsStatus(valueOf(item.STATUS, item.status)),
    tanggalPengisian: valueOf(item.TANGGAL_PENGISIAN, item.tanggal_pengisian, item.created_at, "-"),
  };
}

export default function KRSManagement() {
  const { data, loading, error } = useApiData({
    fallback: krsData,
    fetcher: akademikService.getKrs,
    mapper: mapKrs,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nim.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Disetujui":
        return "bg-green-100 text-green-800";
      case "Menunggu":
        return "bg-yellow-100 text-yellow-800";
      case "Ditolak":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalKrs = data.length;
  const totalDisetujui = data.filter((item) => item.status === "Disetujui").length;
  const totalMenunggu = data.filter((item) => item.status === "Menunggu").length;
  const totalDitolak = data.filter((item) => item.status === "Ditolak").length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen KRS</h1>
        <p className="text-gray-600 mt-1">Kelola Kartu Rencana Studi mahasiswa</p>
      </div>

      {loading && <LoadingState label="Memuat data KRS..." />}
      {error && <ErrorState message={error} />}

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan NIM atau nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
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
            <option value="Menunggu">Menunggu Persetujuan</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Ditolak">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total KRS</p>
          <p className="text-2xl font-bold text-blue-600">{totalKrs}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Disetujui</p>
          <p className="text-2xl font-bold text-green-600">{totalDisetujui}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Menunggu</p>
          <p className="text-2xl font-bold text-yellow-600">{totalMenunggu}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Ditolak</p>
          <p className="text-2xl font-bold text-red-600">{totalDitolak}</p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Semester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tahun Akademik</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Total SKS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Jumlah MK</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nim}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.nama}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.semester}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.tahunAkademik}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.totalSKS}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.jumlahMK}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.tanggalPengisian}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Lihat Detail">
                        <Eye className="w-4 h-4" />
                      </button>
                      {item.status === "Menunggu" && (
                        <>
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors" title="Setujui">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Tolak">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
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
