import { Outlet, NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  BookOpen,
  Users,
  Calendar,
  BookMarked,
  ClipboardList,
  FileText,
  CheckSquare,
  UserCheck,
  UserCog,
  Shield,
  Activity,
  Settings,
  LogOut,
  School
} from "lucide-react";

const menuItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/jurusan", icon: Building2, label: "Jurusan" },
  { path: "/program-studi", icon: GraduationCap, label: "Program Studi" },
  { path: "/mata-kuliah", icon: BookOpen, label: "Mata Kuliah" },
  { path: "/kelas", icon: Users, label: "Kelas" },
  { path: "/program-kelas", icon: School, label: "Program Kelas" },
  { path: "/tahun-akademik", icon: Calendar, label: "Tahun Akademik" },
  { path: "/kurikulum", icon: BookMarked, label: "Kurikulum" },
  { path: "/jadwal-kuliah", icon: ClipboardList, label: "Jadwal Kuliah" },
  { path: "/pertemuan-perkuliahan", icon: FileText, label: "Pertemuan Perkuliahan" },
  { path: "/krs", icon: FileText, label: "KRS" },
  { path: "/khs", icon: FileText, label: "KHS" },
  { path: "/nilai-mahasiswa", icon: CheckSquare, label: "Nilai Mahasiswa" },
  { path: "/absensi-mahasiswa", icon: UserCheck, label: "Absensi Mahasiswa" },
  { path: "/absensi-pegawai", icon: UserCog, label: "Absensi Pegawai" },
  { path: "/user-management", icon: Users, label: "User Management" },
  { path: "/role-management", icon: Shield, label: "Role Management" },
  { path: "/log-activity", icon: Activity, label: "Log Activity" },
  { path: "/pengaturan", icon: Settings, label: "Pengaturan" },
];

export default function DashboardLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col fixed h-full">
        {/* Logo/Header */}
        <div className="p-6 border-b border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-blue-900" />
            </div>
            <div>
              <h1 className="font-bold">SIMPADU</h1>
              <p className="text-xs text-blue-300">POLIBAN</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                  isActive
                    ? "bg-blue-800 text-white border-l-4 border-white"
                    : "text-blue-100 hover:bg-blue-800"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-blue-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full text-sm text-blue-100 hover:bg-blue-800 rounded transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 ml-64 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
