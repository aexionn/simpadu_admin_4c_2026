import { useState, useEffect, useCallback } from "react";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    CheckCircle,
    Loader2,
    AlertCircle,
    RefreshCw,
} from "lucide-react";
import Modal from "../Modal";
import { api } from "../../lib/apiClient";

// ─── Types (sesuai TahunAkademikResource dari API) ────────────────────────────

interface TahunAkademik {
    id_tahun_akademik: number;
    nama_tahun_akademik: string;
    aktif: string; // "Y" | "T"
    tgl_awal_kuliah: string;
    tgl_akhir_kuliah: string;
}

interface FormData {
    tahun: string;    // e.g. "2025/2026"
    semester: string; // "Ganjil" | "Genap"
    tgl_awal_kuliah: string;
    tgl_akhir_kuliah: string;
    aktif: string;    // "Y" | "T"
}

const EMPTY_FORM: FormData = {
    tahun: "",
    semester: "",
    tgl_awal_kuliah: "",
    tgl_akhir_kuliah: "",
    aktif: "Y",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse "2025/2026 Ganjil" → { tahun: "2025/2026", semester: "Ganjil" } */
function parseNama(nama: string): { tahun: string; semester: string } {
    const parts = nama.trim().split(/\s+/);
    if (parts.length >= 2) {
        const semester = parts[parts.length - 1];
        const tahun = parts.slice(0, -1).join(" ");
        if (semester === "Ganjil" || semester === "Genap") {
            return { tahun, semester };
        }
    }
    return { tahun: nama, semester: "" };
}

/** Build NAMA_TAHUN_AKADEMIK from form fields */
function buildNama(form: FormData): string {
    const t = form.tahun.trim();
    const s = form.semester;
    if (!s) return t;
    return `${t} ${s}`;
}

// ─── Komponen utama ───────────────────────────────────────────────────────────

export default function TahunAkademikManagement() {
    // ── State data ──
    const [data, setData] = useState<TahunAkademik[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ── State modal tambah/edit ──
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<TahunAkademik | null>(null);
    const [form, setForm] = useState<FormData>(EMPTY_FORM);
    const [formError, setFormError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // ── State hapus ──
    const [deleteTarget, setDeleteTarget] = useState<TahunAkademik | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // ── Search ──
    const [searchTerm, setSearchTerm] = useState("");

    // ─── Fetch data ────────────────────────────────────────────────────────────────

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.get("/data-master/tahun-akademik");
            if (!res.ok) throw new Error(`Error ${res.status}`);
            const json = await res.json();
            setData(json.data ?? []);
        } catch (err) {
            setError("Gagal memuat data tahun akademik. Periksa koneksi dan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ─── Filter client-side ─────────────────────────────────────────────────────

    const filtered = data.filter((item) =>
        item.nama_tahun_akademik.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // ─── Buka modal tambah ──────────────────────────────────────────────────────

    const openAdd = () => {
        setEditTarget(null);
        setForm(EMPTY_FORM);
        setFormError(null);
        setIsModalOpen(true);
    };

    // ─── Buka modal edit ────────────────────────────────────────────────────────

    const openEdit = (item: TahunAkademik) => {
        setEditTarget(item);
        const { tahun, semester } = parseNama(item.nama_tahun_akademik);
        setForm({
            tahun,
            semester,
            tgl_awal_kuliah: item.tgl_awal_kuliah ?? "",
            tgl_akhir_kuliah: item.tgl_akhir_kuliah ?? "",
            aktif: item.aktif ?? "T",
        });
        setFormError(null);
        setIsModalOpen(true);
    };

    // ─── Submit tambah / edit ───────────────────────────────────────────────────

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setIsSaving(true);

        const payload = {
            NAMA_TAHUN_AKADEMIK: buildNama(form),
            AKTIF: form.aktif,
            TGL_AWAL_KULIAH: form.tgl_awal_kuliah,
            TGL_AKHIR_KULIAH: form.tgl_akhir_kuliah,
        };

        try {
            let res: Response;
            if (editTarget) {
                res = await api.patch(
                    `/data-master/tahun-akademik/${editTarget.id_tahun_akademik}`,
                    payload,
                );
            } else {
                res = await api.post("/data-master/tahun-akademik", payload);
            }

            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                let msg = json?.message;
                if (!msg && json?.errors && typeof json.errors === "object") {
                    const firstGroup = Object.values(json.errors)[0];
                    if (Array.isArray(firstGroup) && firstGroup.length > 0) {
                        msg = String(firstGroup[0]);
                    }
                }
                if (!msg) msg = "Gagal menyimpan data.";
                throw new Error(msg);
            }

            setIsModalOpen(false);
            await fetchData();
        } catch (err) {
            setFormError(
                err instanceof Error ? err.message : "Terjadi kesalahan.",
            );
        } finally {
            setIsSaving(false);
        }
    };

    // ─── Set Aktif ─────────────────────────────────────────────────────────────

    const handleSetAktif = async (item: TahunAkademik) => {
        setError(null);
        try {
            const res = await api.patch(
                `/data-master/tahun-akademik/${item.id_tahun_akademik}`,
                { AKTIF: "Y" },
            );
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json?.message ?? "Gagal mengaktifkan tahun akademik.");
            }
            await fetchData();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Gagal mengaktifkan tahun akademik.",
            );
        }
    };

    // ─── Konfirmasi hapus ──────────────────────────────────────────────────────

    const openDelete = (item: TahunAkademik) => {
        setDeleteTarget(item);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            const res = await api.delete(
                `/data-master/tahun-akademik/${deleteTarget.id_tahun_akademik}`,
            );
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json?.message ?? "Gagal menghapus data.");
            }
            setDeleteTarget(null);
            await fetchData();
        } catch (err) {
            setDeleteTarget(null);
            setError(
                err instanceof Error ? err.message : "Gagal menghapus data.",
            );
        } finally {
            setIsDeleting(false);
        }
    };

    // ─── Status badge ──────────────────────────────────────────────────────────

    const statusBadge = (aktif: string) => {
        const isAktif = aktif === "Y";
        return (
            <span
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                    isAktif
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                }`}
            >
                {isAktif ? "Aktif" : "Selesai"}
            </span>
        );
    };

    // ─── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Manajemen Tahun Akademik
                </h1>
                <p className="text-gray-600 mt-1">
                    Kelola tahun akademik dan semester
                </p>
            </div>

            {/* Error banner */}
            {error && (
                <div className="mb-4 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="flex-1 text-sm">{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="text-sm font-medium hover:underline"
                    >
                        Tutup
                    </button>
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
                        onClick={openAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Tambah Tahun Akademik</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20 gap-3 text-gray-500">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Memuat data...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        {searchTerm
                            ? "Tidak ada hasil yang cocok."
                            : "Belum ada data tahun akademik."}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                        No
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                        Tahun Akademik
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                        Tanggal Mulai
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                        Tanggal Selesai
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filtered.map((item, idx) => (
                                    <tr
                                        key={item.id_tahun_akademik}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {idx + 1}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {item.nama_tahun_akademik}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {item.tgl_awal_kuliah ?? "—"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {item.tgl_akhir_kuliah ?? "—"}
                                        </td>
                                        <td className="px-6 py-4">
                                            {statusBadge(item.aktif)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {item.aktif !== "Y" && (
                                                    <button
                                                        onClick={() =>
                                                            handleSetAktif(item)
                                                        }
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                        title="Set Aktif"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openEdit(item)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openDelete(item)}
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

                {/* Footer info */}
                {!isLoading && filtered.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Menampilkan{" "}
                            <span className="font-medium">{filtered.length}</span>{" "}
                            dari{" "}
                            <span className="font-medium">{data.length}</span>{" "}
                            data
                        </p>
                    </div>
                )}
            </div>

            {/* ── Modal Tambah / Edit ───────────────────────────────────────────── */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => !isSaving && setIsModalOpen(false)}
                title={editTarget ? "Edit Tahun Akademik" : "Tambah Tahun Akademik"}
            >
                <form onSubmit={handleSubmit} className="p-6">
                    {formError && (
                        <div className="mb-4 flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <p className="text-sm">{formError}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tahun Akademik <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.tahun}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, tahun: e.target.value }))
                                }
                                placeholder="Contoh: 2025/2026"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={isSaving}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Semester <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.semester}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, semester: e.target.value }))
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={isSaving}
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
                                value={form.tgl_awal_kuliah}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        tgl_awal_kuliah: e.target.value,
                                    }))
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={isSaving}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tanggal Selesai <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={form.tgl_akhir_kuliah}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        tgl_akhir_kuliah: e.target.value,
                                    }))
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={isSaving}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.aktif}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, aktif: e.target.value }))
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={isSaving}
                            >
                                <option value="Y">Aktif</option>
                                <option value="T">Selesai</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            disabled={isSaving}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center gap-2"
                        >
                            {isSaving && (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            )}
                            {editTarget ? "Simpan Perubahan" : "Tambah Tahun Akademik"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ── Modal Konfirmasi Hapus ────────────────────────────────────────── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={() => !isDeleting && setDeleteTarget(null)}
                    />
                    <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Hapus Tahun Akademik
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Yakin ingin menghapus{" "}
                                    <span className="font-medium text-gray-900">
                                        {deleteTarget.nama_tahun_akademik}
                                    </span>
                                    ? Tindakan ini tidak dapat dibatalkan.
                                </p>
                                {deleteTarget.aktif === "Y" && (
                                    <p className="text-sm text-red-600 mt-2">
                                        Tahun akademik yang sedang aktif tidak dapat dihapus.
                                    </p>
                                )}
                            </div>
                        </div>
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
                                disabled={isDeleting || deleteTarget.aktif === "Y"}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center gap-2"
                            >
                                {isDeleting && (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                )}
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
