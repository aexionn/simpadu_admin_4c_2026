import { useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

type UseApiDataOptions<T> = {
  fallback: T[];
  fetcher: () => Promise<any[]>;
  mapper: (item: any) => T;
};

export function useApiData<T>({ fallback, fetcher, mapper }: UseApiDataOptions<T>) {
  const [data, setData] = useState<T[]>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const rows = await fetcher();
        if (!isMounted) return;
        setData(rows.length > 0 ? rows.map(mapper) : fallback);
      } catch (err) {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : "Failed to load API data.";
        setError(`${message} Showing fallback data.`);
        setData(fallback);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
}

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6 flex items-center gap-3 text-gray-600">
      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3 text-red-700">
      <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function activeStatus(value: any) {
  return value === "Y" || value === true || value === 1 || value === "1" || value === "Aktif"
    ? "Aktif"
    : "Nonaktif";
}

export function valueOf(...values: any[]) {
  return values.find((value) => value !== undefined && value !== null && value !== "") ?? "-";
}
