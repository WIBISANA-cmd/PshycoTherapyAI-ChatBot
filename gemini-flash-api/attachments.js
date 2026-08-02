export const MAX_FILES = 4;
export const MAX_FILE_BYTES = 8 * 1024 * 1024;

const ALLOWED_MIME = /^(image\/(png|jpeg|webp|heic)|audio\/(webm|mp4|mpeg|aac|wav|ogg|flac))$/;

/**
 * Lampiran datang dari browser, jadi wajib divalidasi di sini — bukan cuma di UI.
 * Yang tidak lolos dibuang diam-diam; pesannya tetap terkirim tanpa lampiran itu.
 */
export const toParts = (files) =>
  (Array.isArray(files) ? files : [])
    .filter((f) => ALLOWED_MIME.test(f?.mime ?? '') && typeof f?.data === 'string' && f.data.length > 0)
    .filter((f) => (f.data.length * 3) / 4 <= MAX_FILE_BYTES) // perkiraan ukuran hasil decode base64
    .slice(0, MAX_FILES)
    .map((f) => ({ inlineData: { mimeType: f.mime, data: f.data } }));
