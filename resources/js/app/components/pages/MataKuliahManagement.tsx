import { useState } from "react";
import { Search, Plus, Edit, Trash2, Filter } from "lucide-react";
import Modal from "../Modal";
import { dataMasterService } from "../../services/apiServices";
import { ErrorState, LoadingState, activeStatus, useApiData, valueOf } from "./apiPageUtils";

const mataKuliahData = [
  { id: 1, kode: "TI101", nama: "Pemrograman Dasar", sks: 3, semester: 1, prodi: "D3 Teknik Informatika", status: "Aktif" },
  { id: 2, kode: "TI102", nama: "Algoritma dan Struktur Data", sks: 4, semester: 2, prodi: "D3 Teknik Informatika", status: "Aktif" },
  { id: 3, kode: "TI201", nama: "Pemrograman Web", sks: 3, semester: 3, prodi: "D3 Teknik Informatika", status: "Aktif" },
  { id: 4, kode: "TI202", nama: "Basis Data", sks: 3, semester: 3, prodi: "D3 Teknik Informatika", status: "Aktif" },
  { id: 5, kode: "TI301", nama: "Pemrograman Mobile", sks: 3, semester: 4, prodi: "D3 Teknik Informatika", status: "Aktif" },
  { id: 6, kode: "TI302", nama: "Jaringan Komputer", sks: 3, semester: 4, prodi: "D3 Teknik Informatika", status: "Aktif" },
  { id: 7, kode: "SI101", nama: "Sistem Informasi Manajemen", sks: 3, semester: 1, prodi: "D3 Sistem Informasi", status: "Aktif" },
  { id: 8, kode: "SI201", nama: "Analisis dan Perancangan SI", sks: 4, semester: 3, prodi: "D3 Sistem Informasi", status: "Aktif" },
];

function mapMataKuliah(item: any) {
  const nama = valueOf(item.NAMA_MATA_KULIAH, item.nama_mata_kuliah, item.nama, item.name);

  return {
    id: valueOf(item.ID_MATA_KULIAH, item.id_mata_kuliah, item.id, nama),
    kode: valueOf(item.KODE_MATA_KULIAH, item.kode_mata_kuliah, item.KODE_MK, item.kode, "-"),
    nama,
    sks: Number(valueOf(item.SKS, item.sks, item.jumlah_sks, 0)),
    semester: Number(valueOf(item.SEMESTER, item.semester, 0)),
    prodi: valueOf(item.prodi?.NAMA_PRODI, item.NAMA_PRODI, item.nama_prodi, item.prodi, "-"),
    status: activeStatus(valueOf(item.AKTIF, item.aktif, item.status, "Y")),
  };
}

export default function MataKuliahManagement() {
  const { data, loading, error } = useApiData({
    fallback: mataKuliahData,
    fetcher: dataMasterService.getMataKuliah,
    mapper: mapMataKuliah,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSemester, setFilterSemester] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester = filterSemester === "all" || item.semester.toString() === filterSemester;
    return matchesSearch && matchesSemester;
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
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Mata Kuliah</h1>
        <p className="text-gray-600 mt-1">Kelola data mata kuliah di POLIBAN</p>
      </div>

      {loading && <LoadingState label="Memuat data mata kuliah..." />}
      {error && <ErrorState message={error} />}

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari mata kuliah..."
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
            <span>Tambah Mata Kuliah</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Semester</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
            <option value="5">Semester 5</option>
            <option value="6">Semester 6</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Kode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nama Mata Kuliah</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">SKS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Semester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Program Studi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.kode}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.nama}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.sks}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.semester}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.prodi}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      {item.status}
                    </span>
                  </td>
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
        title={editData ? "Edit Mata Kuliah" : "Tambah Mata Kuliah"}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kode Mata Kuliah <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                defaultValue={editData?.kode}
                placeholder="Contoh: TI101"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Mata Kuliah <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                defaultValue={editData?.nama}
                placeholder="Contoh: Pemrograman Dasar"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKS <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  defaultValue={editData?.sks}
                  placeholder="Contoh: 3"
                  min="1"
                  max="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester <span className="text-red-500">*</span>
                </label>
                <select
                  defaultValue={editData?.semester}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Pilih Semester</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program Studi <span className="text-red-500">*</span>
              </label>
              <select
                defaultValue={editData?.prodi}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Pilih Program Studi</option>
                <option value="D3 Teknik Informatika">D3 Teknik Informatika</option>
                <option value="D3 Sistem Informasi">D3 Sistem Informasi</option>
                <option value="D4 Teknik Informatika">D4 Teknik Informatika</option>
              </select>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Catatan:</strong> Semua mata kuliah di politeknik bersifat wajib.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                defaultValue={editData?.status || "Aktif"}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
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
              {editData ? "Simpan Perubahan" : "Tambah Mata Kuliah"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
