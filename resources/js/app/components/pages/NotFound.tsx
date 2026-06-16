import { useNavigate } from "react-router";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <h2 className="text-3xl font-semibold text-gray-900 mt-4">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-600 mt-2 mb-8">
          Maaf, halaman yang Anda cari tidak dapat ditemukan.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Ke Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}
