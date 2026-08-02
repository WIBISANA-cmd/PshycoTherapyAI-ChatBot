import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { SYSTEM_PROMPT, CRISIS_PROMPT, isCrisis } from './prompt.js';
import { toParts } from './attachments.js';
import { MODEL, MODEL_MULTIMODAL, missingConfig, streamChat } from './llm.js';

// Gagal cepat dengan pesan jelas — jauh lebih enak di-debug daripada container yang
// hidup tapi 500 di setiap chat.
const missing = missingConfig();
if (missing.length) {
  console.error(`✗ ${missing.join(' & ')} belum diset. Isi di .env (lokal) atau Environment (Dokploy).`);
  process.exit(1);
}

const app = express();

const MAX_TURNS = 20; // jendela konteks: 20 pesan terakhir
const MAX_CHARS = 4000;
const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');

// Di belakang reverse proxy (Traefik-nya Dokploy) IP asli ada di X-Forwarded-For.
// Tanpa ini rate limit menghitung semua orang sebagai satu IP proxy.
// Biarkan 0 saat jalan langsung, supaya header itu tidak bisa dipalsukan.
app.set('trust proxy', Number(process.env.TRUST_PROXY ?? 0));

app.use(express.json({ limit: '24mb' })); // screenshot + voice note dikirim sebagai base64

app.get('/api/health', (req, res) =>
  res.json({ ok: true, model: MODEL, modelMultimodal: MODEL_MULTIMODAL })
);

app.post(
  '/api/chat',
  rateLimit({ windowMs: 60_000, limit: 20, message: { error: 'Terlalu banyak permintaan. Coba lagi sebentar lagi ya.' } }),
  async (req, res) => {
    const messages = req.body?.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages wajib diisi' });
    }

    const history = messages.slice(-MAX_TURNS).map((m) => {
      const text = String(m.text ?? '').slice(0, MAX_CHARS);
      const media = toParts(m.files);
      const role = m.role === 'model' ? 'assistant' : 'user';
      if (!media.length) return { role, content: text || ' ' };
      // Voice note tanpa caption: blok text kosong ditolak API, jadi beri pengantar singkat.
      return { role, content: [{ type: 'text', text: text || '(pesan ini berupa lampiran)' }, ...media] };
    });

    // Hanya percakapan yang membawa lampiran yang butuh model multimodal.
    const model = history.some((m) => Array.isArray(m.content)) ? MODEL_MULTIMODAL : MODEL;

    const lastUser = messages.filter((m) => m.role !== 'model').at(-1);
    const crisis = isCrisis(String(lastUser?.text ?? ''));

    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

    if (crisis) send({ type: 'crisis' });

    try {
      let sent = 0;
      let finish;
      let reply = '';
      const stream = streamChat({
        model,
        messages: [{ role: 'system', content: SYSTEM_PROMPT + (crisis ? CRISIS_PROMPT : '') }, ...history],
        temperature: 0.9,
        // MiniMax itu thinking model dan penalarannya ikut menghabiskan token,
        // jadi jatahnya lebih longgar daripada panjang balasan yang diinginkan.
        maxTokens: 3072,
      });

      for await (const part of stream) {
        if (part.text) {
          send({ type: 'chunk', text: part.text });
          sent += part.text.length;
          reply += part.text;
        }
        if (part.finish) finish = part.finish;
      }

      // Regex hanya bisa membaca teks, jadi risiko yang disampaikan lewat voice note atau
      // screenshot akan lolos. Model sendiri sudah "mendengar"-nya — kalau balasannya ikut
      // berbicara soal bunuh diri/melukai diri, tampilkan juga banner bantuannya.
      if (!crisis && isCrisis(reply)) send({ type: 'crisis' });

      // Jaring pengaman kalau jawaban tetap kepotong di tengah kalimat
      if (finish === 'length' && sent > 0) {
        send({ type: 'chunk', text: '\n\n_(maaf, responsku kepanjangan dan terpotong — bilang "lanjutkan" kalau kamu mau aku teruskan)_' });
      }
      if (sent === 0) {
        send({ type: 'chunk', text: 'Maaf, aku belum bisa merespons yang itu. Boleh ceritakan dengan cara lain?' });
      }
      send({ type: 'done' });
    } catch (err) {
      console.error('[chat]', err?.message);
      const quota = err?.status === 429 || /quota|rate/i.test(err?.message ?? '');
      send({
        type: 'error',
        message: quota
          ? 'Layanan sedang padat. Coba lagi dalam beberapa saat ya.'
          : 'Ada gangguan koneksi ke layanan. Coba kirim ulang pesanmu.',
      });
    }
    res.end();
  }
);

// Di produksi hasil build React ikut disalin ke ./public, jadi satu container
// melayani API sekaligus halamannya — satu domain, tanpa CORS, tanpa proxy.
// Saat dev lokal folder ini tidak ada dan blok ini dilewati begitu saja.
if (fs.existsSync(PUBLIC_DIR)) {
  app.use(express.static(PUBLIC_DIR, { index: false, maxAge: '1y' })); // aset Vite ber-hash, aman di-cache lama
  app.use((req, res, next) =>
    req.method === 'GET' ? res.sendFile(path.join(PUBLIC_DIR, 'index.html')) : next()
  );
}

// Dokploy/Traefik mengarahkan trafik ke port ini; 0.0.0.0 wajib supaya bisa dijangkau dari luar container.
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`server ready on port ${PORT}${fs.existsSync(PUBLIC_DIR) ? ' (menyajikan frontend juga)' : ''}`)
);
