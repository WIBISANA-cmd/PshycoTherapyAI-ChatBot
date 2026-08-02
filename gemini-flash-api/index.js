import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI } from '@google/genai';
import { MODEL, SYSTEM_PROMPT, CRISIS_PROMPT, isCrisis } from './prompt.js';
import { toParts } from './attachments.js';

// Gagal cepat dengan pesan jelas — jauh lebih enak di-debug daripada container yang
// hidup tapi 500 di setiap chat.
if (!process.env.GEMINI_API_KEY) {
  console.error('✗ GEMINI_API_KEY belum diset. Isi di .env (lokal) atau Environment (Dokploy).');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const app = express();

const MAX_TURNS = 20; // jendela konteks: 20 pesan terakhir
const MAX_CHARS = 4000;
const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');

// Di belakang reverse proxy (Traefik-nya Dokploy) IP asli ada di X-Forwarded-For.
// Tanpa ini rate limit menghitung semua orang sebagai satu IP proxy.
// Biarkan 0 saat jalan langsung, supaya header itu tidak bisa dipalsukan.
app.set('trust proxy', Number(process.env.TRUST_PROXY ?? 0));

app.use(express.json({ limit: '24mb' })); // screenshot + voice note dikirim sebagai base64

app.get('/api/health', (req, res) => res.json({ ok: true, model: MODEL }));

app.post(
  '/api/chat',
  rateLimit({ windowMs: 60_000, limit: 20, message: { error: 'Terlalu banyak permintaan. Coba lagi sebentar lagi ya.' } }),
  async (req, res) => {
    const messages = req.body?.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages wajib diisi' });
    }

    const contents = messages.slice(-MAX_TURNS).map((m) => {
      const text = String(m.text ?? '').slice(0, MAX_CHARS);
      const media = toParts(m.files);
      // Voice note tanpa caption: part text kosong ditolak API, jadi beri pengantar singkat.
      const parts = [...media, { text: text || (media.length ? '(pesan ini berupa lampiran)' : ' ') }];
      return { role: m.role === 'model' ? 'model' : 'user', parts };
    });

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
      const stream = await ai.models.generateContentStream({
        model: MODEL,
        contents,
        config: {
          systemInstruction: SYSTEM_PROMPT + (crisis ? CRISIS_PROMPT : ''),
          temperature: 0.9,
          maxOutputTokens: 2048,
          // gemini-3.6-flash itu thinking model: tanpa ini ~1000 token habis untuk
          // berpikir dan jawabannya terpotong di tengah kalimat (finishReason MAX_TOKENS).
          // Percakapan terapeutik butuh kehangatan, bukan penalaran dalam.
          thinkingConfig: { thinkingLevel: 'minimal' },
          // Domain ini wajar menyentuh topik sedih/gelap; blokir hanya yang berisiko tinggi
          // supaya model tidak menolak percakapan terapeutik yang sah.
          safetySettings: [
            'HARM_CATEGORY_DANGEROUS_CONTENT',
            'HARM_CATEGORY_HARASSMENT',
            'HARM_CATEGORY_HATE_SPEECH',
            'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          ].map((category) => ({ category, threshold: 'BLOCK_ONLY_HIGH' })),
        },
      });

      let sent = 0;
      let finish;
      let reply = '';
      for await (const chunk of stream) {
        if (chunk.text) {
          send({ type: 'chunk', text: chunk.text });
          sent += chunk.text.length;
          reply += chunk.text;
        }
        finish = chunk.candidates?.[0]?.finishReason ?? finish;
      }

      // Regex hanya bisa membaca teks, jadi risiko yang disampaikan lewat voice note atau
      // screenshot akan lolos. Model sendiri sudah "mendengar"-nya — kalau balasannya ikut
      // berbicara soal bunuh diri/melukai diri, tampilkan juga banner bantuannya.
      if (!crisis && isCrisis(reply)) send({ type: 'crisis' });

      // Jaring pengaman kalau jawaban tetap kepotong di tengah kalimat
      if (finish === 'MAX_TOKENS' && sent > 0) {
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
