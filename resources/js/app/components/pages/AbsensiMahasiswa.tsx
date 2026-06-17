import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Calendar, Edit, Filter, Search } from "lucide-react";
import Modal from "../Modal";
import { api, readJson } from "../../lib/apiClient";
import { ErrorState, LoadingState } from "./apiPageUtils";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

type PresensiMahasiswa = {
  id_presensi: number;
  id_kelas_master: number | null;
  id_kelas_mk: number | null;
  id_sesi: number | null;
  nim: string;
  waktu_presensi: string | null;
  pertemuan_ke: number | null;
  status_presensi: "H" | "I" | "S" | "A" | string;
  metode: string | null;
  kelas_master?: {
    nama_mahasiswa?: string | null;
    kelas?: {
      kelas_nama?: string | null;
      nama_kelas?: string | null;
    };
  };
  kelas_mk?: {
    kurikulum_mk?: {
      mata_kuliah?: {
        nama_mk?: string | null;
        nama_mata_kuliah?: string | null;
      };
    };
  };
};

const emptyForm = {
  ID_KELAS_MASTER: "",
  ID_KELAS_MK: "",
  NIM: "",
  WAKTU_PRESENSI: "",
  PERTEMUAN_KE: "",
  STATUS_PRESENSI: "H",
  METODE: "",
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

function toDateTimeLocal(value: string | null) {
  return value ? value.replace(" ", "T").slice(0, 19) : "";
}

function toApiDateTime(value: string) {
  return value ? value.replace("T", " ") : null;
}

export default function AbsensiMahasiswa() {
  const [data, setData] = useState<PresensiMahasiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<PresensiMahasiswa | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/akademik/presensi-mahasiswa");
      const json = await readJson<ApiResponse<PresensiMahasiswa[]>>(res);

      if (!res.ok || json?.success === false) {
        throw new Error(getApiMessage(json, "Gagal memuat data absensi mahasiswa."));
      }

      setData(Array.isArray(json?.data) ? json.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data absensi mahasiswa.");
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
      const namaMahasiswa = item.kelas_master?.nama_mahasiswa ?? "";
      const mataKuliah = item.kelas_mk?.kurikulum_mk?.mata_kuliah?.nama_mk ?? item.kelas_mk?.kurikulum_mk?.mata_kuliah?.nama_mata_kuliah ?? "";
      const matchesSearch =
        item.nim.toLowerCase().includes(keyword) ||
        namaMahasiswa.toLowerCase().includes(keyword) ||
        mataKuliah.toLowerCase().includes(keyword);
      const matchesStatus = filterStatus === "all" || item.status_presensi === filterStatus;
      const matchesDate = !filterDate || item.waktu_presensi?.startsWith(filterDate);
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

  function openEditModal(item: PresensiMahasiswa) {
    setEditData(item);
    setForm({
      ID_KELAS_MASTER: item.id_kelas_master ? String(item.id_kelas_master) : "",
      ID_KELAS_MK: item.id_kelas_mk ? String(item.id_kelas_mk) : "",
      NIM: item.nim ?? "",
      WAKTU_PRESENSI: toDateTimeLocal(item.waktu_presensi),
      PERTEMUAN_KE: item.pertemuan_ke ? String(item.pertemuan_ke) : "",
      STATUS_PRESENSI: item.status_presensi || "H",
      METODE: item.metode ?? "",
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editData) return;

    setSaving(true);
    setError(null);

    const payload = {
      ID_KELAS_MASTER: form.ID_KELAS_MASTER ? Number(form.ID_KELAS_MASTER) : undefined,
      ID_KELAS_MK: form.ID_KELAS_MK ? Number(form.ID_KELAS_MK) : null,
      NIM: form.NIM,
      WAKTU_PRESENSI: toApiDateTime(form.WAKTU_PRESENSI),
      PERTEMUAN_KE: form.PERTEMUAN_KE ? Number(form.PERTEMUAN_KE) : null,
      STATUS_PRESENSI: form.STATUS_PRESENSI,
      METODE: form.METODE || null,
    };

    try {
      const res = await api.patch(`/akademik/presensi-mahasiswa/${editData.id_presensi}`, payload);
      const json = await readJson<ApiResponse<PresensiMahasiswa>>(res);

      if (!res.ok || json?.success === false) {
        throw new Error(getApiMessage(json, "Gagal menyimpan data absensi mahasiswa."));
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan data absensi mahasiswa.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Absensi Mahasiswa</h1>
        <p className="text-gray-600 mt-1">Kelola koreksi data presensi mahasiswa</p>
      </div>

      {loading && <LoadingState label="Memuat data absensi mahasiswa..." />}
      {error && <ErrorState message={error} />}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari NIM, nama mahasiswa, atau mata kuliah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">NIM</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Kelas Master</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Kelas MK</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Pertemuan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Waktu Presensi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Metode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item, index) => {
                const namaMahasiswa = item.kelas_master?.nama_mahasiswa ?? "-";

                return (
                  <tr key={item.id_presensi} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nim}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{namaMahasiswa}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.id_kelas_master ?? "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.id_kelas_mk ?? "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.pertemuan_ke ?? "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.waktu_presensi ?? "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColor(item.status_presensi)}`}>
                        {statusLabel(item.status_presensi)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.metode ?? "-"}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredData.length === 0 && (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={10}>
                    Tidak ada data absensi mahasiswa.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Edit Absensi Mahasiswa">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ID Kelas Master</label>
              <input
                type="number"
                value={form.ID_KELAS_MASTER}
                onChange={(e) => setForm({ ...form, ID_KELAS_MASTER: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ID Kelas MK</label>
              <input
                type="number"
                value={form.ID_KELAS_MK}
                onChange={(e) => setForm({ ...form, ID_KELAS_MK: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">NIM</label>
              <input
                type="text"
                value={form.NIM}
                onChange={(e) => setForm({ ...form, NIM: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pertemuan Ke</label>
              <input
                type="number"
                value={form.PERTEMUAN_KE}
                onChange={(e) => setForm({ ...form, PERTEMUAN_KE: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Waktu Presensi</label>
              <input
                type="datetime-local"
                step="1"
                value={form.WAKTU_PRESENSI}
                onChange={(e) => setForm({ ...form, WAKTU_PRESENSI: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Metode</label>
              <input
                type="text"
                value={form.METODE}
                onChange={(e) => setForm({ ...form, METODE: e.target.value })}
                placeholder="Manual, QR, RFID, dll."
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
