'use client';
import { useBuilderStore, Behavior, TriggerType, ActionType } from '@/store/builderStore';

const TRIGGERS: TriggerType[] = ['OnClick', 'OnCollide', 'OnEnter', 'OnTimer'];
const ACTIONS: ActionType[] = ['PlayAnimation', 'Teleport', 'ShowMessage', 'GiveToken', 'PlaySound'];

const TRIGGER_ICONS: Record<TriggerType, string> = {
  OnClick: '🖱️', OnCollide: '💥', OnEnter: '🚪', OnTimer: '⏱️',
};
const ACTION_ICONS: Record<ActionType, string> = {
  PlayAnimation: '🎬', Teleport: '✨', ShowMessage: '💬', GiveToken: '🪙', PlaySound: '🔊',
};

interface Props {
  objectId: string;
  behaviors: Behavior[];
}

export default function BehaviorEditor({ objectId, behaviors }: Props) {
  const { addBehavior, removeBehavior, updateBehavior } = useBuilderStore();

  return (
    <div className="space-y-2">
      {behaviors.map((b) => (
        <div key={b.id} className="bg-black/30 border border-white/10 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            {/* Trigger */}
            <div className="flex-1">
              <label className="text-xs text-gray-500 block mb-1">WHEN</label>
              <select
                value={b.trigger}
                onChange={(e) => updateBehavior(objectId, b.id, { trigger: e.target.value as TriggerType })}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded px-2 py-1 text-sm text-white"
              >
                {TRIGGERS.map((t) => (
                  <option key={t} value={t}>{TRIGGER_ICONS[t]} {t}</option>
                ))}
              </select>
            </div>

            <div className="text-gray-500 mt-4">→</div>

            {/* Action */}
            <div className="flex-1">
              <label className="text-xs text-gray-500 block mb-1">DO</label>
              <select
                value={b.action}
                onChange={(e) => updateBehavior(objectId, b.id, { action: e.target.value as ActionType })}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded px-2 py-1 text-sm text-white"
              >
                {ACTIONS.map((a) => (
                  <option key={a} value={a}>{ACTION_ICONS[a]} {a}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => removeBehavior(objectId, b.id)}
              className="mt-4 text-red-400 hover:text-red-300 text-lg leading-none"
              title="Remove behavior"
            >
              ×
            </button>
          </div>

          {/* Inline param for ShowMessage */}
          {b.action === 'ShowMessage' && (
            <input
              type="text"
              placeholder="Message text..."
              value={(b.params.message as string) ?? ''}
              onChange={(e) => updateBehavior(objectId, b.id, { params: { ...b.params, message: e.target.value } })}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded px-2 py-1 text-sm text-white placeholder-gray-600"
            />
          )}
          {b.action === 'GiveToken' && (
            <input
              type="number"
              placeholder="Amount (SVRS)"
              value={(b.params.amount as number) ?? ''}
              onChange={(e) => updateBehavior(objectId, b.id, { params: { ...b.params, amount: Number(e.target.value) } })}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded px-2 py-1 text-sm text-white placeholder-gray-600"
            />
          )}
          {b.action === 'OnTimer' && (
            <input
              type="number"
              placeholder="Interval (seconds)"
              value={(b.params.interval as number) ?? ''}
              onChange={(e) => updateBehavior(objectId, b.id, { params: { ...b.params, interval: Number(e.target.value) } })}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded px-2 py-1 text-sm text-white placeholder-gray-600"
            />
          )}
        </div>
      ))}

      <button
        onClick={() => addBehavior(objectId, { trigger: 'OnClick', action: 'ShowMessage', params: {} })}
        className="w-full py-2 border border-dashed border-purple-500/40 rounded-lg text-purple-400 hover:border-purple-400 hover:text-purple-300 text-sm transition-colors"
      >
        + Add Behavior
      </button>
    </div>
  );
}
