import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Calendar, Edit, Filter, Plus, Search, Trash2 } from "lucide-react";
import Modal from "../Modal";
import { api, readJson } from "../../lib/apiClient";
import { ErrorState, LoadingState } from "./apiPageUtils";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

type PresensiPegawai = {
  id_presensi: number;
  id_user: number | string;
  nama_pegawai: string | null;
  status_presensi: "H" | "I" | "S" | "A" | string;
  waktu_masuk: string | null;
  waktu_keluar: string | null;
  tanggal: string | null;
  keterangan: string | null;
};

const emptyForm = {
  ID_USER: "",
  STATUS_PRESENSI: "H",
  WAKTU_MASUK: "",
  WAKTU_KELUAR: "",
  TANGGAL: "",
  KETERANGAN: "",
};

function getApiMessage(json: ApiResponse<unknown> | null, fallback: string) {
  const firstError = Object.values(json?.errors ?? {})[0]?.[0];
  return firstError ?? json?.message ?? fallback;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    H: "Hadir",
    I: "Izin",
    S: "Sakit",
    A: "Alpha",
  };
  return labels[status] ?? status ?? "-";
}

function statusColor(status: string) {
  if (status === "H") return "bg-green-100 text-green-800";
  if (status === "I" || status === "S") return "bg-yellow-100 text-yellow-800";
  if (status === "A") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
}

export default function AbsensiPegawai() {
  const [data, setData] = useState<PresensiPegawai[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<PresensiPegawai | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/presensi-pegawai");
      const json = await readJson<ApiResponse<PresensiPegawai[]>>(res);

      if (!res.ok || json?.success === false) {
        throw new Error(getApiMessage(json, "Gagal memuat data absensi pegawai."));
      }

      setData(Array.isArray(json?.data) ? json.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data absensi pegawai.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredData = useMemo(() => {
    const keyword = searchTerm.toLowerCase();

    return data.filter((item) => {
      const matchesSearch =
        String(item.id_user).toLowerCase().includes(keyword) ||
        (item.nama_pegawai ?? "").toLowerCase().includes(keyword);
      const matchesStatus = filterStatus === "all" || item.status_presensi === filterStatus;
      const matchesDate = !filterDate || item.tanggal === filterDate;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [data, filterDate, filterStatus, searchTerm]);

  const totals = useMemo(
    () => ({
      hadir: data.filter((item) => item.status_presensi === "H").length,
      izin: data.filter((item) => item.status_presensi === "I").length,
      sakit: data.filter((item) => item.status_presensi === "S").length,
      alpha: data.filter((item) => item.status_presensi === "A").length,
    }),
    [data]
  );

  function openCreateModal() {
    setEditData(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function openEditModal(item: PresensiPegawai) {
    setEditData(item);
    setForm({
      ID_USER: String(item.id_user ?? ""),
      STATUS_PRESENSI: item.status_presensi || "H",
      WAKTU_MASUK: item.waktu_masuk ?? "",
      WAKTU_KELUAR: item.waktu_keluar ?? "",
      TANGGAL: item.tanggal ?? "",
      KETERANGAN: item.keterangan ?? "",
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ID_USER: Number(form.ID_USER),
      STATUS_PRESENSI: form.STATUS_PRESENSI,
      WAKTU_MASUK: form.WAKTU_MASUK || null,
      WAKTU_KELUAR: form.WAKTU_KELUAR || null,
      TANGGAL: form.TANGGAL,
      KETERANGAN: form.KETERANGAN || null,
    };

    try {
      const res = editData
        ? await api.patch(`/presensi-pegawai/${editData.id_presensi}`, payload)
        : await api.post("/presensi-pegawai", payload);
      const json = await readJson<ApiResponse<PresensiPegawai>>(res);

      if (!res.ok || json?.success === false) {
        throw new Error(getApiMessage(json, "Gagal menyimpan data absensi pegawai."));
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan data absensi pegawai.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Hapus data absensi pegawai ini?")) return;

    try {
      const res = await api.delete(`/presensi-pegawai/${id}`);
      const json = await readJson<ApiResponse<null>>(res);

      if (!res.ok || json?.success === false) {
        throw new Error(getApiMessage(json, "Gagal menghapus data absensi pegawai."));
      }

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus data absensi pegawai.");
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Absensi Pegawai</h1>
        <p className="text-gray-600 mt-1">Kelola data presensi pegawai</p>
      </div>

      {loading && <LoadingState label="Memuat data absensi pegawai..." />}
      {error && <ErrorState message={error} />}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari ID user atau nama pegawai..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Presensi</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Status</option>
            <option value="H">Hadir</option>
            <option value="I">Izin</option>
            <option value="S">Sakit</option>
            <option value="A">Alpha</option>
          </select>
          <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg">
            <Calendar className="w-5 h-5 text-gray-600" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="text-sm text-gray-600 border-0 focus:ring-0"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Hadir</p>
          <p className="text-2xl font-bold text-green-600">{totals.hadir}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Izin</p>
          <p className="text-2xl font-bold text-yellow-600">{totals.izin}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Sakit</p>
          <p className="text-2xl font-bold text-yellow-600">{totals.sakit}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Alpha</p>
          <p className="text-2xl font-bold text-red-600">{totals.alpha}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">ID User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nama Pegawai</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Masuk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Keluar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Keterangan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <tr key={item.id_presensi} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.id_user}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.nama_pegawai ?? "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.tanggal ?? "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.waktu_masuk ?? "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.waktu_keluar ?? "-"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColor(item.status_presensi)}`}>
                      {statusLabel(item.status_presensi)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.keterangan ?? "-"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id_presensi)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredData.length === 0 && (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={9}>
                    Tidak ada data absensi pegawai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editData ? "Edit Presensi Pegawai" : "Tambah Presensi Pegawai"}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ID User</label>
              <input
                type="number"
                value={form.ID_USER}
                onChange={(e) => setForm({ ...form, ID_USER: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
              <input
                type="date"
                value={form.TANGGAL}
                onChange={(e) => setForm({ ...form, TANGGAL: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={form.STATUS_PRESENSI}
                onChange={(e) => setForm({ ...form, STATUS_PRESENSI: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="H">Hadir</option>
                <option value="I">Izin</option>
                <option value="S">Sakit</option>
                <option value="A">Alpha</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Waktu Masuk</label>
              <input
                type="time"
                step="1"
                value={form.WAKTU_MASUK}
                onChange={(e) => setForm({ ...form, WAKTU_MASUK: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Waktu Keluar</label>
              <input
                type="time"
                step="1"
                value={form.WAKTU_KELUAR}
                onChange={(e) => setForm({ ...form, WAKTU_KELUAR: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Keterangan</label>
              <textarea
                value={form.KETERANGAN}
                onChange={(e) => setForm({ ...form, KETERANGAN: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
