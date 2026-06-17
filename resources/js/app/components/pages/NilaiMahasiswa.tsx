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

interface NilaiItem {
  id: number;
  id_dosen: number;
  nim: string;
  id_kelas: number;
  id_mk: number;
  participation_score: string | number;
  assignment_score: string | number;
  quiz_score: string | number;
  uts_score: string | number;
  uas_score: string | number;
  final_score: string | number;
  grade: string;
  kelas?: {
    kelas_nama?: string;
  } | null;
  mata_kuliah?: {
    nama_mk?: string;
  } | null;
}

interface FormData {
  id_dosen: string;
  nim: string;
  id_kelas: string;
  id_mk: string;
  participation_score: string;
  assignment_score: string;
  quiz_score: string;
  uts_score: string;
  uas_score: string;
}

const EMPTY_FORM: FormData = {
  id_dosen: "",
  nim: "",
  id_kelas: "",
  id_mk: "",
  participation_score: "",
  assignment_score: "",
  quiz_score: "",
  uts_score: "",
  uas_score: "",
};

function getApiMessage(json: any, fallback: string) {
  return (
    json?.message ??
    Object.values(json?.errors ?? {})?.[0]?.[0] ??
    fallback
  );
}

function numberValue(value: string | number | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function gradeColor(grade: string) {
  if (grade === "A" || grade === "AB") return "bg-green-100 text-green-800";
  if (grade === "B" || grade === "BC") return "bg-blue-100 text-blue-800";
  if (grade === "C") return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}

export default function NilaiMahasiswa() {
  const [data, setData] = useState<NilaiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<NilaiItem | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NilaiItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.get("/akademik/nilai");
      const json = await readJson<any>(res);

      if (!res.ok || json?.success === false) {
        throw new Error(getApiMessage(json, "Gagal memuat data nilai."));
      }

      setData(json?.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data nilai.");
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
      item.nim.toLowerCase().includes(keyword) ||
      String(item.id).includes(keyword) ||
      String(item.id_dosen).includes(keyword) ||
      (item.kelas?.kelas_nama ?? "").toLowerCase().includes(keyword) ||
      (item.mata_kuliah?.nama_mk ?? "").toLowerCase().includes(keyword)
    );
  });

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: NilaiItem) => {
    setEditTarget(item);
    setForm({
      id_dosen: String(item.id_dosen ?? ""),
      nim: item.nim ?? "",
      id_kelas: String(item.id_kelas ?? ""),
      id_mk: String(item.id_mk ?? ""),
      participation_score: String(item.participation_score ?? ""),
      assignment_score: String(item.assignment_score ?? ""),
      quiz_score: String(item.quiz_score ?? ""),
      uts_score: String(item.uts_score ?? ""),
      uas_score: String(item.uas_score ?? ""),
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const payloadFromForm = () => ({
    id_dosen: Number(form.id_dosen),
    nim: form.nim.trim(),
    id_kelas: Number(form.id_kelas),
    id_mk: Number(form.id_mk),
    participation_score: Number(form.participation_score),
    assignment_score: Number(form.assignment_score),
    quiz_score: Number(form.quiz_score),
    uts_score: Number(form.uts_score),
    uas_score: Number(form.uas_score),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);

    try {
      const res = editTarget
        ? await api.patch(`/akademik/nilai/${editTarget.id}`, payloadFromForm())
        : await api.post("/akademik/nilai", payloadFromForm());
      const json = await readJson<any>(res);

      if (!res.ok || json?.success === false) {
        throw new Error(getApiMessage(json, "Gagal menyimpan nilai."));
      }

      setIsModalOpen(false);
      await fetchData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const res = await api.delete(`/akademik/nilai/${deleteTarget.id}`);
      const json = await readJson<any>(res);

      if (!res.ok || json?.success === false) {
        throw new Error(getApiMessage(json, "Gagal menghapus nilai."));
      }

      setDeleteTarget(null);
      await fetchData();
    } catch (err) {
      setDeleteTarget(null);
      setError(err instanceof Error ? err.message : "Gagal menghapus nilai.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nilai Mahasiswa</h1>
        <p className="text-gray-600 mt-1">
          Kelola komponen nilai dan nilai akhir mahasiswa
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
              placeholder="Cari NIM, kelas, mata kuliah, atau dosen..."
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
            <span>Tambah Nilai</span>
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
            Tidak ada data nilai yang cocok.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-20 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">ID</th>
                  <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">NIM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Kelas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Mata Kuliah</th>
                  <th className="w-24 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Part.</th>
                  <th className="w-24 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tugas</th>
                  <th className="w-24 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Quiz</th>
                  <th className="w-24 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">UTS</th>
                  <th className="w-24 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">UAS</th>
                  <th className="w-28 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Akhir</th>
                  <th className="w-24 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Grade</th>
                  <th className="w-28 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.nim}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.kelas?.kelas_nama ?? `ID Kelas ${item.id_kelas}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.mata_kuliah?.nama_mk ?? `ID MK ${item.id_mk}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{numberValue(item.participation_score)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{numberValue(item.assignment_score)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{numberValue(item.quiz_score)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{numberValue(item.uts_score)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{numberValue(item.uas_score)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {numberValue(item.final_score).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${gradeColor(item.grade)}`}>
                        {item.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
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
              <span className="font-medium">{data.length}</span> nilai
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSaving && setIsModalOpen(false)}
        title={editTarget ? "Edit Nilai" : "Tambah Nilai"}
      >
        <form onSubmit={handleSubmit} className="p-6">
          {formError && (
            <div className="mb-4 flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-sm">{formError}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {[
              ["id_dosen", "ID Dosen"],
              ["nim", "NIM"],
              ["id_kelas", "ID Kelas"],
              ["id_mk", "ID Mata Kuliah"],
              ["participation_score", "Partisipasi"],
              ["assignment_score", "Tugas"],
              ["quiz_score", "Quiz"],
              ["uts_score", "UTS"],
              ["uas_score", "UAS"],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {label} <span className="text-red-500">*</span>
                </label>
                <input
                  type={key === "nim" ? "text" : "number"}
                  value={form[key as keyof FormData]}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      [key]: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isSaving}
                />
              </div>
            ))}
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
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editTarget ? "Simpan Perubahan" : "Tambah Nilai"}
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
            <h3 className="text-lg font-semibold text-gray-900">Hapus Nilai</h3>
            <p className="text-sm text-gray-600 mt-2">
              Yakin ingin menghapus nilai NIM{" "}
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
