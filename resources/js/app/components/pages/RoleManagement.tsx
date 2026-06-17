import { useState } from "react";
import { Search, Plus, Edit, Trash2, Shield } from "lucide-react";
import Modal from "../Modal";
import { adminService } from "../../services/apiServices";
import { ErrorState, LoadingState, useApiData } from "./apiPageUtils";

const roleData = [
    { id: 1, nama: "super_admin", jumlahUser: 0 },
    { id: 2, nama: "dosen", jumlahUser: 0 },
    { id: 3, nama: "mahasiswa", jumlahUser: 0 },
    { id: 4, nama: "kaprodi", jumlahUser: 0 },
    { id: 5, nama: "staff_akademik", jumlahUser: 0 },
    { id: 6, nama: "ketua_jurusan", jumlahUser: 0 },
];

function mapRole(item: any) {
    return {
        id: Number(item.id_role ?? item.id ?? 0),
        nama: String(item.role_name ?? item.nama ?? "-"),
        jumlahUser: Number(item.users_count ?? item.jumlahUser ?? 0),
    };
}

export default function RoleManagement() {
    const { data, loading, error } = useApiData({
        fallback: roleData,
        fetcher: adminService.getRoles,
        mapper: mapRole,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);

    const filteredData = data.filter((item) =>
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()),
    );

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
                    Role Management
                </h1>
                <p className="text-gray-600 mt-1">
                    Kelola role dan hak akses pengguna
                </p>
            </div>

            {loading && <LoadingState label="Memuat data role..." />}
            {error && <ErrorState message={error} />}

            {/* Action Bar */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari role..."
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
                        <span>Tambah Role</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                    No
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                    Nama Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                    Jumlah User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredData.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-blue-600" />
                                            <span className="text-sm font-medium text-gray-900">
                                                {item.nama}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {item.jumlahUser}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            {item.nama !== "Administrator" && (
                                                <button
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
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
                title={editData ? "Edit Role" : "Tambah Role"}
            >
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nama Role{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                defaultValue={editData?.nama}
                                placeholder="Contoh: dosen"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>Catatan:</strong> Jumlah user akan
                                dihitung otomatis oleh sistem.
                            </p>
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
                            {editData ? "Simpan Perubahan" : "Tambah Role"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
