import { useEffect, useState } from 'react';

const KEY = 'ptai-history';

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? [];
  } catch {
    return [];
  }
};

// Semua chunk streaming ditempel ke pesan terakhir (bubble AI yang sedang tumbuh)
const appendToLast = (list, text) =>
  list.map((m, i) => (i === list.length - 1 ? { ...m, text: m.text + text } : m));

export default function useChat() {
  const [messages, setMessages] = useState(load);
  const [streaming, setStreaming] = useState(false);
  const [crisis, setCrisis] = useState(false);

  useEffect(() => {
    // base64 lampiran gampang menembus kuota localStorage (~5MB), jadi yang disimpan
    // cuma metadatanya. Lampiran tetap utuh di state selama sesi berjalan, supaya AI
    // masih bisa menjawab pertanyaan lanjutan soal screenshot yang tadi dikirim.
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify(
          messages.map((m) =>
            m.files?.length ? { ...m, files: m.files.map(({ mime, name, kind }) => ({ mime, name, kind })) } : m
          )
        )
      );
    } catch {
      /* kuota penuh — riwayat sesi ini tetap jalan di memori */
    }
  }, [messages]);

  async function send(input, files = []) {
    const text = input.trim();
    if ((!text && files.length === 0) || streaming) return;

    const history = [...messages, { role: 'user', text, files }];
    setMessages([...history, { role: 'model', text: '' }]);
    setStreaming(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      // Rate limit / validasi menjawab JSON biasa, bukan SSE
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setMessages((m) => appendToLast(m, body.error ?? body.message ?? 'Permintaan ditolak server.'));
        return;
      }

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        const frames = buffer.split('\n\n');
        buffer = frames.pop(); // sisa frame yang belum utuh
        for (const frame of frames) {
          if (!frame.startsWith('data: ')) continue;
          const ev = JSON.parse(frame.slice(6));
          if (ev.type === 'crisis') setCrisis(true);
          else if (ev.type === 'chunk') setMessages((m) => appendToLast(m, ev.text));
          else if (ev.type === 'error') setMessages((m) => appendToLast(m, ev.message));
        }
      }
    } catch {
      setMessages((m) =>
        appendToLast(m, 'Koneksi ke server terputus. Pastikan server backend berjalan, lalu coba kirim ulang.')
      );
    } finally {
      setStreaming(false);
    }
  }

  const reset = () => {
    setMessages([]);
    setCrisis(false);
  };

  return { messages, streaming, crisis, send, reset, dismissCrisis: () => setCrisis(false) };
}
