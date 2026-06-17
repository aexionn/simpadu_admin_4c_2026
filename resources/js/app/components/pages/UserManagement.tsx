import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Edit, Filter, Plus, Power, Search, Trash2 } from "lucide-react";
import Modal from "../Modal";
import { api, readJson } from "../../lib/apiClient";
import { adminService } from "../../services/apiServices";
import { ErrorState, LoadingState } from "./apiPageUtils";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

type UserRow = {
  id_user: number;
  name: string;
  email: string;
  is_active: "Y" | "T" | string;
  roles?: string[];
};

type RoleRow = {
  id_role: number;
  role_name: string;
};

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "",
  is_active: "Y",
};

function getApiMessage(json: ApiResponse<unknown> | null, fallback: string) {
  const firstError = Object.values(json?.errors ?? {})[0]?.[0];
  return firstError ?? json?.message ?? fallback;
}

function activeLabel(value: string) {
  return value === "Y" ? "Aktif" : "Nonaktif";
}

function roleColor(role: string) {
  const roleName = role.toLowerCase();
  if (roleName.includes("super") || roleName.includes("admin")) return "bg-red-100 text-red-800";
  if (roleName.includes("dosen")) return "bg-blue-100 text-blue-800";
  if (roleName.includes("mahasiswa")) return "bg-green-100 text-green-800";
  if (roleName.includes("pegawai")) return "bg-orange-100 text-orange-800";
  return "bg-gray-100 text-gray-800";
}

export default function UserManagement() {
  const [data, setData] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<UserRow | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const [users, roleRows] = await Promise.all([adminService.getUsers(), adminService.getRoles()]);
      setData(users as UserRow[]);
      setRoles(roleRows as RoleRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data user.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const roleOptions = useMemo(() => roles.map((role) => role.role_name), [roles]);

  const filteredData = useMemo(() => {
    const keyword = searchTerm.toLowerCase();

    return data.filter((item) => {
      const itemRoles = item.roles ?? [];
      const matchesSearch =
        item.name.toLowerCase().includes(keyword) ||
        item.email.toLowerCase().includes(keyword) ||
        String(item.id_user).includes(keyword);
      const matchesRole = filterRole === "all" || itemRoles.includes(filterRole);
      const matchesStatus = filterStatus === "all" || item.is_active === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [data, filterRole, filterStatus, searchTerm]);

  function openCreateModal() {
    setEditData(null);
    setForm({ ...emptyForm, role: roleOptions[0] ?? "" });
    setIsModalOpen(true);
  }

  function openEditModal(item: UserRow) {
    setEditData(item);
    setForm({
      name: item.name,
      email: item.email,
      password: "",
      role: item.roles?.[0] ?? roleOptions[0] ?? "",
      is_active: item.is_active || "Y",
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = editData
      ? {
          name: form.name,
          email: form.email,
          is_active: form.is_active,
        }
      : {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          is_active: form.is_active,
        };

    try {
      const res = editData
        ? await api.patch(`/admin/users/${editData.id_user}`, payload)
        : await api.post("/admin/users", payload);
      const json = await readJson<ApiResponse<UserRow>>(res);

      if (!res.ok || json?.success === false) {
        throw new Error(getApiMessage(json, "Gagal menyimpan data user."));
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan data user.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(item: UserRow) {
    try {
      const res = await api.patch(`/admin/users/${item.id_user}/toggle`);
      const json = await readJson<ApiResponse<UserRow>>(res);

      if (!res.ok || json?.success === false) {
        throw new Error(getApiMessage(json, "Gagal mengubah status user."));
      }

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah status user.");
    }
  }

  async function handleDelete(item: UserRow) {
    if (!window.confirm(`Hapus user ${item.name}?`)) return;

    try {
      const res = await api.delete(`/admin/users/${item.id_user}`);
      const json = await readJson<ApiResponse<null>>(res);

      if (!res.ok || json?.success === false) {
        throw new Error(getApiMessage(json, "Gagal menghapus user."));
      }

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus user.");
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Kelola pengguna sistem SIMPADU</p>
      </div>

      {loading && <LoadingState label="Memuat data user..." />}
      {error && <ErrorState message={error} />}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari ID user, nama, atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah User</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Role</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Status</option>
            <option value="Y">Aktif</option>
            <option value="T">Nonaktif</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">ID User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item, index) => {
                const itemRoles = item.roles?.length ? item.roles : ["-"];

                return (
                  <tr key={item.id_user} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.id_user}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {itemRoles.map((role) => (
                          <span key={role} className={`px-3 py-1 text-xs font-medium rounded-full ${roleColor(role)}`}>
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          item.is_active === "Y" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {activeLabel(item.is_active)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggle(item)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                          title="Toggle Status"
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredData.length === 0 && (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={7}>
                    Tidak ada data user.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editData ? "Edit User" : "Tambah User"}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {!editData && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    minLength={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Pilih Role</option>
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
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
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
