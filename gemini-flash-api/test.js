// Self-check dua bagian berisiko: skrining krisis dan parser frame SSE.
// Jalankan: npm test
import assert from 'node:assert/strict';
import { isCrisis } from './prompt.js';
import { toParts } from './attachments.js';
import { thinkFilter } from './llm.js';

// --- deteksi krisis: harus memicu ---
for (const s of [
  'aku kepikiran bunuh diri terus',
  'rasanya pengen mati aja',
  'aku mau mengakhiri hidup',
  'kadang aku menyakiti diri sendiri',
  'aku udah gak mau hidup lagi',
  'mending aku mati aja',
]) {
  assert.equal(isCrisis(s), true, `harus terdeteksi krisis: "${s}"`);
}

// --- deteksi krisis: TIDAK boleh memicu (false positive bikin banner darurat sia-sia) ---
for (const s of [
  'aku capek banget hidup gini terus',
  'kerjaanku bikin stres berat',
  'aku sedih ditinggal pacar',
  'tadi nonton film soal orang yang hidupnya berat',
  'aku takut mati kesepian nanti',
]) {
  assert.equal(isCrisis(s), false, `tidak boleh dianggap krisis: "${s}"`);
}

// --- parser SSE: frame terpotong harus ditahan sampai utuh ---
// Cermin dari logika di gemini-chatbot-api/src/useChat.js
function parse(chunks) {
  const out = [];
  let buffer = '';
  for (const c of chunks) {
    buffer += c;
    const frames = buffer.split('\n\n');
    buffer = frames.pop();
    for (const f of frames) if (f.startsWith('data: ')) out.push(JSON.parse(f.slice(6)));
  }
  return out;
}

assert.deepEqual(
  parse(['data: {"type":"chunk","text":"ha', 'lo"}\n\ndata: {"type":"done"}\n\n']),
  [{ type: 'chunk', text: 'halo' }, { type: 'done' }],
  'frame yang terbelah antar-chunk harus digabung, bukan dibuang'
);

// --- validasi lampiran: trust boundary, browser tidak boleh dipercaya ---
const ok = { mime: 'image/png', data: 'aGVsbG8=' };
assert.equal(toParts([ok]).length, 1, 'PNG valid harus diterima');
assert.equal(toParts([{ ...ok, mime: 'audio/webm' }]).length, 1, 'voice note webm harus diterima');
assert.equal(toParts([{ ...ok, mime: 'application/pdf' }]).length, 0, 'mime di luar daftar harus ditolak');
assert.equal(toParts([{ ...ok, mime: 'image/svg+xml' }]).length, 0, 'SVG harus ditolak');
assert.equal(toParts([{ ...ok, data: 123 }]).length, 0, 'data non-string harus ditolak');
assert.equal(toParts([{ mime: 'image/png' }]).length, 0, 'data kosong harus ditolak');
assert.equal(toParts([{ ...ok, data: 'a'.repeat(12e6) }]).length, 0, 'berkas >8MB harus ditolak');
assert.equal(toParts(Array(9).fill(ok)).length, 4, 'jumlah lampiran dibatasi 4');
assert.deepEqual(toParts(undefined), [], 'files kosong tidak boleh melempar error');
assert.deepEqual(toParts('bukan array'), [], 'files bertipe salah tidak boleh melempar error');
assert.deepEqual(toParts([ok])[0], {
  type: 'image_url',
  image_url: { url: 'data:image/png;base64,aGVsbG8=' },
});
// Safari merekam audio/mp4; endpoint menolak format 'mp4' tapi menerima 'aac'.
assert.deepEqual(toParts([{ ...ok, mime: 'audio/mp4' }])[0], {
  type: 'input_audio',
  input_audio: { data: 'aGVsbG8=', format: 'aac' },
});

// --- filter <think>: penalaran model tidak boleh bocor ke layar pengguna ---
const run = (chunks) => {
  const f = thinkFilter();
  return chunks.map((c) => f.push(c)).join('') + f.flush();
};

assert.equal(run(['<think>rahasia</think>Halo']), 'Halo', 'blok think harus dibuang');
assert.equal(
  run(['<thi', 'nk>rahas', 'ia</thi', 'nk>Ha', 'lo']),
  'Halo',
  'tag yang terbelah antar-chunk SSE tetap harus dikenali'
);
assert.equal(run(['Halo apa kabar']), 'Halo apa kabar', 'teks tanpa think harus utuh');
assert.equal(run(['<think>tidak', ' pernah ditutup']), '', 'think yang tak tertutup harus dibuang total');
assert.equal(run(['Sebelum<think>x</think>sesudah']), 'Sebelumsesudah', 'think di tengah teks');
assert.equal(run(['a < b dan c > d']), 'a < b dan c > d', '"<" biasa tidak boleh ikut ditelan');

console.log('✓ semua self-check lolos');
