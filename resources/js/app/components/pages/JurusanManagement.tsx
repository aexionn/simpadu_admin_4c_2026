import { useState, useEffect, useCallback } from "react";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Loader2,
    AlertCircle,
    RefreshCw,
} from "lucide-react";
import Modal from "../Modal";
import { api } from "../../lib/apiClient";

// ─── Types (sesuai JurusanResource dari API) ──────────────────────────────────

interface Jurusan {
    id_jurusan: number;
    nama_jurusan: string;
    visi: string | null;
    misi: string | null;
    created_at: string;
    updated_at: string;
}

interface FormData {
    nama_jurusan: string;
    visi: string;
    misi: string;
}

const EMPTY_FORM: FormData = { nama_jurusan: "", visi: "", misi: "" };

// ─── Komponen utama ───────────────────────────────────────────────────────────

export default function JurusanManagement() {
    // ── State data ──
    const [data, setData] = useState<Jurusan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ── State modal ──
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Jurusan | null>(null);
    const [form, setForm] = useState<FormData>(EMPTY_FORM);
    const [formError, setFormError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // ── State hapus ──
    const [deleteTarget, setDeleteTarget] = useState<Jurusan | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // ── Search ──
    const [searchTerm, setSearchTerm] = useState("");

    // ─── Fetch data ──────────────────────────────────────────────────────────────

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.get("/data-master/jurusan");
            if (!res.ok) throw new Error(`Error ${res.status}`);
            const json = await res.json();
            setData(json.data ?? []);
        } catch (err) {
            setError(
                "Gagal memuat data jurusan. Periksa koneksi dan coba lagi.",
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ─── Filter client-side ───────────────────────────────────────────────────────

    const filtered = data.filter((item) =>
        item.nama_jurusan.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // ─── Buka modal tambah ────────────────────────────────────────────────────────

    const openAdd = () => {
        setEditTarget(null);
        setForm(EMPTY_FORM);
        setFormError(null);
        setIsModalOpen(true);
    };

    // ─── Buka modal edit ──────────────────────────────────────────────────────────

    const openEdit = (item: Jurusan) => {
        setEditTarget(item);
        setForm({
            nama_jurusan: item.nama_jurusan,
            visi: item.visi ?? "",
            misi: item.misi ?? "",
        });
        setFormError(null);
        setIsModalOpen(true);
    };

    // ─── Submit tambah / edit ─────────────────────────────────────────────────────

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setIsSaving(true);

        const payload = {
            nama_jurusan: form.nama_jurusan.trim(),
            visi: form.visi.trim() || null,
            misi: form.misi.trim() || null,
        };

        try {
            let res: Response;
            if (editTarget) {
                res = await api.patch(
                    `/data-master/jurusan/${editTarget.id_jurusan}`,
                    payload,
                );
            } else {
                res = await api.post("/data-master/jurusan", payload);
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
            await fetchData(); // Refresh tabel
        } catch (err) {
            setFormError(
                err instanceof Error ? err.message : "Terjadi kesalahan.",
            );
        } finally {
            setIsSaving(false);
        }
    };

    // ─── Konfirmasi hapus ─────────────────────────────────────────────────────────

    const openDelete = (item: Jurusan) => {
        setDeleteTarget(item);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            const res = await api.delete(
                `/data-master/jurusan/${deleteTarget.id_jurusan}`,
            );
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json?.message ?? "Gagal menghapus data.");
            }
            setDeleteTarget(null);
            await fetchData();
        } catch (err) {
            // Tampilkan error di modal konfirmasi
            setDeleteTarget(null);
            setError(err instanceof Error ? err.message : "Gagal menghapus.");
        } finally {
            setIsDeleting(false);
        }
    };

    // ─── Format tanggal ───────────────────────────────────────────────────────────

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

    // ─── Render ───────────────────────────────────────────────────────────────────

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Manajemen Jurusan
                </h1>
                <p className="text-gray-600 mt-1">
                    Kelola data jurusan di POLIBAN
                </p>
            </div>

            {/* Error banner */}
            {error && (
                <div className="mb-4 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="flex-1 text-sm">{error}</p>
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-1 text-sm font-medium hover:underline"
                    >
                        <RefreshCw className="w-4 h-4" /> Coba lagi
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
                            placeholder="Cari nama jurusan..."
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
                        <span>Tambah Jurusan</span>
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
                            : "Belum ada data jurusan."}
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
                                        Nama Jurusan
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                        Visi
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                        Misi
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                        Diperbarui
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filtered.map((item, idx) => (
                                    <tr
                                        key={item.id_jurusan}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {idx + 1}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {item.nama_jurusan}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                                            <p className="line-clamp-2">
                                                {item.visi ?? (
                                                    <span className="italic text-gray-400">
                                                        —
                                                    </span>
                                                )}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                                            <p className="line-clamp-2">
                                                {item.misi ?? (
                                                    <span className="italic text-gray-400">
                                                        —
                                                    </span>
                                                )}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDate(item.updated_at)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        openEdit(item)
                                                    }
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        openDelete(item)
                                                    }
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
                            <span className="font-medium">
                                {filtered.length}
                            </span>{" "}
                            dari{" "}
                            <span className="font-medium">{data.length}</span>{" "}
                            jurusan
                        </p>
                    </div>
                )}
            </div>

            {/* ── Modal Tambah / Edit ─────────────────────────────────────────────── */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => !isSaving && setIsModalOpen(false)}
                title={editTarget ? "Edit Jurusan" : "Tambah Jurusan"}
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
                                Nama Jurusan{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.nama_jurusan}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        nama_jurusan: e.target.value,
                                    }))
                                }
                                placeholder="Contoh: Jurusan Teknik Informatika"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={isSaving}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Visi
                            </label>
                            <textarea
                                value={form.visi}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        visi: e.target.value,
                                    }))
                                }
                                placeholder="Visi jurusan (opsional)"
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                disabled={isSaving}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Misi
                            </label>
                            <textarea
                                value={form.misi}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        misi: e.target.value,
                                    }))
                                }
                                placeholder="Misi jurusan (opsional)"
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                disabled={isSaving}
                            />
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
                            {editTarget ? "Simpan Perubahan" : "Tambah Jurusan"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ── Modal Konfirmasi Hapus ──────────────────────────────────────────── */}
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
                                    Hapus Jurusan
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Yakin ingin menghapus{" "}
                                    <span className="font-medium text-gray-900">
                                        {deleteTarget.nama_jurusan}
                                    </span>
                                    ? Tindakan ini tidak dapat dibatalkan.
                                </p>
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
                                disabled={isDeleting}
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
