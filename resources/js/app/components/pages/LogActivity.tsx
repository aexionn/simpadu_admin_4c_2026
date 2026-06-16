import { useState } from "react";
import { Search, Filter, Download, Calendar } from "lucide-react";

const logData = [
  { id: 1, timestamp: "2026-05-12 09:30:15", user: "admin", action: "Login", module: "Authentication", ipAddress: "192.168.1.100", status: "Success", description: "User berhasil login" },
  { id: 2, timestamp: "2026-05-12 09:25:42", user: "ahmad.yani", action: "Update", module: "Nilai Mahasiswa", ipAddress: "192.168.1.105", status: "Success", description: "Mengubah nilai mahasiswa 2301010001" },
  { id: 3, timestamp: "2026-05-12 09:20:18", user: "siti.nurhaliza", action: "Create", module: "Jadwal Kuliah", ipAddress: "192.168.1.108", status: "Success", description: "Menambah jadwal kuliah baru" },
  { id: 4, timestamp: "2026-05-12 09:15:33", user: "2301010003", action: "Login", module: "Authentication", ipAddress: "192.168.1.120", status: "Failed", description: "Password salah" },
  { id: 5, timestamp: "2026-05-12 09:10:27", user: "bambang.sutrisno", action: "Delete", module: "Absensi", ipAddress: "192.168.1.112", status: "Success", description: "Menghapus data absensi duplikat" },
  { id: 6, timestamp: "2026-05-12 09:05:55", user: "staff.akademik", action: "Update", module: "KRS", ipAddress: "192.168.1.95", status: "Success", description: "Menyetujui KRS mahasiswa 2301010005" },
  { id: 7, timestamp: "2026-05-12 09:00:12", user: "admin", action: "Create", module: "User Management", ipAddress: "192.168.1.100", status: "Success", description: "Menambah user baru: dosen.baru" },
  { id: 8, timestamp: "2026-05-12 08:55:48", user: "kaprodi.ti", action: "Read", module: "Kurikulum", ipAddress: "192.168.1.130", status: "Success", description: "Melihat detail kurikulum 2024" },
];

export default function LogActivity() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModule, setFilterModule] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredData = logData.filter((item) => {
    const matchesSearch =
      item.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = filterModule === "all" || item.module === filterModule;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesModule && matchesStatus;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case "Login":
        return "bg-blue-100 text-blue-800";
      case "Create":
        return "bg-green-100 text-green-800";
      case "Update":
        return "bg-yellow-100 text-yellow-800";
      case "Delete":
        return "bg-red-100 text-red-800";
      case "Read":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Log Activity</h1>
        <p className="text-gray-600 mt-1">Monitor aktivitas pengguna dalam sistem</p>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari user, action, atau deskripsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download className="w-5 h-5" />
            <span>Export Excel</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Module</option>
            <option value="Authentication">Authentication</option>
            <option value="Nilai Mahasiswa">Nilai Mahasiswa</option>
            <option value="Jadwal Kuliah">Jadwal Kuliah</option>
            <option value="Absensi">Absensi</option>
            <option value="KRS">KRS</option>
            <option value="User Management">User Management</option>
            <option value="Kurikulum">Kurikulum</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Status</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
          </select>
          <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg">
            <Calendar className="w-5 h-5 text-gray-600" />
            <input type="date" className="text-sm text-gray-600 border-0 focus:ring-0" defaultValue="2026-05-12" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Aktivitas</p>
          <p className="text-2xl font-bold text-blue-600">8</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Success</p>
          <p className="text-2xl font-bold text-green-600">7</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Failed</p>
          <p className="text-2xl font-bold text-red-600">1</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Unique Users</p>
          <p className="text-2xl font-bold text-purple-600">7</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Module</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.timestamp}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.user}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getActionColor(item.action)}`}>
                      {item.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.module}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.ipAddress}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      item.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Menampilkan <span className="font-medium">{filteredData.length}</span> dari{" "}
            <span className="font-medium">{logData.length}</span> data
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
    </div>
  );
}
