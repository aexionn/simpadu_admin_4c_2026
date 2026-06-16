import { useState } from "react";
import { Search, Plus, Edit, Trash2, Filter, Lock } from "lucide-react";
import Modal from "../Modal";
import { adminService } from "../../services/apiServices";
import { ErrorState, LoadingState, useApiData, valueOf } from "./apiPageUtils";

const userData = [
  { id: 1, username: "admin", nama: "Administrator", email: "admin@poliban.ac.id", role: "Administrator", status: "Aktif", lastLogin: "2026-05-12 09:30" },
  { id: 2, username: "ahmad.yani", nama: "Dr. Ahmad Yani, M.Kom.", email: "ahmad.yani@poliban.ac.id", role: "Dosen", status: "Aktif", lastLogin: "2026-05-12 08:15" },
  { id: 3, username: "siti.nurhaliza", nama: "Prof. Siti Nurhaliza, M.Kom.", email: "siti.nurhaliza@poliban.ac.id", role: "Dosen", status: "Aktif", lastLogin: "2026-05-11 16:20" },
  { id: 4, username: "bambang.sutrisno", nama: "Dr. Bambang Sutrisno, M.T.", email: "bambang.sutrisno@poliban.ac.id", role: "Dosen", status: "Aktif", lastLogin: "2026-05-12 07:45" },
  { id: 5, username: "2301010001", nama: "Ahmad Fauzi", email: "2301010001@student.poliban.ac.id", role: "Mahasiswa", status: "Aktif", lastLogin: "2026-05-11 14:30" },
  { id: 6, username: "2301010002", nama: "Siti Nurhaliza", email: "2301010002@student.poliban.ac.id", role: "Mahasiswa", status: "Aktif", lastLogin: "2026-05-12 10:15" },
  { id: 7, username: "staff.akademik", nama: "Rina Wati, S.Kom.", email: "staff.akademik@poliban.ac.id", role: "Staff Akademik", status: "Aktif", lastLogin: "2026-05-12 08:00" },
  { id: 8, username: "kaprodi.ti", nama: "M. Rizal, M.Kom.", email: "kaprodi.ti@poliban.ac.id", role: "Kaprodi", status: "Aktif", lastLogin: "2026-05-11 15:45" },
];

function normalizeUserStatus(value: any) {
  return value === "Y" || value === true || value === 1 || value === "1" || value === "Aktif"
    ? "Aktif"
    : "Nonaktif";
}

function mapUser(item: any) {
  const roles = item.roles;
  const role = Array.isArray(roles)
    ? roles.map((roleItem) => roleItem.role_name ?? roleItem.name).filter(Boolean).join(", ")
    : valueOf(item.role_name, item.role, "-");

  return {
    id: valueOf(item.id_user, item.ID_USER, item.id),
    username: valueOf(item.username, item.email, "-"),
    nama: valueOf(item.name, item.nama, item.NAMA_USER, "-"),
    email: valueOf(item.email, "-"),
    role,
    status: normalizeUserStatus(valueOf(item.is_active, item.IS_ACTIVE, item.status, "Y")),
    lastLogin: valueOf(item.last_login_at, item.lastLogin, item.updated_at, "-"),
  };
}

export default function UserManagement() {
  const { data, loading, error } = useApiData({
    fallback: userData,
    fetcher: adminService.getUsers,
    mapper: mapUser,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || item.role === filterRole;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Administrator":
        return "bg-red-100 text-red-800";
      case "Dosen":
        return "bg-blue-100 text-blue-800";
      case "Mahasiswa":
        return "bg-green-100 text-green-800";
      case "Kaprodi":
        return "bg-purple-100 text-purple-800";
      case "Staff Akademik":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Kelola pengguna sistem SIMPADU</p>
      </div>

      {loading && <LoadingState label="Memuat data user..." />}
      {error && <ErrorState message={error} />}

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari username, nama, atau email..."
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
            <span>Tambah User</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Role</option>
            <option value="Administrator">Administrator</option>
            <option value="Dosen">Dosen</option>
            <option value="Mahasiswa">Mahasiswa</option>
            <option value="Kaprodi">Kaprodi</option>
            <option value="Staff Akademik">Staff Akademik</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nama Lengkap</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.username}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.nama}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleColor(item.role)}`}>
                      {item.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      item.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.lastLogin}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-orange-600 hover:bg-orange-50 rounded transition-colors" title="Reset Password">
                        <Lock className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Hapus">
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
            Menampilkan <span className="font-medium">{filteredData.length}</span> dari{" "}
            <span className="font-medium">{data.length}</span> data
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
              Previous
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">1</button>
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
        title={editData ? "Edit User" : "Tambah User"}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                defaultValue={editData?.username}
                placeholder="Contoh: admin"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                defaultValue={editData?.nama}
                placeholder="Contoh: Dr. Ahmad Yani, M.Kom."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                defaultValue={editData?.email}
                placeholder="Contoh: user@poliban.ac.id"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {!editData && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Masukkan password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                defaultValue={editData?.role}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Pilih Role</option>
                <option value="Administrator">Administrator</option>
                <option value="Dosen">Dosen</option>
                <option value="Mahasiswa">Mahasiswa</option>
                <option value="Kaprodi">Kaprodi</option>
                <option value="Staff Akademik">Staff Akademik</option>
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
              {editData ? "Simpan Perubahan" : "Tambah User"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
