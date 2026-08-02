export const MAX_FILES = 4;
export const MAX_FILE_BYTES = 8 * 1024 * 1024;

// Nilai `format` yang dipahami endpoint OpenAI-compatible. Safari merekam
// audio/mp4, dan format 'mp4' ditolak di sisi Gemini — 'aac' diterima.
const AUDIO_FORMAT = {
  'audio/webm': 'webm',
  'audio/mp4': 'aac',
  'audio/aac': 'aac',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/ogg': 'ogg',
  'audio/flac': 'flac',
};
const ALLOWED_IMAGE = /^image\/(png|jpeg|webp|heic)$/;

/**
 * Lampiran datang dari browser, jadi wajib divalidasi di sini — bukan cuma di UI.
 * Yang tidak lolos dibuang diam-diam; pesannya tetap terkirim tanpa lampiran itu.
 * Hasilnya berupa content block format OpenAI.
 */
export const toParts = (files) =>
  (Array.isArray(files) ? files : [])
    .filter((f) => typeof f?.data === 'string' && f.data.length > 0)
    .filter((f) => ALLOWED_IMAGE.test(f?.mime ?? '') || AUDIO_FORMAT[f?.mime])
    .filter((f) => (f.data.length * 3) / 4 <= MAX_FILE_BYTES) // perkiraan ukuran hasil decode base64
    .slice(0, MAX_FILES)
    .map((f) =>
      ALLOWED_IMAGE.test(f.mime)
        ? { type: 'image_url', image_url: { url: `data:${f.mime};base64,${f.data}` } }
        : { type: 'input_audio', input_audio: { data: f.data, format: AUDIO_FORMAT[f.mime] } }
    );
