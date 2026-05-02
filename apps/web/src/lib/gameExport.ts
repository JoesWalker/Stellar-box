import { SceneObject } from '@/store/builderStore';

export interface GameConfig {
  version: '1.0';
  exportedAt: string;
  scene: {
    objects: SceneObject[];
  };
}

export function exportGameToJSON(objects: SceneObject[]): GameConfig {
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    scene: { objects },
  };
}

export function validateGameConfig(config: unknown): string[] {
  const errors: string[] = [];
  if (!config || typeof config !== 'object') {
    return ['Invalid config: must be an object'];
  }
  const c = config as Record<string, unknown>;
  if (c.version !== '1.0') errors.push('Invalid or missing version');
  if (!c.scene || typeof c.scene !== 'object') {
    errors.push('Missing scene');
    return errors;
  }
  const scene = c.scene as Record<string, unknown>;
  if (!Array.isArray(scene.objects)) {
    errors.push('scene.objects must be an array');
    return errors;
  }
  (scene.objects as unknown[]).forEach((obj, i) => {
    if (!obj || typeof obj !== 'object') { errors.push(`Object ${i}: invalid`); return; }
    const o = obj as Record<string, unknown>;
    if (!o.id) errors.push(`Object ${i}: missing id`);
    if (!o.assetId) errors.push(`Object ${i}: missing assetId`);
    if (!Array.isArray(o.position) || (o.position as unknown[]).length !== 3)
      errors.push(`Object ${i}: invalid position`);
  });
  return errors;
}
