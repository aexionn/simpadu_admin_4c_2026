import { useState } from "react";
import { Search, Plus, Edit, Trash2, Filter, Eye } from "lucide-react";
import Modal from "../Modal";
import { dataMasterService } from "../../services/apiServices";
import { ErrorState, LoadingState, activeStatus, useApiData, valueOf } from "./apiPageUtils";

const kurikulumData = [
  { id: 1, kode: "KUR2024-TI", nama: "Kurikulum 2024 - Teknik Informatika", prodi: "D3 Teknik Informatika", tahun: "2024", totalSKS: 110, status: "Aktif" },
  { id: 2, kode: "KUR2024-SI", nama: "Kurikulum 2024 - Sistem Informasi", prodi: "D3 Sistem Informasi", tahun: "2024", totalSKS: 108, status: "Aktif" },
  { id: 3, kode: "KUR2023-TI", nama: "Kurikulum 2023 - Teknik Informatika", prodi: "D3 Teknik Informatika", tahun: "2023", totalSKS: 112, status: "Nonaktif" },
  { id: 4, kode: "KUR2024-TE", nama: "Kurikulum 2024 - Teknik Elektro", prodi: "D3 Teknik Elektro", tahun: "2024", totalSKS: 115, status: "Aktif" },
  { id: 5, kode: "KUR2024-AK", nama: "Kurikulum 2024 - Akuntansi", prodi: "D3 Akuntansi", tahun: "2024", totalSKS: 106, status: "Aktif" },
];

function mapKurikulum(item: any) {
  const nama = valueOf(item.NAMA_KURIKULUM, item.nama_kurikulum, item.nama, item.name);
  const tahun = valueOf(item.TAHUN, item.tahun, item.tahun_akademik?.NAMA_TAHUN_AKADEMIK, "-");

  return {
    id: valueOf(item.ID_KURIKULUM, item.id_kurikulum, item.id, nama),
    kode: valueOf(item.KODE_KURIKULUM, item.kode_kurikulum, item.kode, "-"),
    nama,
    prodi: valueOf(item.prodi?.NAMA_PRODI, item.NAMA_PRODI, item.nama_prodi, item.prodi, "-"),
    tahun,
    totalSKS: Number(valueOf(item.TOTAL_SKS, item.total_sks, item.totalSKS, 0)),
    status: activeStatus(valueOf(item.AKTIF, item.aktif, item.status, "Y")),
  };
}

export default function KurikulumManagement() {
  const { data, loading, error } = useApiData({
    fallback: kurikulumData,
    fetcher: dataMasterService.getKurikulum,
    mapper: mapKurikulum,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProdi, setFilterProdi] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterProdi === "all" || item.prodi === filterProdi;
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
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Kurikulum</h1>
        <p className="text-gray-600 mt-1">Kelola kurikulum program studi</p>
      </div>

      {loading && <LoadingState label="Memuat data kurikulum..." />}
      {error && <ErrorState message={error} />}

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kurikulum..."
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
            <span>Tambah Kurikulum</span>
          </button>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={filterProdi}
            onChange={(e) => setFilterProdi(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Program Studi</option>
            <option value="D3 Teknik Informatika">D3 Teknik Informatika</option>
            <option value="D3 Sistem Informasi">D3 Sistem Informasi</option>
            <option value="D3 Teknik Elektro">D3 Teknik Elektro</option>
            <option value="D3 Akuntansi">D3 Akuntansi</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nama Kurikulum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Program Studi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tahun</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Total SKS</th>
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
                  <td className="px-6 py-4 text-sm text-gray-600">{item.prodi}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.tahun}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.totalSKS}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      item.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors" title="Lihat Detail">
                        <Eye className="w-4 h-4" />
                      </button>
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
        title={editData ? "Edit Kurikulum" : "Tambah Kurikulum"}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kode Kurikulum <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                defaultValue={editData?.kode}
                placeholder="Contoh: KUR2024-TI"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Kurikulum <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                defaultValue={editData?.nama}
                placeholder="Contoh: Kurikulum 2024 - Teknik Informatika"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
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
                <option value="D3 Teknik Elektro">D3 Teknik Elektro</option>
                <option value="D3 Akuntansi">D3 Akuntansi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tahun <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                defaultValue={editData?.tahun}
                placeholder="Contoh: 2024"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total SKS <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                defaultValue={editData?.totalSKS}
                placeholder="Contoh: 110"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
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
              {editData ? "Simpan Perubahan" : "Tambah Kurikulum"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
