import { useCallback, useEffect, useState } from "react";
import {
    AlertCircle,
    Edit,
    Loader2,
    Plus,
    RefreshCw,
    Search,
    Trash2,
} from "lucide-react";
import Modal from "../Modal";
import { api, readJson } from "../../lib/apiClient";

type StatusAktif = "Y" | "T";

interface TahunAkademik {
    id_tahun_akademik?: number;
    nama_tahun_akademik?: string;
}

interface Kurikulum {
    id_kurikulum: number;
    id_tahun_akademik: number;
    nama_kurikulum: string;
    catatan_kurikulum: string | null;
    aktif_kurikulum: StatusAktif;
    is_locked: boolean;
    superseded_at: string | null;
    tahun_akademik?: TahunAkademik | null;
}

interface FormData {
    id_tahun_akademik: string;
    nama_kurikulum: string;
    catatan_kurikulum: string;
    aktif_kurikulum: StatusAktif;
}

const EMPTY_FORM: FormData = {
    id_tahun_akademik: "",
    nama_kurikulum: "",
    catatan_kurikulum: "",
    aktif_kurikulum: "Y",
};

function getApiMessage(json: any, fallback: string) {
    if (json?.message) return json.message;
    const errors = json?.errors;
    if (errors && typeof errors === "object") {
        const firstGroup = Object.values(errors)[0];
        if (Array.isArray(firstGroup) && firstGroup.length > 0) {
            return String(firstGroup[0]);
        }
    }
    return fallback;
}

function statusLabel(status: StatusAktif) {
    return status === "Y" ? "Aktif" : "Nonaktif";
}

function tahunLabel(item: Kurikulum) {
    return (
        item.tahun_akademik?.nama_tahun_akademik ??
        String(item.id_tahun_akademik ?? "-")
    );
}

