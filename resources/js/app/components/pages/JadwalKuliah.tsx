import { useCallback, useEffect, useMemo, useState } from "react";
import {
    AlertCircle,
    Calendar,
    Edit,
    Loader2,
    RefreshCw,
    Search,
    Trash2,
} from "lucide-react";
import Modal from "../Modal";
import { api, readJson } from "../../lib/apiClient";

interface Hari {
    id_hari?: number;
    nama_hari?: string;
}

interface Ruang {
    id_ruang?: number;
    nama_ruang?: string;
}

interface JadwalKelasMk {
    id_kelas_mk: number;
    id_hari: number | null;
    waktu_mulai: string | null;
    waktu_akhir: string | null;
    id_ruang: number | null;
    hari?: Hari | null;
    ruang?: Ruang | null;
}

interface FormData {
    id_hari: string;
    waktu_mulai: string;
    waktu_akhir: string;
    id_ruang: string;
}

const EMPTY_FORM: FormData = {
    id_hari: "",
    waktu_mulai: "",
    waktu_akhir: "",
    id_ruang: "",
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

function normalizeTime(value: string | null | undefined) {
    if (!value) return "";
    return value.slice(0, 5);
}

function apiTime(value: string) {
    if (!value) return null;
    return value.length === 5 ? `${value}:00` : value;
}

function namaHari(item: JadwalKelasMk) {
    return item.hari?.nama_hari ?? "-";
}

function namaRuang(item: JadwalKelasMk) {
    return item.ruang?.nama_ruang ?? "-";
}

export default function JadwalKuliah() {
    const [data, setData] = useState<JadwalKelasMk[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [filterHari, setFilterHari] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<JadwalKelasMk | null>(null);
    const [form, setForm] = useState<FormData>(EMPTY_FORM);
    const [formError, setFormError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState<JadwalKelasMk | null>(
        null,
    );
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await api.get("/akademik/kelas-mk");
            const json = await readJson<any>(res);

            if (!res.ok || json?.success === false) {
                throw new Error(
                    getApiMessage(json, "Gagal memuat data jadwal kuliah."),
                );
            }

            setData(json?.data ?? []);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Gagal memuat data jadwal kuliah.",
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const hariOptions = useMemo(() => {
        return Array.from(
            new Set(data.map(namaHari).filter((value) => value !== "-")),
        );
    }, [data]);

    const filteredData = data.filter((item) => {
        const keyword = searchTerm.toLowerCase();
        const matchesSearch =
            namaHari(item).toLowerCase().includes(keyword) ||
            normalizeTime(item.waktu_mulai).includes(keyword) ||
            normalizeTime(item.waktu_akhir).includes(keyword) ||
            namaRuang(item).toLowerCase().includes(keyword);
        const matchesFilter =
            filterHari === "all" || namaHari(item) === filterHari;

        return matchesSearch && matchesFilter;
    });

    const openEdit = (item: JadwalKelasMk) => {
        setEditTarget(item);
        setForm({
            id_hari: item.id_hari ? String(item.id_hari) : "",
            waktu_mulai: normalizeTime(item.waktu_mulai),
            waktu_akhir: normalizeTime(item.waktu_akhir),
            id_ruang: item.id_ruang ? String(item.id_ruang) : "",
        });
        setFormError(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTarget) return;

        setFormError(null);
        setIsSaving(true);

        const payload = {
            ID_HARI: form.id_hari ? Number(form.id_hari) : null,
            WAKTU_MULAI: apiTime(form.waktu_mulai),
            WAKTU_AKHIR: apiTime(form.waktu_akhir),
            ID_RUANG: form.id_ruang ? Number(form.id_ruang) : null,
        };

        try {
            const res = await api.patch(
                `/akademik/kelas-mk/${editTarget.id_kelas_mk}`,
                payload,
            );
            const json = await readJson<any>(res);

            if (!res.ok || json?.success === false) {
                throw new Error(getApiMessage(json, "Gagal menyimpan jadwal."));
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
                `/akademik/kelas-mk/${deleteTarget.id_kelas_mk}`,
            );
            const json = await readJson<any>(res);

            if (!res.ok || json?.success === false) {
                throw new Error(getApiMessage(json, "Gagal menghapus jadwal."));
            }

            setDeleteTarget(null);
            await fetchData();
        } catch (err) {
            setDeleteTarget(null);
            setError(
                err instanceof Error ? err.message : "Gagal menghapus jadwal.",
            );
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Jadwal Kuliah
                </h1>
                <p className="text-gray-600 mt-1">
                    Kelola jadwal perkuliahan dari data kelas mata kuliah
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
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari hari, waktu, atau ruang..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <select
                        value={filterHari}
                        onChange={(e) => setFilterHari(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">Semua Hari</option>
                        {hariOptions.map((hari) => (
                            <option key={hari} value={hari}>
                                {hari}
                            </option>
                        ))}
                    </select>
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
                        {searchTerm || filterHari !== "all"
                            ? "Tidak ada hasil yang cocok."
                            : "Belum ada data jadwal kuliah."}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full table-fixed">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                        ID Kelas MK
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                        Hari
                                    </th>
                                    <th className="w-40 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                        Waktu Mulai
                                    </th>
                                    <th className="w-40 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                        Waktu Akhir
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                        Ruang
                                    </th>
                                    <th className="w-28 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredData.map((item) => (
                                    <tr
                                        key={item.id_kelas_mk}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {item.id_kelas_mk}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                {namaHari(item)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {normalizeTime(item.waktu_mulai) ||
                                                "-"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {normalizeTime(item.waktu_akhir) ||
                                                "-"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {namaRuang(item)}
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
                            jadwal
                        </p>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => !isSaving && setIsModalOpen(false)}
                title="Edit Jadwal Kuliah"
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
                                ID Hari
                            </label>
                            <input
                                type="number"
                                value={form.id_hari}
                                onChange={(e) =>
                                    setForm((current) => ({
                                        ...current,
                                        id_hari: e.target.value,
                                    }))
                                }
                                placeholder="Contoh: 1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isSaving}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Waktu Mulai
                                </label>
                                <input
                                    type="time"
                                    value={form.waktu_mulai}
                                    onChange={(e) =>
                                        setForm((current) => ({
                                            ...current,
                                            waktu_mulai: e.target.value,
                                        }))
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={isSaving}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Waktu Akhir
                                </label>
                                <input
                                    type="time"
                                    value={form.waktu_akhir}
                                    onChange={(e) =>
                                        setForm((current) => ({
                                            ...current,
                                            waktu_akhir: e.target.value,
                                        }))
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={isSaving}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ID Ruang <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={form.id_ruang}
                                onChange={(e) =>
                                    setForm((current) => ({
                                        ...current,
                                        id_ruang: e.target.value,
                                    }))
                                }
                                placeholder="Contoh: 1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
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
                            Simpan Perubahan
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
                                    Hapus Jadwal
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Yakin ingin menghapus jadwal{" "}
                                    <span className="font-medium text-gray-900">
                                        {namaHari(deleteTarget)}{" "}
                                        {normalizeTime(
                                            deleteTarget.waktu_mulai,
                                        )}
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
