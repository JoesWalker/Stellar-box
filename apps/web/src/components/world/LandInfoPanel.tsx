'use client';
import { Land } from '@/store/worldStore';
import { useWallet } from '@/providers/WalletProvider';
import { buyAsset } from '@/lib/contracts';

interface Props {
  land: Land | null;
  coords: { x: number; y: number } | null;
  onClose: () => void;
}

function truncate(addr: string) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '—';
}

export default function LandInfoPanel({ land, coords, onClose }: Props) {
  const { signTransaction, address } = useWallet();

  if (!coords) return null;

  const isOwned = !!land;
  const isOwner = land?.owner === address;

  async function handleBuy() {
    if (!land || !signTransaction) return;
    await buyAsset({ signTransaction } as never, land.id);
  }

  return (
    <div className="absolute right-4 top-20 w-72 card-space p-5 space-y-4 z-20 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-gradient font-bold text-lg">
          Land ({coords.x}, {coords.y})
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
      </div>

      <div className="space-y-2 text-sm">
        <Row label="Status" value={isOwned ? 'Owned' : 'Available'} accent={isOwned ? 'purple' : 'green'} />
        <Row label="Coordinates" value={`(${coords.x}, ${coords.y})`} />
        {land && <Row label="Owner" value={truncate(land.owner)} />}
        {land && <Row label="Size" value={`${land.size}×${land.size}`} />}
        {land?.uri && <Row label="URI" value={truncate(land.uri)} />}
      </div>

      <div className="flex gap-2 pt-1">
        {!isOwned && (
          <button className="btn-primary flex-1 text-sm py-2" onClick={handleBuy}>
            Buy Land
          </button>
        )}
        {isOwned && !isOwner && (
          <button className="btn-secondary flex-1 text-sm py-2">Visit</button>
        )}
        {isOwner && (
          <button className="btn-primary flex-1 text-sm py-2">Manage</button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: string }) {
  const accentClass = accent === 'purple' ? 'text-purple-400' : accent === 'green' ? 'text-green-400' : 'text-gray-200';
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span className={accentClass}>{value}</span>
    </div>
  );
}
