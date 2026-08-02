import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI } from '@google/genai';
import { MODEL, SYSTEM_PROMPT, CRISIS_PROMPT, isCrisis } from './prompt.js';
import { toParts } from './attachments.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const app = express();

const MAX_TURNS = 20; // jendela konteks: 20 pesan terakhir
const MAX_CHARS = 4000;
app.use(cors());
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`server ready on http://localhost:${PORT}`));
