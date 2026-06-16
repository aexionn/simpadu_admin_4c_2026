import { useState } from "react";
import { Search, Plus, Edit, Trash2, Filter } from "lucide-react";
import Modal from "../Modal";
import { akademikService } from "../../services/apiServices";
import {
    ErrorState,
    LoadingState,
    activeStatus,
    useApiData,
    valueOf,
} from "./apiPageUtils";

const kelasData = [
    {
        id: 1,
        nama: "Teknik Informatika 1A",
        prodi: "D3 Teknik Informatika",
        tahunAkademik: "2025/2026",
        semester: 1,
        status: "Aktif",
    },
    {
        id: 2,
        nama: "Teknik Informatika 1B",
        prodi: "D3 Teknik Informatika",
        tahunAkademik: "2025/2026",
        semester: 1,
        status: "Aktif",
    },
    {
        id: 3,
        nama: "Teknik Informatika 2A",
        prodi: "D3 Teknik Informatika",
        tahunAkademik: "2024/2025",
        semester: 3,
        status: "Aktif",
    },
    {
        id: 4,
        nama: "Teknik Informatika 3A",
        prodi: "D3 Teknik Informatika",
        tahunAkademik: "2023/2024",
        semester: 5,
        status: "Aktif",
    },
    {
        id: 5,
        nama: "Sistem Informasi 1A",
        prodi: "D3 Sistem Informasi",
        tahunAkademik: "2025/2026",
        semester: 1,
        status: "Aktif",
    },
    {
        id: 6,
        nama: "Sistem Informasi 2B",
        prodi: "D3 Sistem Informasi",
        tahunAkademik: "2024/2025",
        semester: 3,
        status: "Aktif",
    },
];

function mapKelas(item: any) {
    const kode = valueOf(item.ID_KELAS, item.id_kelas, item.id);

    const nama = valueOf(
        item.KELAS_NAMA,
        item.kelas_nama,
        item.nama,
        item.name,
    );

    return {
        id: kode,
        nama,
        prodi: valueOf(
            item.prodi?.nama_prodi,
            item.prodi?.NAMA_PRODI,
            item.NAMA_PRODI,
            item.nama_prodi,
            item.prodi,
            "-",
        ),
        tahunAkademik: valueOf(
            item.tahun_akademik?.nama_tahun_akademik,
            item.tahun_akademik?.NAMA_TAHUN_AKADEMIK,
            item.NAMA_TAHUN_AKADEMIK,
            item.nama_tahun_akademik,
            item.tahunAkademik,
            "-",
        ),
        semester: Number(valueOf(item.SEMESTER, item.semester, 0)),
        status: activeStatus(valueOf(item.AKTIF, item.status, "-")),
    };
}

export default function KelasManagement() {
    const { data, loading, error } = useApiData({
        fallback: kelasData,
        fetcher: akademikService.getKelas,
        mapper: mapKelas,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [filterProdi, setFilterProdi] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);

    const filteredData = data.filter((item) => {
        const matchesSearch = item.nama
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesFilter =
            filterProdi === "all" || item.prodi === filterProdi;
        return matchesSearch && matchesFilter;
    });

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
                <h1 className="text-2xl font-bold text-gray-900">
                    Manajemen Kelas
                </h1>
                <p className="text-gray-600 mt-1">
                    Kelola data kelas di POLIBAN
                </p>
            </div>

            {loading && <LoadingState label="Memuat data kelas..." />}
            {error && <ErrorState message={error} />}

            {/* Action Bar */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari kelas..."
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
                        <span>Tambah Kelas</span>
                    </button>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-3">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <select
                        value={filterProdi}
                        onChange={(e) => setFilterProdi(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">Semua Program Studi</option>
                        <option value="D3 Teknik Informatika">
                            D3 Teknik Informatika
                        </option>
                        <option value="D3 Sistem Informasi">
                            D3 Sistem Informasi
                        </option>
                        <option value="D4 Teknik Informatika">
                            D4 Teknik Informatika
                        </option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                    ID Kelas
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                    Nama Kelas
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                    Program Studi
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                    Tahun Akademik
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                    Semester
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
                            {filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {item.id}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {item.nama}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {item.prodi}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {item.tahunAkademik}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {item.semester}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
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
                        Menampilkan{" "}
                        <span className="font-medium">
                            {filteredData.length}
                        </span>{" "}
                        dari <span className="font-medium">{data.length}</span>{" "}
                        data
                    </p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                            Previous
                        </button>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                            1
                        </button>
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
                title={editData ? "Edit Kelas" : "Tambah Kelas"}
            >
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kode Kelas{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                defaultValue={editData?.kode}
                                placeholder="Contoh: TI-1A"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nama Kelas{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                defaultValue={editData?.nama}
                                placeholder="Contoh: Teknik Informatika 1A"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Program Studi{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <select
                                defaultValue={editData?.prodi}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Pilih Program Studi</option>
                                <option value="D3 Teknik Informatika">
                                    D3 Teknik Informatika
                                </option>
                                <option value="D3 Sistem Informasi">
                                    D3 Sistem Informasi
                                </option>
                                <option value="D4 Teknik Informatika">
                                    D4 Teknik Informatika
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tahun Akademik{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <select
                                defaultValue={editData?.tahunAkademik}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Pilih Tahun Akademik</option>
                                <option value="2025/2026">2025/2026</option>
                                <option value="2024/2025">2024/2025</option>
                                <option value="2023/2024">2023/2024</option>
                            </select>
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
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="6">6</option>
                            </select>
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
                                <option value="Nonaktif">Nonaktif</option>
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
                            {editData ? "Simpan Perubahan" : "Tambah Kelas"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
