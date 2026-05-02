import { useQuery } from '@tanstack/react-query';
import { Land } from '@/store/worldStore';

interface LandData {
  lands: Land[];
  total: number;
}

async function fetchLands(): Promise<LandData> {
  const res = await fetch('/api/lands');
  if (!res.ok) throw new Error('Failed to fetch lands');
  return res.json();
}

export function useWorldData() {
  return useQuery<LandData>({
    queryKey: ['lands'],
    queryFn: fetchLands,
    staleTime: 30_000,
    placeholderData: { lands: [], total: 0 },
  });
}

// Build a lookup map: "x,y" -> Land
export function useLandMap() {
  const { data } = useWorldData();
  const map = new Map<string, Land>();
  data?.lands.forEach((l) => map.set(`${l.x},${l.y}`, l));
  return map;
}
