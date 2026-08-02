// Klien LLM OpenAI-compatible. Cukup fetch bawaan Node — tidak perlu SDK.
const BASE = (process.env.BASE_URL_AI ?? '').replace(/\/+$/, '');

export const MODEL = process.env.MODEL_AI || 'MiniMax-M2.7-highspeed';

// MiniMax-M2.7 tidak bisa melihat gambar maupun mendengar audio — lampiran
// diabaikan diam-diam dan modelnya menjawab "saya tidak melihat gambar".
// Jadi pesan yang berisi lampiran dialihkan ke model multimodal, yang punya
// kunci API sendiri (paket/kuota terpisah dari model teks).
export const MODEL_MULTIMODAL = process.env.MODEL_AI_MULTIMODAL || 'gemini/gemini-3.1-flash-lite';

// Dua kunci untuk dua model — masing-masing dipilih di index.js sesuai
// ada-tidaknya lampiran pada pesan.
const KEY = { text: process.env.API_KEY_AI, multimodal: process.env.API_KEY_AI_MULTIMODAL };

export const keyFor = (model) => (model === MODEL_MULTIMODAL ? KEY.multimodal : KEY.text);

export const missingConfig = () =>
  [
    !KEY.text && 'API_KEY_AI',
    !KEY.multimodal && 'API_KEY_AI_MULTIMODAL',
    !BASE && 'BASE_URL_AI',
  ].filter(Boolean);

const OPEN = '<think>';
const CLOSE = '</think>';

/**
 * MiniMax menyiarkan penalarannya sebagai `<think>…</think>` di dalam content
 * (bukan field terpisah), dan tag-nya bisa terbelah antar-chunk SSE. Filter ini
 * menahan potongan yang mungkin awal tag sampai jelas.
 */
export function thinkFilter() {
  let buf = '';
  let inside = false;

  // Panjang akhiran `s` yang merupakan awalan `tag` — bagian yang harus ditahan.
  const partialTail = (s, tag) => {
    for (let n = Math.min(tag.length - 1, s.length); n > 0; n--) {
      if (tag.startsWith(s.slice(-n))) return n;
    }
    return 0;
  };

  return {
    push(chunk) {
      buf += chunk ?? '';
      let out = '';
      for (;;) {
        if (inside) {
          const i = buf.indexOf(CLOSE);
          if (i === -1) {
            buf = buf.slice(-partialTail(buf, CLOSE) || buf.length);
            return out;
          }
          buf = buf.slice(i + CLOSE.length);
          inside = false;
        } else {
          const i = buf.indexOf(OPEN);
          if (i === -1) {
            const keep = partialTail(buf, OPEN);
            out += keep ? buf.slice(0, -keep) : buf;
            buf = keep ? buf.slice(-keep) : '';
            return out;
          }
          out += buf.slice(0, i);
          buf = buf.slice(i + OPEN.length);
          inside = true;
        }
      }
    },
    // Sisa buffer di akhir stream: kalau masih di dalam <think>, buang.
    flush() {
      const rest = inside ? '' : buf;
      buf = '';
      return rest;
    },
  };
}

/**
 * Streaming chat completion. Menghasilkan { text } dan { finish }.
 */
export async function* streamChat({ model, messages, temperature = 0.9, maxTokens = 2048, signal }) {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${keyFor(model)}` },
    body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens, stream: true }),
    signal,
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => '');
    const err = new Error(`HTTP ${res.status} — ${detail.slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }

  const filter = thinkFilter();
  const decoder = new TextDecoder();
  let buf = '';

  for await (const bytes of res.body) {
    buf += decoder.decode(bytes, { stream: true });
    const frames = buf.split('\n\n');
    buf = frames.pop() ?? '';
    for (const frame of frames) {
      for (const line of frame.split('\n')) {
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (payload === '[DONE]') {
          const tail = filter.flush();
          if (tail) yield { text: tail };
          return;
        }
        let json;
        try {
          json = JSON.parse(payload);
        } catch {
          continue; // frame belum utuh / baris bukan JSON — abaikan
        }
        if (json.error) {
          const err = new Error(json.error.message ?? 'error dari penyedia LLM');
          err.status = Number(json.error.code) || 502;
          throw err;
        }
        const choice = json.choices?.[0];
        if (!choice) continue;
        // `reasoning_content` sengaja diabaikan — itu isi kepala model.
        const text = filter.push(choice.delta?.content ?? '');
        if (text) yield { text };
        if (choice.finish_reason) yield { finish: choice.finish_reason };
      }
    }
  }

  const tail = filter.flush();
  if (tail) yield { text: tail };
}
