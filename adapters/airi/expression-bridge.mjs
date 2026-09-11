export const emotions = Object.freeze(['normal', 'confused', 'happy', 'pout', 'wink', 'smile']);
const protectedParameters = new Set(['ParamMouthOpenY', 'ParamBreath']);
const identity = entry => entry.blend === 'Add' ? 0 : entry.blend === 'Multiply' ? 1 : entry.modelDefault;

/** Adapt a character's exp3 parameter presets to AIRI's expression store.
 * Kept independent of Pinia discovery and credentials for reuse and testing.
 */
export function createExpressionBridge(store, presets, clock = {}) {
  const now = clock.now || (() => performance.now());
  const frame = clock.frame || requestAnimationFrame;
  const cancelFrame = clock.cancelFrame || cancelAnimationFrame;
  const later = clock.later || setTimeout;
  const cancelLater = clock.cancelLater || clearTimeout;
  let frameId, resetId, disposed = false, generation = 0;
  let currentEmotion = 'normal';
  const owned = new Set();

  function transition(emotion, fadeMs) {
    const desired = new Map();
    for (const p of presets[emotion] || []) {
      if (protectedParameters.has(p.id)) continue;
      const entry = store.expressions.get(p.id);
      if (!entry) continue;
      if (!['Add', 'Multiply', 'Overwrite'].includes(p.blend) || !Number.isFinite(p.value))
        throw new Error(`Invalid expression parameter: ${p.id}`);
      if (entry.blend !== p.blend) {
        entry.blend = p.blend;
        entry.currentValue = identity(entry);
      }
      desired.set(p.id, p.value);
      owned.add(p.id);
    }
    const values = [];
    for (const id of owned) {
      const entry = store.expressions.get(id);
      if (entry) values.push({ entry, from: entry.currentValue, to: desired.get(id) ?? identity(entry) });
    }
    const start = now(), ticket = ++generation;
    if (frameId != null) cancelFrame(frameId);
    function tick() {
      if (disposed || ticket !== generation) return;
      const progress = fadeMs === 0 ? 1 : Math.min(1, (now() - start) / fadeMs);
      const weight = progress * progress * (3 - 2 * progress);
      for (const v of values) v.entry.currentValue = v.from + (v.to - v.from) * weight;
      if (progress < 1) frameId = frame(tick);
      else frameId = undefined;
    }
    tick();
    currentEmotion = emotion;
  }

  function setEmotion({ emotion, duration_ms = 2500, fade_ms = 220 } = {}) {
    if (disposed) throw new Error('Expression bridge was disposed');
    if (!emotions.includes(emotion)) throw new Error('Unknown emotion');
    if (!Number.isFinite(duration_ms) || duration_ms < 0 || duration_ms > 10000)
      throw new Error('duration_ms must be between 0 and 10000');
    if (!Number.isFinite(fade_ms) || fade_ms < 0 || fade_ms > 1500)
      throw new Error('fade_ms must be between 0 and 1500');
    if (emotion !== 'normal' && !presets[emotion]) throw new Error(`Preset is missing: ${emotion}`);
    if (resetId != null) cancelLater(resetId);
    resetId = undefined;
    transition(emotion, fade_ms);
    if (emotion !== 'normal' && duration_ms > 0)
      resetId = later(() => transition('normal', fade_ms), duration_ms);
    return { success: true, emotion, duration_ms, fade_ms };
  }

  // Correct blend identities without saving over the user's persistent defaults.
  for (const [id, entry] of store.expressions) {
    if (!protectedParameters.has(id)) {
      entry.currentValue = identity(entry);
      owned.add(id);
    }
  }

  function dispose() {
    if (resetId != null) cancelLater(resetId);
    if (frameId != null) cancelFrame(frameId);
    for (const id of owned) {
      const entry = store.expressions.get(id);
      if (entry) entry.currentValue = identity(entry);
    }
    disposed = true;
    generation++;
  }

  return { setEmotion, dispose, get emotion() { return currentEmotion; } };
}

export function expressionTool(bridge) {
  return {
    id: 'honkai-lab:set-expression', type: 'function', defaultActive: false,
    function: {
      name: 'honkai_set_expression',
      description: 'Set the avatar expression. happy is a broad delighted smile; smile is subtle; pout is mild cute annoyance; wink closes one eye. Use normal to reset.',
      parameters: {
        type: 'object', additionalProperties: false,
        properties: {
          emotion: { type: 'string', enum: [...emotions] },
          duration_ms: { type: 'integer', minimum: 0, maximum: 10000, description: 'Reset after this duration; 0 holds until the next expression.' },
        },
        required: ['emotion', 'duration_ms'],
      },
    },
    execute: async args => {
      try {
        const parsed = typeof args === 'string' ? JSON.parse(args) : args;
        return JSON.stringify(bridge.setEmotion(parsed));
      } catch (error) {
        return JSON.stringify({ success: false, error: error.message });
      }
    },
  };
}
