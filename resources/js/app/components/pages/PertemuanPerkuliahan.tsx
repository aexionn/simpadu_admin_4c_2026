import { useState } from "react";
import { Search, Plus, Edit, Trash2, Filter } from "lucide-react";
import Modal from "../Modal";
import { akademikService } from "../../services/apiServices";
import { ErrorState, LoadingState, useApiData, valueOf } from "./apiPageUtils";

const pertemuanData = [
  { id: 1, pertemuan: 1, mataKuliah: "Pemrograman Web", kelas: "TI-3A", dosen: "Dr. Ahmad Yani", tanggal: "2026-05-05", topik: "Pengenalan HTML dan CSS", status: "Selesai" },
  { id: 2, pertemuan: 2, mataKuliah: "Pemrograman Web", kelas: "TI-3A", dosen: "Dr. Ahmad Yani", tanggal: "2026-05-12", topik: "JavaScript Dasar", status: "Berlangsung" },
  { id: 3, pertemuan: 1, mataKuliah: "Basis Data", kelas: "SI-2B", dosen: "Prof. Siti Nurhaliza", tanggal: "2026-05-06", topik: "Konsep Database", status: "Selesai" },
  { id: 4, pertemuan: 2, mataKuliah: "Basis Data", kelas: "SI-2B", dosen: "Prof. Siti Nurhaliza", tanggal: "2026-05-13", topik: "SQL Query", status: "Dijadwalkan" },
  { id: 5, pertemuan: 1, mataKuliah: "Jaringan Komputer", kelas: "TI-4A", dosen: "Dr. Bambang Sutrisno", tanggal: "2026-05-07", topik: "Topologi Jaringan", status: "Selesai" },
];

function normalizePertemuanStatus(value: any) {
  const status = String(valueOf(value, "Dijadwalkan")).toLowerCase();
  if (status.includes("selesai")) return "Selesai";
  if (status.includes("langsung") || status.includes("berlangsung")) return "Berlangsung";
  return "Dijadwalkan";
}

function mapPertemuan(item: any) {
  const mataKuliah = item.mata_kuliah ?? item.mataKuliah ?? {};
  const kelas = item.kelas ?? item.kelas_master ?? {};
  const dosen = item.dosen ?? item.pegawai ?? {};

  return {
    id: valueOf(item.ID_PERTEMUAN, item.ID_PRESENSI, item.id_pertemuan, item.id_presensi, item.id),
    pertemuan: Number(valueOf(item.PERTEMUAN_KE, item.pertemuan_ke, item.pertemuan, 0)),
    mataKuliah: valueOf(
      item.NAMA_MATA_KULIAH,
      item.nama_mata_kuliah,
      mataKuliah.NAMA_MATA_KULIAH,
      mataKuliah.nama_mata_kuliah,
      "-"
    ),
    kelas: valueOf(item.KELAS_NAMA, item.nama_kelas, kelas.KELAS_NAMA, kelas.nama_kelas, item.kelas, "-"),
    dosen: valueOf(item.NAMA_DOSEN, item.nama_dosen, dosen.name, dosen.nama, "-"),
    tanggal: valueOf(item.TANGGAL, item.tanggal, item.created_at, "-"),
    topik: valueOf(item.TOPIK, item.topik, item.MATERI, item.materi, "-"),
    status: normalizePertemuanStatus(valueOf(item.STATUS, item.status)),
  };
}

export default function PertemuanPerkuliahan() {
  const { data, loading, error } = useApiData({
    fallback: pertemuanData,
    fetcher: akademikService.getPresensiRoster,
    mapper: mapPertemuan,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.mataKuliah.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.dosen.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || item.status === filterStatus;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Selesai":
        return "bg-gray-100 text-gray-800";
      case "Berlangsung":
        return "bg-blue-100 text-blue-800";
      case "Dijadwalkan":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pertemuan Perkuliahan</h1>
        <p className="text-gray-600 mt-1">Kelola data pertemuan dan materi kuliah</p>
      </div>

      {loading && <LoadingState label="Memuat data pertemuan perkuliahan..." />}
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
            <span>Tambah Pertemuan</span>
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
            <option value="Dijadwalkan">Dijadwalkan</option>
            <option value="Berlangsung">Berlangsung</option>
            <option value="Selesai">Selesai</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Pertemuan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Mata Kuliah</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Kelas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Dosen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Topik</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.pertemuan}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.mataKuliah}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.kelas}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.dosen}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.tanggal}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.topik}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
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
        title={editData ? "Edit Pertemuan" : "Tambah Pertemuan"}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pertemuan Ke- <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                defaultValue={editData?.pertemuan}
                placeholder="Contoh: 1"
                min="1"
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
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                defaultValue={editData?.tanggal}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topik <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                defaultValue={editData?.topik}
                placeholder="Topik/materi pertemuan"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                defaultValue={editData?.status || "Dijadwalkan"}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="Dijadwalkan">Dijadwalkan</option>
                <option value="Berlangsung">Berlangsung</option>
                <option value="Selesai">Selesai</option>
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
              {editData ? "Simpan Perubahan" : "Tambah Pertemuan"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
