import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { api, readJson } from "../../lib/apiClient";

type KrsStatus = "Disetujui" | "Ditolak" | "Menunggu Persetujuan";

interface KrsItem {
  id_krs: number;
  id_kelas_master: number;
  nim: string;
  semester: number;
  status: KrsStatus;
  kelas_master?: {
    id_kelas?: number;
    nama_kelas?: string | null;
    tahun_akademik?: number | string | null;
  } | null;
  kelas_mks?: Array<{ id_kelas_mk: number }>;
  created_at?: string | null;
}

function getApiMessage(json: any, fallback: string) {
  return (
    json?.message ??
    Object.values(json?.errors ?? {})?.[0]?.[0] ??
    fallback
  );
}

function getStatusColor(status: KrsStatus) {
  if (status === "Disetujui") return "bg-green-100 text-green-800";
  if (status === "Ditolak") return "bg-red-100 text-red-800";
  return "bg-yellow-100 text-yellow-800";
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function KRSManagement() {
  const [data, setData] = useState<KrsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | KrsStatus>("all");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<KrsItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.get("/akademik/krs");
      const json = await readJson<any>(res);

      if (!res.ok || json?.success === false) {
        throw new Error(getApiMessage(json, "Gagal memuat data KRS."));
      }

      setData(json?.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data KRS.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = data.filter((item) => {
    const keyword = searchTerm.toLowerCase();
    const matchesSearch =
      item.nim.toLowerCase().includes(keyword) ||
      String(item.id_krs).includes(keyword) ||
      String(item.id_kelas_master).includes(keyword) ||
      (item.kelas_master?.nama_kelas ?? "").toLowerCase().includes(keyword);
    const matchesFilter = filterStatus === "all" || item.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const updateStatus = async (item: KrsItem, status: KrsStatus) => {
    setUpdatingId(item.id_krs);
    setError(null);

    try {
      const res = await api.patch(`/akademik/krs/${item.id_krs}/status`, {
        status,
      });
      const json = await readJson<any>(res);

      if (!res.ok || json?.success === false) {
        throw new Error(getApiMessage(json, "Gagal memperbarui status KRS."));
      }

      await fetchData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memperbarui status KRS.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const res = await api.delete(`/akademik/krs/${deleteTarget.id_krs}`);
      const json = await readJson<any>(res);

      if (!res.ok || json?.success === false) {
        throw new Error(getApiMessage(json, "Gagal menghapus KRS."));
      }

      setDeleteTarget(null);
      await fetchData();
    } catch (err) {
      setDeleteTarget(null);
      setError(err instanceof Error ? err.message : "Gagal menghapus KRS.");
    } finally {
      setIsDeleting(false);
    }
  };

  const totalDisetujui = data.filter((item) => item.status === "Disetujui").length;
  const totalMenunggu = data.filter((item) => item.status === "Menunggu Persetujuan").length;
  const totalDitolak = data.filter((item) => item.status === "Ditolak").length;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen KRS</h1>
        <p className="text-gray-600 mt-1">Kelola Kartu Rencana Studi mahasiswa</p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="flex-1 text-sm">{error}</p>
          <button
            onClick={fetchData}
            className="flex items-center gap-1 text-sm font-medium hover:underline"
          >
            <RefreshCw className="w-4 h-4" />
            Coba lagi
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari ID KRS, NIM, atau kelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Status</option>
            <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Ditolak">Ditolak</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total KRS</p>
          <p className="text-2xl font-bold text-blue-600">{data.length}</p>
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Memuat data...</span>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            Tidak ada data KRS yang cocok.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-28 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">ID KRS</th>
                  <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">NIM</th>
                  <th className="w-28 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Semester</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Kelas</th>
                  <th className="w-36 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Kelas MK</th>
                  <th className="w-36 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tanggal</th>
                  <th className="w-44 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                  <th className="w-36 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((item) => (
                  <tr key={item.id_krs} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.id_krs}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.nim}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.semester}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.kelas_master?.nama_kelas ?? `ID Master ${item.id_kelas_master}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.kelas_mks?.length ?? 0} kelas</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(item.created_at)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {item.status === "Menunggu Persetujuan" && (
                          <>
                            <button
                              onClick={() => updateStatus(item, "Disetujui")}
                              disabled={updatingId === item.id_krs}
                              className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                              title="Setujui"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateStatus(item, "Ditolak")}
                              disabled={updatingId === item.id_krs}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                              title="Tolak"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filteredData.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Menampilkan <span className="font-medium">{filteredData.length}</span> dari{" "}
              <span className="font-medium">{data.length}</span> KRS
            </p>
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => !isDeleting && setDeleteTarget(null)}
          />
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900">Hapus KRS</h3>
            <p className="text-sm text-gray-600 mt-2">
              Yakin ingin menghapus KRS #{deleteTarget.id_krs} milik NIM{" "}
              <span className="font-medium text-gray-900">{deleteTarget.nim}</span>?
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
