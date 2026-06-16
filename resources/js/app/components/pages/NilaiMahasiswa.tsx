import { useState } from "react";
import { Search, Filter, Download, Eye } from "lucide-react";
import { akademikService } from "../../services/apiServices";
import { ErrorState, LoadingState, useApiData, valueOf } from "./apiPageUtils";

const nilaiData = [
  { id: 1, nim: "2301010001", nama: "Ahmad Fauzi", mataKuliah: "Pemrograman Web", semester: "Genap 2025/2026", nilaiAkhir: 85, nilaiHuruf: "A", ips: 3.75, ipk: 3.68 },
  { id: 2, nim: "2301010002", nama: "Siti Nurhaliza", mataKuliah: "Basis Data", semester: "Genap 2025/2026", nilaiAkhir: 78, nilaiHuruf: "B+", ips: 3.45, ipk: 3.52 },
  { id: 3, nim: "2301010003", nama: "Muhammad Rizki", mataKuliah: "Algoritma dan Struktur Data", semester: "Genap 2025/2026", nilaiAkhir: 92, nilaiHuruf: "A", ips: 3.82, ipk: 3.76 },
  { id: 4, nim: "2301010004", nama: "Rina Wati", mataKuliah: "Pemrograman Mobile", semester: "Genap 2025/2026", nilaiAkhir: 88, nilaiHuruf: "A", ips: 3.65, ipk: 3.58 },
  { id: 5, nim: "2301010005", nama: "Bambang Sutrisno", mataKuliah: "Jaringan Komputer", semester: "Genap 2025/2026", nilaiAkhir: 75, nilaiHuruf: "B", ips: 3.25, ipk: 3.42 },
  { id: 6, nim: "2301010006", nama: "Sri Lestari", mataKuliah: "Sistem Informasi", semester: "Genap 2025/2026", nilaiAkhir: 90, nilaiHuruf: "A", ips: 3.78, ipk: 3.72 },
  { id: 7, nim: "2301010007", nama: "Fajar Nugroho", mataKuliah: "Pemrograman Web", semester: "Genap 2025/2026", nilaiAkhir: 82, nilaiHuruf: "A-", ips: 3.58, ipk: 3.61 },
  { id: 8, nim: "2301010008", nama: "Dewi Kartika", mataKuliah: "Basis Data", semester: "Genap 2025/2026", nilaiAkhir: 86, nilaiHuruf: "A", ips: 3.68, ipk: 3.65 },
];

function mapNilai(item: any) {
  const mahasiswa = item.mahasiswa ?? item.user ?? {};
  const mataKuliah = item.mata_kuliah ?? item.mataKuliah ?? {};

  return {
    id: valueOf(item.ID_NILAI, item.id_nilai, item.id),
    nim: valueOf(item.NIM, item.nim, mahasiswa.NIM, mahasiswa.nim, "-"),
    nama: valueOf(item.NAMA_MAHASISWA, item.nama_mahasiswa, mahasiswa.name, mahasiswa.nama, "-"),
    mataKuliah: valueOf(
      item.NAMA_MATA_KULIAH,
      item.nama_mata_kuliah,
      mataKuliah.NAMA_MATA_KULIAH,
      mataKuliah.nama_mata_kuliah,
      item.mataKuliah,
      "-"
    ),
    semester: valueOf(item.SEMESTER, item.semester, item.tahun_akademik, "-"),
    nilaiAkhir: Number(valueOf(item.NILAI_AKHIR, item.nilai_akhir, item.nilaiAkhir, 0)),
    nilaiHuruf: valueOf(item.NILAI_HURUF, item.nilai_huruf, item.nilaiHuruf, "-"),
    ips: Number(valueOf(item.IPS, item.ips, 0)),
    ipk: Number(valueOf(item.IPK, item.ipk, 0)),
  };
}

export default function NilaiMahasiswa() {
  const { data, loading, error } = useApiData({
    fallback: nilaiData,
    fetcher: akademikService.getNilai,
    mapper: mapNilai,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSemester, setFilterSemester] = useState("all");

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mataKuliah.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSemester === "all" || item.semester === filterSemester;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nilai Mahasiswa</h1>
        <p className="text-gray-600 mt-1">Kelola data nilai mahasiswa</p>
      </div>

      {loading && <LoadingState label="Memuat data nilai mahasiswa..." />}
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
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Semester</option>
            <option value="Genap 2025/2026">Genap 2025/2026</option>
            <option value="Ganjil 2025/2026">Ganjil 2025/2026</option>
            <option value="Genap 2024/2025">Genap 2024/2025</option>
            <option value="Ganjil 2024/2025">Ganjil 2024/2025</option>
          </select>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Catatan:</strong> Data nilai hanya menampilkan Nilai Akhir, Nilai Huruf, IPS, dan IPK sesuai dengan sistem database akademik POLIBAN.
        </p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Semester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nilai Akhir</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nilai Huruf</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">IPS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">IPK</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nim}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.nama}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.mataKuliah}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.semester}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.nilaiAkhir}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      item.nilaiHuruf === 'A' ? 'bg-green-100 text-green-800' :
                      item.nilaiHuruf.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.nilaiHuruf}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.ips.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.ipk.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Lihat Detail">
                      <Eye className="w-4 h-4" />
                    </button>
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
