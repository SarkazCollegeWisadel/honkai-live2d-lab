import test from 'node:test';
import assert from 'node:assert/strict';
import {createExpressionBridge, expressionTool} from '../adapters/airi/expression-bridge.mjs';
function fixture() {
  let time=0, nextId=0;const frames=new Map(),timers=new Map();
  const clock={now:()=>time,frame:fn=>{frames.set(++nextId,fn);return nextId;},cancelFrame:id=>frames.delete(id),later:(fn,delay)=>{timers.set(++nextId,{fn,at:time+delay});return nextId;},cancelLater:id=>timers.delete(id)};
  const entries=new Map([
    ['ParamEyeLOpen',{blend:'Multiply',modelDefault:1,currentValue:1}],
    ['ParamEyeLSmile',{blend:'Add',modelDefault:0,currentValue:0}],
    ['ParamMouthForm',{blend:'Add',modelDefault:1,currentValue:1}],
    ['ParamMouthOpenY',{blend:'Add',modelDefault:0,currentValue:0.6}],
  ]);
  const presets={normal:[],happy:[{id:'ParamEyeLSmile',blend:'Add',value:1},{id:'ParamMouthOpenY',blend:'Add',value:1}],wink:[{id:'ParamEyeLOpen',blend:'Multiply',value:0}]};
  const bridge=createExpressionBridge({expressions:entries},presets,clock);
  function advance(ms){time+=ms;for(const[id,t]of [...timers])if(t.at<=time){timers.delete(id);t.fn();}for(const[id,fn]of [...frames]){frames.delete(id);fn();}}
  return {bridge,entries,advance};
}
test('blend identities and expression do not take over audio mouth opening',()=>{
  const f=fixture();assert.equal(f.entries.get('ParamMouthForm').currentValue,0);
  f.bridge.setEmotion({emotion:'happy',duration_ms:0});f.advance(110);
  assert.equal(f.entries.get('ParamEyeLSmile').currentValue,0.5);f.advance(110);
  assert.equal(f.entries.get('ParamEyeLSmile').currentValue,1);assert.equal(f.entries.get('ParamMouthOpenY').currentValue,0.6);
});
test('new expression cancels the previous reset and restores neutral',()=>{
  const f=fixture();f.bridge.setEmotion({emotion:'happy',duration_ms:1000,fade_ms:0});f.advance(500);
  f.bridge.setEmotion({emotion:'wink',duration_ms:1500,fade_ms:0});f.advance(500);
  assert.equal(f.bridge.emotion,'wink');assert.equal(f.entries.get('ParamEyeLOpen').currentValue,0);
  assert.equal(f.entries.get('ParamEyeLSmile').currentValue,0);f.advance(1000);
  assert.equal(f.bridge.emotion,'normal');assert.equal(f.entries.get('ParamEyeLOpen').currentValue,1);
});
test('invalid tool arguments do not change state; dispose cancels work',async()=>{
  const f=fixture();const t=expressionTool(f.bridge);
  assert.equal(JSON.parse(await t.execute('{"emotion":"bad","duration_ms":1}')).success,false);
  assert.equal(JSON.parse(await t.execute('{"emotion":"happy","duration_ms":-1}')).success,false);
  assert.equal(f.bridge.emotion,'normal');f.bridge.setEmotion({emotion:'happy'});f.bridge.dispose();f.advance(3000);
  assert.equal(f.entries.get('ParamEyeLSmile').currentValue,0);assert.throws(()=>f.bridge.setEmotion({emotion:'happy'}),/disposed/);
});
