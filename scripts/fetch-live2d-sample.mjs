// Download an official compatibility fixture locally; do not commit sample assets.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile);
const repo = 'Live2D/CubismWebSamples';
const ref = '4-r.7';
const dest = path.resolve(process.argv[2] || 'local/samples/Haru');
async function api(endpoint) {
  return JSON.parse((await exec('gh', ['api', `repos/${repo}/${endpoint}`], { maxBuffer: 20e6 })).stdout);
}
const commit = (await api(`commits/${ref}`)).sha;
const entries = (await api(`git/trees/${commit}?recursive=1`)).tree;
const prefix = 'Samples/Resources/Haru/';
const source = entries.filter(e => e.type === 'blob' && e.path.startsWith(prefix) && !e.path.includes('/sounds/'));
await fs.mkdir(dest, { recursive: true });
let cursor = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (cursor < source.length) {
    const entry = source[cursor++];
    const blob = await api(`git/blobs/${entry.sha}`);
    const data = Buffer.from(blob.content, 'base64');
    const hash = crypto.createHash('sha1').update(`blob ${data.length}\0`).update(data).digest('hex');
    if (hash !== entry.sha) throw Error(`Blob checksum mismatch: ${entry.path}`);
    const output = path.join(dest, entry.path.slice(prefix.length));
    await fs.mkdir(path.dirname(output), { recursive: true });
    await fs.writeFile(output, data);
  }
}));
const modelPath = path.join(dest, 'Haru.model3.json');
const model = JSON.parse(await fs.readFile(modelPath, 'utf8'));
for (const motions of Object.values(model.FileReferences.Motions || {})) {
  for (const motion of motions) delete motion.Sound;
}
await fs.writeFile(modelPath, JSON.stringify(model, null, 2) + '\n');
await fs.writeFile(path.join(path.dirname(dest), 'Haru-source.json'), JSON.stringify({
  repository: `https://github.com/${repo}`, ref, commit, copyright: '© Live2D Inc.',
  license: 'https://www.live2d.com/eula/live2d-free-material-license-agreement_en.html',
  terms: 'https://docs.live2d.com/en/cubism-editor-manual/sample-model/',
  modifications: ['Omitted bundled voice files and removed motion Sound references.'],
  files: source.map(e => ({ path: e.path, gitBlobSha: e.sha })),
}, null, 2) + '\n');
console.log(JSON.stringify({ dest, commit, files: source.length }));
