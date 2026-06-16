import { useState } from "react";
import { Search, Plus, Edit, Trash2, Filter, Calendar } from "lucide-react";
import Modal from "../Modal";
import { akademikService } from "../../services/apiServices";
import { ErrorState, LoadingState, useApiData, valueOf } from "./apiPageUtils";

const jadwalData = [
  { id: 1, hari: "Senin", waktu: "08:00 - 10:00", mataKuliah: "Pemrograman Web", kelas: "TI-3A", dosen: "Dr. Ahmad Yani", ruangan: "Lab Komputer 1", semester: "Genap 2025/2026" },
  { id: 2, hari: "Senin", waktu: "10:00 - 12:00", mataKuliah: "Basis Data", kelas: "SI-2B", dosen: "Prof. Siti Nurhaliza", ruangan: "Ruang 301", semester: "Genap 2025/2026" },
  { id: 3, hari: "Selasa", waktu: "08:00 - 10:00", mataKuliah: "Algoritma dan Struktur Data", kelas: "TI-2A", dosen: "Dr. Bambang Sutrisno", ruangan: "Ruang 205", semester: "Genap 2025/2026" },
  { id: 4, hari: "Selasa", waktu: "13:00 - 15:00", mataKuliah: "Jaringan Komputer", kelas: "TI-4A", dosen: "Dr. Rina Wati", ruangan: "Lab Jaringan", semester: "Genap 2025/2026" },
  { id: 5, hari: "Rabu", waktu: "08:00 - 10:00", mataKuliah: "Pemrograman Mobile", kelas: "TI-3B", dosen: "M. Rizal, M.Kom.", ruangan: "Lab Komputer 2", semester: "Genap 2025/2026" },
  { id: 6, hari: "Rabu", waktu: "10:00 - 12:00", mataKuliah: "Sistem Informasi", kelas: "SI-3C", dosen: "Dr. Sri Lestari", ruangan: "Ruang 302", semester: "Genap 2025/2026" },
  { id: 7, hari: "Kamis", waktu: "13:00 - 15:00", mataKuliah: "Basis Data Lanjut", kelas: "TI-4B", dosen: "Prof. Ahmad Yani", ruangan: "Lab Database", semester: "Genap 2025/2026" },
  { id: 8, hari: "Jumat", waktu: "08:00 - 10:00", mataKuliah: "Pemrograman Dasar", kelas: "TI-1A", dosen: "Dr. Fajar Nugroho", ruangan: "Lab Komputer 1", semester: "Genap 2025/2026" },
];

function mapJadwal(item: any) {
  const mataKuliah = item.mata_kuliah ?? item.mataKuliah ?? {};
  const kelas = item.kelas ?? item.kelas_master ?? {};
  const dosen = item.dosen ?? item.pegawai ?? {};
  const ruang = item.ruang ?? item.ruangan ?? {};
  const mulai = valueOf(item.JAM_MULAI, item.jam_mulai, item.waktu_mulai, "");
  const selesai = valueOf(item.JAM_SELESAI, item.jam_selesai, item.waktu_selesai, "");

  return {
    id: valueOf(item.ID_KELAS_MK, item.id_kelas_mk, item.id),
    hari: valueOf(item.hari?.NAMA_HARI, item.NAMA_HARI, item.hari, "-"),
    waktu: mulai || selesai ? `${mulai} - ${selesai}` : valueOf(item.waktu, "-"),
    mataKuliah: valueOf(
      item.NAMA_MATA_KULIAH,
      item.nama_mata_kuliah,
      mataKuliah.NAMA_MATA_KULIAH,
      mataKuliah.nama_mata_kuliah,
      "-"
    ),
    kelas: valueOf(item.KELAS_NAMA, item.nama_kelas, kelas.KELAS_NAMA, kelas.nama_kelas, item.kelas, "-"),
    dosen: valueOf(item.NAMA_DOSEN, item.nama_dosen, dosen.name, dosen.nama, "-"),
    ruangan: valueOf(item.NAMA_RUANG, item.nama_ruang, ruang.NAMA_RUANG, ruang.nama_ruang, item.ruangan, "-"),
    semester: valueOf(item.semester, item.NAMA_TAHUN_AKADEMIK, "Genap 2025/2026"),
  };
}

export default function JadwalKuliah() {
  const { data, loading, error } = useApiData({
    fallback: jadwalData,
    fetcher: akademikService.getKelasMk,
    mapper: mapJadwal,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterHari, setFilterHari] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.mataKuliah.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.dosen.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterHari === "all" || item.hari === filterHari;
    return matchesSearch && matchesFilter;
  });

  const handleAdd = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditData(item);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Jadwal Kuliah</h1>
        <p className="text-gray-600 mt-1">Kelola jadwal perkuliahan</p>
      </div>

      {loading && <LoadingState label="Memuat data jadwal kuliah..." />}
      {error && <ErrorState message={error} />}

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari mata kuliah, kelas, atau dosen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Jadwal</span>
          </button>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={filterHari}
            onChange={(e) => setFilterHari(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Hari</option>
            <option value="Senin">Senin</option>
            <option value="Selasa">Selasa</option>
            <option value="Rabu">Rabu</option>
            <option value="Kamis">Kamis</option>
            <option value="Jumat">Jumat</option>
            <option value="Sabtu">Sabtu</option>
          </select>
          <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600">Semester: Genap 2025/2026</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Hari</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Waktu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Mata Kuliah</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Kelas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Dosen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Ruangan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {item.hari}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.waktu}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.mataKuliah}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.kelas}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.dosen}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.ruangan}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
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

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editData ? "Edit Jadwal Kuliah" : "Tambah Jadwal Kuliah"}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hari <span className="text-red-500">*</span>
              </label>
              <select
                defaultValue={editData?.hari}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Pilih Hari</option>
                <option value="Senin">Senin</option>
                <option value="Selasa">Selasa</option>
                <option value="Rabu">Rabu</option>
                <option value="Kamis">Kamis</option>
                <option value="Jumat">Jumat</option>
                <option value="Sabtu">Sabtu</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Waktu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                defaultValue={editData?.waktu}
                placeholder="Contoh: 08:00 - 10:00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mata Kuliah <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                defaultValue={editData?.mataKuliah}
                placeholder="Contoh: Pemrograman Web"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kelas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                defaultValue={editData?.kelas}
                placeholder="Contoh: TI-3A"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dosen <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                defaultValue={editData?.dosen}
                placeholder="Contoh: Dr. Ahmad Yani"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ruangan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                defaultValue={editData?.ruangan}
                placeholder="Contoh: Lab Komputer 1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editData ? "Simpan Perubahan" : "Tambah Jadwal"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
