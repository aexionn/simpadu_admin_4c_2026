import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Edit, Loader2, Plus, Search, Trash2 } from "lucide-react";
import Modal from "../Modal";
import { api, readJson } from "../../lib/apiClient";

const tahunAkademikData = [
  { id: 1, tahun: "2025/2026", semester: "Genap", tanggalMulai: "2026-02-01", tanggalSelesai: "2026-07-31", status: "Aktif" },
  { id: 2, tahun: "2025/2026", semester: "Ganjil", tanggalMulai: "2025-08-01", tanggalSelesai: "2026-01-31", status: "Selesai" },
  { id: 3, tahun: "2024/2025", semester: "Genap", tanggalMulai: "2025-02-01", tanggalSelesai: "2025-07-31", status: "Selesai" },
  { id: 4, tahun: "2024/2025", semester: "Ganjil", tanggalMulai: "2024-08-01", tanggalSelesai: "2025-01-31", status: "Selesai" },
];

type TahunAkademik = {
  id: number | string;
  tahun: string;
  semester: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  status: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  data?: any;
};

function mapTahunAkademik(item: any): TahunAkademik {
  const tahun =
    item.NAMA_TAHUN_AKADEMIK ??
    item.nama_tahun_akademik ??
    item.tahun_akademik ??
    item.tahun ??
    "-";
  const semester = item.SEMESTER ?? item.semester ?? "-";
  const aktif = item.AKTIF ?? item.aktif ?? item.status;

  return {
    id:
      item.ID_TAHUN_AKADEMIK ??
      item.id_tahun_akademik ??
      item.id ??
      `${tahun}-${semester}`,
    tahun,
    semester,
    tanggalMulai:
      item.TGL_AWAL_KULIAH ??
      item.tgl_awal_kuliah ??
      item.tanggal_mulai ??
      item.tanggalMulai ??
      "-",
    tanggalSelesai:
      item.TGL_AKHIR_KULIAH ??
      item.tgl_akhir_kuliah ??
      item.tanggal_selesai ??
      item.tanggalSelesai ??
      "-",
    status: aktif === "Y" || aktif === true || aktif === "Aktif" ? "Aktif" : "Selesai",
  };
}

function getErrorMessage(status: number, message?: string) {
  if (status === 401) return "Session expired. Please login again.";
  if (status === 403) return "You do not have permission to view this data.";
  if (status === 404) return "Data tahun akademik tidak ditemukan.";
  if (status === 422) return message ?? "Permintaan data tidak valid.";
  if (status >= 500) return "Server sedang bermasalah. Coba lagi nanti.";
  return message ?? "Failed to load API data. Showing fallback data.";
}

export default function TahunAkademikManagement() {
  const [data, setData] = useState<TahunAkademik[]>(tahunAkademikData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadTahunAkademik() {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get("/data-master/tahun-akademik");
        const json = await readJson<ApiResponse>(res);

        if (!res.ok || json?.success === false) {
          throw new Error(getErrorMessage(res.status, json?.message));
        }

        const rows = Array.isArray(json?.data) ? json.data : [];
        if (!isMounted) return;

        setData(rows.length > 0 ? rows.map(mapTahunAkademik) : tahunAkademikData);
      } catch (err) {
        if (!isMounted) return;
        setError(
          err instanceof Error
            ? `${err.message} Showing fallback data.`
            : "Failed to load API data. Showing fallback data."
        );
        setData(tahunAkademikData);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTahunAkademik();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredData = data.filter(
    (item) =>
      item.tahun.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.semester.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Tahun Akademik</h1>
        <p className="text-gray-600 mt-1">Kelola tahun akademik dan semester</p>
      </div>

      {loading && (
        <div className="bg-white rounded-lg shadow p-6 mb-6 flex items-center gap-3 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-sm">Memuat data tahun akademik...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari tahun akademik..."
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
            <span>Tambah Tahun Akademik</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tahun Akademik</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tanggal Mulai</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tanggal Selesai</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.tahun}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.tanggalMulai}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.tanggalSelesai}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      item.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {item.status !== 'Aktif' && (
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors" title="Set Aktif">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
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
        title={editData ? "Edit Tahun Akademik" : "Tambah Tahun Akademik"}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tahun Akademik <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                defaultValue={editData?.tahun}
                placeholder="Contoh: 2025/2026"
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
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Mulai <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                defaultValue={editData?.tanggalMulai}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Selesai <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                defaultValue={editData?.tanggalSelesai}
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
              {editData ? "Simpan Perubahan" : "Tambah Tahun Akademik"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
