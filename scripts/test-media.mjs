import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const compile = file => ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;

test('Multipart photo uploads preserve authentication and let the transport set its boundary', async () => {
  const exports = {}; let captured;
  vm.runInNewContext(compile('src/api/client.ts'), { exports, process: { env: {} }, FormData, URLSearchParams, AbortController, setTimeout, clearTimeout,
    fetch: async (_url, options) => { captured = options; return Response.json({ ok: true }); },
  });
  const body = new FormData(); body.append('file', new Blob(['photo']), 'photo.jpg');
  await exports.apiRequest('/api/me/business/media/upload', { method: 'POST', body }, 'test-session');
  assert.equal(captured.headers.Authorization, 'Bearer test-session');
  assert.equal(captured.headers['Content-Type'], undefined);
  assert.equal(captured.body, body);
  await exports.apiRequest('/api/me/business/albums', { method: 'POST', body: JSON.stringify({ title: 'album' }) }, 'test-session');
  assert.equal(captured.headers['Content-Type'], 'application/json');
});

for (const failing of [false, true]) test(`Phone images resize without distortion and clean up only their generated temporary file (${failing ? 'failed' : 'successful'} upload)`, async () => {
  const exports = {}; const resized = []; const deleted = []; let file;
  const context = { resize: size => { resized.push(size); return context; }, renderAsync: async () => ({ saveAsync: async options => { assert.equal(options.format, 'jpeg'); return { uri: 'file:///cache/prepared.jpg' }; } }) };
  vm.runInNewContext(compile('src/media/upload.ts'), { exports,
    FormData: class { append(_key, value) { file = value; } },
    require: name => name === 'expo-image-manipulator' ? { ImageManipulator: { manipulate: () => context }, SaveFormat: { JPEG: 'jpeg' } } : name === 'expo-file-system/legacy' ? { getInfoAsync: async () => ({ exists: true, size: 100000 }), deleteAsync: async uri => deleted.push(uri) } : { apiRequest: async () => { if (failing) throw Error('offline'); return { ok: true }; } },
  });
  const action = () => exports.uploadBusinessPhoto({ uri: 'file:///photos/original.jpg', width: 4000, height: 3000 }, 'test-session');
  if (failing) await assert.rejects(action(), /offline/); else await action();
  assert.equal(resized[0].width, 1920); assert.equal(resized[0].height, null);
  assert.equal(file.type, 'image/jpeg'); assert.deepEqual(deleted, ['file:///cache/prepared.jpg']);
});