export default function KurikulumManagement() {
    const [data, setData] = useState<Kurikulum[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Kurikulum | null>(null);
    const [form, setForm] = useState<FormData>(EMPTY_FORM);
    const [formError, setFormError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState<Kurikulum | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await api.get("/data-master/kurikulum");
            const json = await readJson<any>(res);

            if (!res.ok || json?.success === false) {
                throw new Error(
                    getApiMessage(json, "Gagal memuat data kurikulum."),
                );
            }

            setData(json?.data ?? []);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Gagal memuat data kurikulum.",
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredData = data.filter((item) => {
        const keyword = searchTerm.toLowerCase();
        return (
            item.nama_kurikulum.toLowerCase().includes(keyword) ||
            tahunLabel(item).toLowerCase().includes(keyword) ||
            statusLabel(item.aktif_kurikulum).toLowerCase().includes(keyword)
        );
    });

    const openAdd = () => {
        setEditTarget(null);
        setForm(EMPTY_FORM);
        setFormError(null);
        setIsModalOpen(true);
    };

    const openEdit = (item: Kurikulum) => {
        setEditTarget(item);
        setForm({
            id_tahun_akademik: String(item.id_tahun_akademik ?? ""),
            nama_kurikulum: item.nama_kurikulum,
            catatan_kurikulum: item.catatan_kurikulum ?? "",
            aktif_kurikulum: item.aktif_kurikulum,
        });
        setFormError(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setIsSaving(true);

        const payload = {
            ID_TAHUN_AKADEMIK: Number(form.id_tahun_akademik),
            NAMA_KURIKULUM: form.nama_kurikulum.trim(),
            CATATAN_KURIKULUM: form.catatan_kurikulum.trim() || null,
            AKTIF_KURIKULUM: form.aktif_kurikulum,
        };

        try {
            let res: Response;
            if (editTarget) {
                res = await api.patch(
                    `/data-master/kurikulum/${editTarget.id_kurikulum}`,
                    payload,
                );
            } else {
                res = await api.post("/data-master/kurikulum", payload);
            }

            const json = await readJson<any>(res);
            if (!res.ok || json?.success === false) {
                throw new Error(getApiMessage(json, "Gagal menyimpan data."));
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

    const handleDelete = async () => {
        if (!deleteTarget) return;

        setIsDeleting(true);
        try {
            const res = await api.delete(
                `/data-master/kurikulum/${deleteTarget.id_kurikulum}`,
            );
            const json = await readJson<any>(res);

            if (!res.ok || json?.success === false) {
                throw new Error(getApiMessage(json, "Gagal menghapus data."));
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

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Manajemen Kurikulum
                </h1>
                <p className="text-gray-600 mt-1">
                    Kelola kurikulum program studi
                </p>
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
                <div className="flex items-center justify-between gap-4">
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
                        onClick={openAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Tambah Kurikulum</span>
                    </button>
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
                        {searchTerm
                            ? "Tidak ada hasil yang cocok."
                            : "Belum ada data kurikulum."}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full table-fixed">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                        Nama Kurikulum
                                    </th>
                                    <th className="w-48 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                        Tahun Akademik
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                        Catatan
                                    </th>
                                    <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                        Status
                                    </th>
                                    <th className="w-28 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredData.map((item) => (
                                    <tr
                                        key={item.id_kurikulum}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {item.id_kurikulum}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {item.nama_kurikulum}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {tahunLabel(item)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <p className="line-clamp-2">
                                                {item.catatan_kurikulum || (
                                                    <span className="italic text-gray-400">
                                                        -
                                                    </span>
                                                )}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 text-xs font-medium rounded-full ${
                                                    item.aktif_kurikulum === "Y"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {statusLabel(
                                                    item.aktif_kurikulum,
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        openEdit(item)
                                                    }
                                                    disabled={item.is_locked}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-40"
                                                    title={
                                                        item.is_locked
                                                            ? "Terkunci"
                                                            : "Edit"
                                                    }
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setDeleteTarget(item)
                                                    }
                                                    disabled={item.is_locked}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-40"
                                                    title={
                                                        item.is_locked
                                                            ? "Terkunci"
                                                            : "Hapus"
                                                    }
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
                            Menampilkan{" "}
                            <span className="font-medium">
                                {filteredData.length}
                            </span>{" "}
                            dari{" "}
                            <span className="font-medium">{data.length}</span>{" "}
                            kurikulum
                        </p>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => !isSaving && setIsModalOpen(false)}
                title={editTarget ? "Edit Kurikulum" : "Tambah Kurikulum"}
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
                                ID Tahun Akademik{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={form.id_tahun_akademik}
                                onChange={(e) =>
                                    setForm((current) => ({
                                        ...current,
                                        id_tahun_akademik: e.target.value,
                                    }))
                                }
                                placeholder="Contoh: 1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={isSaving}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nama Kurikulum{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.nama_kurikulum}
                                onChange={(e) =>
                                    setForm((current) => ({
                                        ...current,
                                        nama_kurikulum: e.target.value,
                                    }))
                                }
                                maxLength={40}
                                placeholder="Contoh: Kurikulum 2026"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={isSaving}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Catatan
                            </label>
                            <textarea
                                value={form.catatan_kurikulum}
                                onChange={(e) =>
                                    setForm((current) => ({
                                        ...current,
                                        catatan_kurikulum: e.target.value,
                                    }))
                                }
                                rows={3}
                                placeholder="Catatan kurikulum (opsional)"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                disabled={isSaving}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.aktif_kurikulum}
                                onChange={(e) =>
                                    setForm((current) => ({
                                        ...current,
                                        aktif_kurikulum: e.target
                                            .value as StatusAktif,
                                    }))
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={isSaving}
                            >
                                <option value="Y">Aktif</option>
                                <option value="T">Nonaktif</option>
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
                            {editTarget
                                ? "Simpan Perubahan"
                                : "Tambah Kurikulum"}
                        </button>
                    </div>
                </form>
            </Modal>

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
                                    Hapus Kurikulum
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Yakin ingin menghapus{" "}
                                    <span className="font-medium text-gray-900">
                                        {deleteTarget.nama_kurikulum}
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
