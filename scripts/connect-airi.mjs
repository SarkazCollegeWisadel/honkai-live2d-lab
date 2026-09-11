#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const command = args.shift() || 'status';
function option(name, fallback) { const i=args.indexOf(name); return i<0?fallback:args[i+1]; }
const app = option('--app', process.env.AIRI_HOME);
if (!app) throw new Error('Set AIRI_HOME or pass --app with the AIRI installation directory');
const port = Number(option('--port', '9334'));
if (!Number.isInteger(port) || port<1024 || port>65535) throw new Error('Invalid debug port');
if (!['install','status','chat','expression','stop','dispose'].includes(command)) throw new Error('Unknown command');
const base = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const expected = pathToFileURL(path.join(app, 'resources/app.asar/out/renderer/index.html')).href;
const targets=await (await fetch(`http://127.0.0.1:${port}/json/list`,{signal:AbortSignal.timeout(5000)})).json();
const matching=targets.filter(t=>t.type==='page'&&t.url===expected+'?synced-leader=true#/');
if(matching.length!==1) throw new Error('Expected one AIRI main window. Start AIRI with --remote-debugging-port and open its main stage.');
const socketUrl = new URL(matching[0].webSocketDebuggerUrl);
if (!['127.0.0.1','localhost','[::1]'].includes(socketUrl.hostname) || Number(socketUrl.port)!==port) throw new Error('Unexpected debugger endpoint');
let expression;
if (command==='install') {
  const bridge=fs.readFileSync(path.join(base,'adapters/airi/expression-bridge.mjs'),'utf8').replace(/^export /gm,'');
  const runtime=fs.readFileSync(path.join(base,'adapters/airi/runtime.mjs'),'utf8').replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'');
  const customPath=option('--presets');
  const custom=customPath?JSON.parse(fs.readFileSync(customPath,'utf8')):null;
  expression=`(()=>{${bridge}\n${runtime}\nconst app=document.querySelector('#app')?.__vue_app__;const v=app?._context?.provides;const p=v&&Reflect.ownKeys(v).map(k=>v[k]).find(x=>x?._s instanceof Map);if(!p)throw Error('AIRI Pinia not ready');const presets=${custom?JSON.stringify(custom):"haruSamplePresets(p._s.get('live2d-expressions'))"};window.__honkaiAiri?.dispose();window.__honkaiAiri=installAiriRuntime(p,presets);return window.__honkaiAiri.status();})()`;
} else {
  const calls={status:'status()',stop:'stop()',dispose:'dispose()',chat:`send(${JSON.stringify(option('--text',''))})`,expression:`setEmotion(${JSON.stringify({emotion:option('--emotion','normal'),duration_ms:Number(option('--duration','4000'))})})`};
  expression=`(()=>{if(!window.__honkaiAiri)throw Error('Run install first');return window.__honkaiAiri.${calls[command]};})()`;
}
const ws=new WebSocket(socketUrl);
await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{ws.close();reject(Error('Debugger connection timed out'));},5000);ws.onopen=()=>{clearTimeout(timer);resolve();};ws.onerror=()=>{clearTimeout(timer);reject(Error('Debugger connection failed'));};});
try {
 const result=await new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>reject(Error('Request timed out; run status before retrying. The request may still be running.')),60000);
  ws.onmessage=e=>{const message=JSON.parse(e.data);if(message.id===1){clearTimeout(timeout);resolve(message);}};
  ws.onclose=()=>{clearTimeout(timeout);reject(Error('AIRI debugger closed'));};
  ws.send(JSON.stringify({id:1,method:'Runtime.evaluate',params:{expression,awaitPromise:true,returnByValue:true}}));
 });
 if(result.error||result.result?.exceptionDetails) throw Error(result.result?.exceptionDetails?.exception?.description||result.error?.message||'AIRI evaluation failed');
 console.log(JSON.stringify(result.result.result.value??{done:true},null,2));
} finally {ws.close();}
