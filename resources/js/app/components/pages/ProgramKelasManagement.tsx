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

interface ProgramKelas {
    id_program: number;
    nama_program: string;
    aktif: "Y" | "T";
}

interface FormData {
    nama_program: string;
    aktif: "Y" | "T";
}

const EMPTY_FORM: FormData = {
    nama_program: "",
    aktif: "Y",
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

function statusLabel(value: ProgramKelas["aktif"]) {
    return value === "Y" ? "Aktif" : "Nonaktif";
}

export default function ProgramKelasManagement() {
    const [data, setData] = useState<ProgramKelas[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<ProgramKelas | null>(null);
    const [form, setForm] = useState<FormData>(EMPTY_FORM);
    const [formError, setFormError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState<ProgramKelas | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await api.get("/data-master/program-kelas");
            const json = await readJson<any>(res);

            if (!res.ok || json?.success === false) {
                throw new Error(
                    getApiMessage(json, "Gagal memuat data program kelas."),
                );
            }

            setData(json?.data ?? []);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Gagal memuat data program kelas.",
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
            String(item.id_program).includes(keyword) ||
            item.nama_program.toLowerCase().includes(keyword) ||
            statusLabel(item.aktif).toLowerCase().includes(keyword)
        );
    });

    const openAdd = () => {
        setEditTarget(null);
        setForm(EMPTY_FORM);
        setFormError(null);
        setIsModalOpen(true);
    };

    const openEdit = (item: ProgramKelas) => {
        setEditTarget(item);
        setForm({
            nama_program: item.nama_program,
            aktif: item.aktif,
        });
        setFormError(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setIsSaving(true);

        const payload = {
            NAMA_PROGRAM: form.nama_program.trim(),
            AKTIF: form.aktif,
        };

        try {
            let res: Response;
            if (editTarget) {
                res = await api.patch(
                    `/data-master/program-kelas/${editTarget.id_program}`,
                    payload,
                );
            } else {
                res = await api.post("/data-master/program-kelas", payload);
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
                `/data-master/program-kelas/${deleteTarget.id_program}`,
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
                    Manajemen Program Kelas
                </h1>
                <p className="text-gray-600 mt-1">
                    Kelola program kelas perkuliahan
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
                            placeholder="Cari program kelas..."
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
                        <span>Tambah Program Kelas</span>
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
                            : "Belum ada data program kelas."}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full table-fixed">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="w-36 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                        ID Program
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                        Nama Program
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
                                        key={item.id_program}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {item.id_program}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {item.nama_program}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 text-xs font-medium rounded-full ${
                                                    item.aktif === "Y"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {statusLabel(item.aktif)}
                                            </span>
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
                                                        setDeleteTarget(item)
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

                {!isLoading && filteredData.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Menampilkan{" "}
                            <span className="font-medium">
                                {filteredData.length}
                            </span>{" "}
                            dari{" "}
                            <span className="font-medium">{data.length}</span>{" "}
                            program kelas
                        </p>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => !isSaving && setIsModalOpen(false)}
                title={
                    editTarget ? "Edit Program Kelas" : "Tambah Program Kelas"
                }
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
                                Nama Program{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.nama_program}
                                onChange={(e) =>
                                    setForm((current) => ({
                                        ...current,
                                        nama_program: e.target.value,
                                    }))
                                }
                                placeholder="Contoh: Reguler"
                                maxLength={20}
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
                                    setForm((current) => ({
                                        ...current,
                                        aktif: e.target
                                            .value as FormData["aktif"],
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
                                : "Tambah Program Kelas"}
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
                                    Hapus Program Kelas
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Yakin ingin menghapus{" "}
                                    <span className="font-medium text-gray-900">
                                        {deleteTarget.nama_program}
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
