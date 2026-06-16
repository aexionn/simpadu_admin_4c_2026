import { api, readJson } from "../lib/apiClient";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

export function getApiErrorMessage(status: number, message?: string) {
  if (status === 401) return "Session expired. Please login again.";
  if (status === 403) return "You do not have permission to view this data.";
  if (status === 404) return "Data tidak ditemukan.";
  if (status === 422) return message ?? "Permintaan data tidak valid.";
  if (status >= 500) return "Server sedang bermasalah. Coba lagi nanti.";
  return message ?? "Failed to load API data.";
}

export async function getList<T = any>(path: string): Promise<T[]> {
  const res = await api.get(path);
  const json = await readJson<ApiResponse<T[] | { data?: T[] }>>(res);

  if (!res.ok || json?.success === false) {
    throw new Error(getApiErrorMessage(res.status, json?.message));
  }

  const payload = json?.data;
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray((payload as { data?: T[] }).data)) {
    return (payload as { data: T[] }).data;
  }

  return [];
}

export const dataMasterService = {
  getProgramKelas: () => getList("/data-master/program-kelas"),
  getProgramStudi: () => getList("/data-master/prodi"),
  getMataKuliah: () => getList("/data-master/mata-kuliah"),
  getKurikulum: () => getList("/data-master/kurikulum"),
  getTahunAkademik: () => getList("/data-master/tahun-akademik"),
};

export const akademikService = {
  getKelas: () => getList("/akademik/kelas"),
  getKrs: () => getList("/akademik/krs"),
  getNilai: () => getList("/akademik/nilai"),
  getPresensiMahasiswa: () => getList("/akademik/presensi-mahasiswa"),
  getKelasMk: () => getList("/akademik/kelas-mk"),
  getPresensiRoster: () => getList("/akademik/presensi-mahasiswa/roster"),
};

export const presensiService = {
  getPresensiPegawai: () => getList("/presensi-pegawai"),
};

export const adminService = {
  getUsers: () => getList("/admin/users"),
  getRoles: () => getList("/admin/roles"),
};
