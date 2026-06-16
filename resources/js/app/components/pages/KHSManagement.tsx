import { useState } from "react";
import { Search, Filter, Eye, Download } from "lucide-react";

const khsData = [
  { id: 1, nim: "2301010001", nama: "Ahmad Fauzi", semester: 4, tahunAkademik: "2024/2025 Genap", ips: 3.75, ipk: 3.68, totalSKS: 80, status: "Valid" },
  { id: 2, nim: "2301010002", nama: "Siti Nurhaliza", semester: 2, tahunAkademik: "2024/2025 Genap", ips: 3.45, ipk: 3.52, totalSKS: 42, status: "Valid" },
  { id: 3, nim: "2301010003", nama: "Muhammad Rizki", semester: 4, tahunAkademik: "2024/2025 Genap", ips: 3.82, ipk: 3.76, totalSKS: 82, status: "Valid" },
  { id: 4, nim: "2301010004", nama: "Rina Wati", semester: 0, tahunAkademik: "2024/2025 Genap", ips: 3.65, ipk: 3.65, totalSKS: 20, status: "Valid" },
  { id: 5, nim: "2301010005", nama: "Bambang Sutrisno", semester: 2, tahunAkademik: "2024/2025 Genap", ips: 3.25, ipk: 3.42, totalSKS: 40, status: "Valid" },
  { id: 6, nim: "2301010006", nama: "Sri Lestari", semester: 4, tahunAkademik: "2024/2025 Genap", ips: 3.78, ipk: 3.72, totalSKS: 81, status: "Valid" },
];

export default function KHSManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSemester, setFilterSemester] = useState("all");

  const filteredData = khsData.filter((item) => {
    const matchesSearch =
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nim.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSemester === "all" || item.semester.toString() === filterSemester;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen KHS</h1>
        <p className="text-gray-600 mt-1">Kelola Kartu Hasil Studi mahasiswa</p>
      </div>

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
            <option value="0">Semester 0</option>
            <option value="2">Semester 2</option>
            <option value="4">Semester 4</option>
            <option value="6">Semester 6</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Rata-rata IPK</p>
          <p className="text-2xl font-bold text-blue-600">3.63</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">IPK Tertinggi</p>
          <p className="text-2xl font-bold text-green-600">3.82</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">IPK Terendah</p>
          <p className="text-2xl font-bold text-orange-600">3.25</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Mahasiswa</p>
          <p className="text-2xl font-bold text-purple-600">6</p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">IPS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">IPK</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Total SKS</th>
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
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.ips.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-blue-600">{item.ipk.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.totalSKS}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      {item.status}
                    </span>
                  </td>
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
            <span className="font-medium">{khsData.length}</span> data
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
