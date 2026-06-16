import { useState } from "react";
import { Search, Plus, Edit, Trash2, Filter } from "lucide-react";
import Modal from "../Modal";
import { dataMasterService } from "../../services/apiServices";
import {
    ErrorState,
    LoadingState,
    activeStatus,
    useApiData,
    valueOf,
} from "./apiPageUtils";

const prodiData = [
    {
        id: 1,
        idProdi: "1",
        nama: "D3 Teknik Informatika",
        jurusan: "Jurusan Teknik Informatika",
        status: "Aktif",
    },
    {
        id: 2,
        idProdi: "2",
        nama: "D4 Teknik Informatika",
        jurusan: "Jurusan Teknik Informatika",
        status: "Aktif",
    },
    {
        id: 3,
        idProdi: "3",
        nama: "D3 Sistem Informasi",
        jurusan: "Jurusan Teknik Informatika",
        status: "Aktif",
    },
    {
        id: 4,
        idProdi: "4",
        nama: "D3 Teknik Elektro",
        jurusan: "Jurusan Teknik Elektro",
        status: "Aktif",
    },
    {
        id: 5,
        idProdi: "5",
        nama: "D3 Teknik Sipil",
        jurusan: "Jurusan Teknik Sipil",
        status: "Aktif",
    },
    {
        id: 6,
        idProdi: "6",
        nama: "D3 Akuntansi",
        jurusan: "Jurusan Akuntansi",
        status: "Aktif",
    },
];

function mapProgramStudi(item: any) {
    const nama = valueOf(
        item.NAMA_PRODI,
        item.nama_prodi,
        item.nama,
        item.name,
    );
    const jurusan = valueOf(
        item.jurusan?.NAMA_JURUSAN,
        item.jurusan?.nama_jurusan,
        item.NAMA_JURUSAN,
        item.nama_jurusan,
        item.jurusan?.name,
        "-",
    );

    return {
        id: valueOf(item.ID_PRODI, item.id_prodi, item.id, nama),
        idProdi: String(valueOf(item.ID_PRODI, item.id_prodi, item.id, "-")),
        nama,
        jurusan,
        status: activeStatus(valueOf(item.AKTIF, item.aktif, item.status, "Y")),
    };
}

export default function ProgramStudiManagement() {
    const { data, loading, error } = useApiData({
        fallback: prodiData,
        fetcher: dataMasterService.getProgramStudi,
        mapper: mapProgramStudi,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [filterJurusan, setFilterJurusan] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);

    const filteredData = data.filter((item) => {
        const matchesSearch =
            item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.idProdi.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter =
            filterJurusan === "all" || item.jurusan === filterJurusan;
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
                    Manajemen Program Studi
                </h1>
                <p className="text-gray-600 mt-1">
                    Kelola data program studi di POLIBAN
                </p>
            </div>

            {loading && <LoadingState label="Memuat data program studi..." />}
            {error && <ErrorState message={error} />}

            {/* Action Bar */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari program studi..."
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
                        <span>Tambah Program Studi</span>
                    </button>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-3">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <select
                        value={filterJurusan}
                        onChange={(e) => setFilterJurusan(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">Semua Jurusan</option>
                        <option value="Jurusan Teknik Informatika">
                            Jurusan Teknik Informatika
                        </option>
                        <option value="Jurusan Teknik Elektro">
                            Jurusan Teknik Elektro
                        </option>
                        <option value="Jurusan Teknik Sipil">
                            Jurusan Teknik Sipil
                        </option>
                        <option value="Jurusan Akuntansi">
                            Jurusan Akuntansi
                        </option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full table-fixed">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                    ID Prodi
                                </th>
                                <th className="w-2/5 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                    Program Studi
                                </th>
                                <th className="w-2/5 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                    Jurusan
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
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {item.idProdi}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {item.nama}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {item.jurusan}
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
                title={editData ? "Edit Program Studi" : "Tambah Program Studi"}
            >
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ID Prodi <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                defaultValue={editData?.idProdi}
                                placeholder="Contoh: 1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nama Program Studi{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                defaultValue={editData?.nama}
                                placeholder="Contoh: D3 Teknik Informatika"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Jurusan <span className="text-red-500">*</span>
                            </label>
                            <select
                                defaultValue={editData?.jurusan}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Pilih Jurusan</option>
                                <option value="Jurusan Teknik Informatika">
                                    Jurusan Teknik Informatika
                                </option>
                                <option value="Jurusan Teknik Elektro">
                                    Jurusan Teknik Elektro
                                </option>
                                <option value="Jurusan Teknik Sipil">
                                    Jurusan Teknik Sipil
                                </option>
                                <option value="Jurusan Akuntansi">
                                    Jurusan Akuntansi
                                </option>
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
                            {editData
                                ? "Simpan Perubahan"
                                : "Tambah Program Studi"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
