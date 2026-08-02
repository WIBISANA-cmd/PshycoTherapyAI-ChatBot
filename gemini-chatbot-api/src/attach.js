export const MAX_FILES = 4;
export const MAX_BYTES = 8 * 1024 * 1024;
export const MAX_REC_SECONDS = 120;

const OK_IMAGE = ['image/png', 'image/jpeg', 'image/webp', 'image/heic'];

// Gemini menerima webm/opus (Chrome, Firefox) maupun mp4/aac (Safari) apa adanya,
// jadi tidak ada konversi di sisi klien — cukup pilih yang didukung browser ini.
export const pickRecorderMime = () =>
  ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find(
    (t) => window.MediaRecorder?.isTypeSupported(t)
  );

export const dataUrl = (f) => `data:${f.mime};base64,${f.data}`;

export const toAttachment = (blob, name) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca berkas'));
    reader.onload = () =>
      resolve({
        mime: blob.type.split(';')[0], // buang "; codecs=opus"
        data: String(reader.result).split(',')[1],
        name,
        kind: blob.type.startsWith('audio') ? 'audio' : 'image',
      });
    reader.readAsDataURL(blob);
  });

/** Saring berkas dari picker/paste. Balikan: { accepted, error }. */
export function validateImages(list, alreadyCount) {
  const files = [...list].filter((f) => f.type.startsWith('image/'));
  if (files.length === 0) return { accepted: [], error: 'Hanya gambar yang bisa dilampirkan di sini.' };
  if (files.some((f) => !OK_IMAGE.includes(f.type)))
    return { accepted: [], error: 'Format gambar harus PNG, JPG, WEBP, atau HEIC.' };
  if (files.some((f) => f.size > MAX_BYTES))
    return { accepted: [], error: 'Ukuran gambar maksimal 8MB.' };
  if (alreadyCount + files.length > MAX_FILES)
    return { accepted: [], error: `Maksimal ${MAX_FILES} lampiran per pesan.` };
  return { accepted: files, error: '' };
}

export const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
