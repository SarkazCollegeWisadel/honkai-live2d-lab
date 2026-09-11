// Uses AIRI's existing stores; no cloud credentials or copied application code.
import { createExpressionBridge, expressionTool } from './expression-bridge.mjs';

export function haruSamplePresets(store) {
  function group(name) {
    const found = store.expressionGroups.get(name);
    if (!found) throw new Error(`Haru sample expression ${name} is not loaded`);
    return found.parameters.map(p => ({ id: p.parameterId, blend: p.blend, value: p.value }));
  }
  return {
    normal: [], happy: group('F05'), pout: group('F08'),
    // Sample-only approximations; the final character needs dedicated artwork.
    confused: [
      { id: 'ParamBrowLY', blend: 'Add', value: .65 },
      { id: 'ParamBrowRY', blend: 'Add', value: -.15 },
      { id: 'ParamBrowLAngle', blend: 'Add', value: .4 },
      { id: 'ParamMouthForm', blend: 'Add', value: -.25 },
    ],
    wink: [{ id: 'ParamEyeLOpen', blend: 'Multiply', value: 0 }, { id: 'ParamEyeLSmile', blend: 'Add', value: 1 }],
    smile: [...group('F01'), { id: 'ParamEyeLSmile', blend: 'Add', value: .25 }, { id: 'ParamEyeRSmile', blend: 'Add', value: .25 }],
  };
}

export function installAiriRuntime(pinia, presets) {
  const required = ['live2d-expressions', 'llm-tools', 'chat', 'chat-session-selection', 'speech-output-control', 'character-speaking', 'settings-live2d'];
  for (const name of required) if (!pinia?._s.has(name)) throw new Error(`AIRI store missing: ${name}`);
  const expressions = pinia._s.get('live2d-expressions');
  const tools = pinia._s.get('llm-tools');
  const bridge = createExpressionBridge(expressions, presets);
  pinia._s.get('settings-live2d').live2dExpressionEnabled = true;
  expressions.setLlmMode('all');
  const calls = [];
  const tool = expressionTool(bridge);
  const execute = tool.execute;
  tool.execute = async args => {
    const result = await execute(args);
    calls.push({ at: Date.now(), result: JSON.parse(result) });
    if (calls.length > 20) calls.shift();
    return result;
  };
  tools.addTools(tool);
  let disposed = false;
  function status() {
    const speaking = pinia._s.get('character-speaking');
    return {
      installed: !disposed, emotion: bridge.emotion,
      sending: pinia._s.get('chat').sending,
      speaking: !!speaking.nowSpeaking, mouth: Number(speaking.mouthOpenSize),
      expressionCount: expressions.expressions.size, calls: calls.slice(),
    };
  }
  async function send(text) {
    if (disposed) throw new Error('Runtime has been disposed');
    if (typeof text !== 'string' || !text.trim() || text.length > 4000) throw new Error('Text must contain 1–4000 characters');
    const sessionId = pinia._s.get('chat-session-selection').activeSessionId;
    if (!sessionId) throw new Error('Select a project chat session first');
    const result = await pinia._s.get('chat').send({ sessionId, text, tools: [{ name: tool.function.name }] });
    return JSON.parse(JSON.stringify({ messages: result.messages.map(m => ({ role: m.role, content: m.content, tool_results: m.tool_results })), ...status() }));
  }
  function stop() {
    pinia._s.get('speech-output-control').requestStopSpeaking('manual-all');
    bridge.setEmotion({ emotion: 'normal', duration_ms: 0 });
    return status();
  }
  function dispose() {
    bridge.dispose();
    tools.removeToolById(tool.id);
    disposed = true;
  }
  return { status, send, stop, dispose, setEmotion: bridge.setEmotion };
}
