<div align="center">

# 💙 PshycoTherapyAI

### *Ruang aman untuk bercerita — kapan pun kamu butuh.*

Teman bercerita berbasis AI yang hangat, tidak menghakimi, dan selalu ada.
Ketik, kirim pesan suara, atau tempel screenshot chat — semuanya dipahami.

<br>

![React](https://img.shields.io/badge/React-19-0EA5E9?style=for-the-badge&logo=react&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-38BDF8?style=for-the-badge&logo=express&logoColor=white)
![MiniMax](https://img.shields.io/badge/MiniMax-M2.7_highspeed-7DD3FC?style=for-the-badge&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-BAE6FD?style=for-the-badge&logo=tailwindcss&logoColor=0C4A6E)

<br>

```
╭───────────────────────────────────────────────╮
│  💙  "Halo, aku PshycoTherapyAI.              │
│       Ceritakan apa yang sedang kamu rasakan"  │
╰───────────────────────────────────────────────╯
```

</div>

<br>

## 🌤️ Apa Ini?

Aplikasi chatbot psikoterapi yang dirancang untuk **mendampingi**, bukan menggurui.
Bayangkan seorang teman yang selalu punya waktu untuk mendengarkan, jam berapa pun kamu butuh.

> [!IMPORTANT]
> PshycoTherapyAI **bukan pengganti** psikolog atau psikiater berlisensi.
> Dalam keadaan darurat, hubungi **119 ext. 8** (Layanan Sehat Jiwa Kemenkes) atau **112**.

<br>

## ✨ Yang Bisa Dilakukan

| | Fitur | Ceritanya |
|:---:|---|---|
| 💬 | **Ngobrol biasa** | Jawaban mengalir kata demi kata, terasa seperti diketik sungguhan |
| 🎙️ | **Pesan suara** | Rekam langsung dari browser. AI mendengar *isi* sekaligus *nada* suaramu — kalau terdengar berat, dia akan mengakuinya |
| 🖼️ | **Screenshot chat** | Tempel dengan `Ctrl/Cmd + V`. AI membaca dinamika percakapannya, bukan menghakimi lawan bicaramu |
| 🧠 | **Ingat konteks** | Tanya lanjutan soal screenshot tadi? Masih nyambung |
| 🤝 | **Jaring pengaman** | Terdeteksi tanda bahaya → nomor bantuan langsung muncul, lewat teks maupun suara |
| 🔒 | **Tanpa akun** | Tidak ada login, tidak ada database. Ceritamu tidak disimpan di server |
| 🎨 | **Sky blue & lembut** | Animasi halus, responsif dari HP sampai desktop, ramah pembaca layar |

<br>

## 🚀 Jalankan dalam 3 Menit

### 1️⃣ Siapkan kunci API

Buat file `gemini-flash-api/.env`:

```ini
API_KEY_AI=sk-kunci_model_teks
BASE_URL_AI=https://ai.sumopod.com/v1
MODEL_AI=MiniMax-M2.7-highspeed

MODEL_AI_MULTIMODAL=gemini/gemini-3.1-flash-lite
API_KEY_AI_MULTIMODAL=sk-kunci_model_gambar_suara
```

> 🔑 `MODEL_AI` hanya memproses teks; pesan dengan screenshot atau suara otomatis dialihkan ke `MODEL_AI_MULTIMODAL`, yang dipanggil pakai kuncinya sendiri (`API_KEY_AI_MULTIMODAL`) — kuota/paketnya terpisah dari model teks. Kedua kunci **hanya hidup di server** — tidak pernah sampai ke browser.

### 2️⃣ Nyalakan backend

```bash
cd gemini-flash-api
npm install
npm run dev
```

✅ `server ready on http://localhost:3000`

### 3️⃣ Nyalakan frontend

Buka terminal **baru**:

```bash
cd gemini-chatbot-api
npm install
npm run dev
```

🎉 Buka **http://localhost:5173** — selamat bercerita!

<br>

## 🚢 Mau Deploy?

Ada Dockerfile siap pakai dan panduan lengkap Dokploy langkah demi langkah:

### 👉 **[Baca DEPLOY.md](DEPLOY.md)**

```bash
docker build -t pshycotherapy .
docker run --rm -p 3000:3000 \
  -e API_KEY_AI=kunci_model_teks \
  -e BASE_URL_AI=https://ai.sumopod.com/v1 \
  -e MODEL_AI=MiniMax-M2.7-highspeed \
  -e MODEL_AI_MULTIMODAL=gemini/gemini-3.1-flash-lite \
  -e API_KEY_AI_MULTIMODAL=kunci_model_gambar_suara \
  pshycotherapy
```

Di produksi keduanya menyatu jadi **satu container**: Express melayani API sekaligus
hasil build React. Satu domain, tanpa CORS, tanpa proxy.

<br>

## 📁 Isi Proyek

```
hcktiv8id/
│
├── 🐳 Dockerfile                 build 2 tahap → satu image produksi
├── 📘 DEPLOY.md                  panduan deploy ke Dokploy
│
├── 🧠 gemini-flash-api/          BACKEND — Express + LLM OpenAI-compatible
│   ├── index.js                  server, endpoint chat, streaming
│   ├── llm.js                    klien LLM OpenAI-compatible + filter <think>
│   ├── prompt.js                 kepribadian & batasan AI
│   ├── attachments.js            penjaga gerbang lampiran
│   ├── test.js                   self-check (npm test)
│   ├── .env.example              contoh isian environment
│   └── .env                      🔐 kunci API (jangan di-commit)
│
└── 💙 gemini-chatbot-api/        FRONTEND — React + Tailwind
    ├── vite.config.js            proxy /api → backend
    └── src/
        ├── App.jsx               rangka halaman
        ├── useChat.js            otak percakapan
        ├── attach.js             pengurus lampiran
        └── components/
            ├── Welcome.jsx       layar sambutan
            ├── MessageList.jsx   daftar percakapan
            ├── Bubble.jsx        gelembung pesan
            ├── Composer.jsx      kotak ketik + lampiran
            ├── Recorder.jsx      perekam suara
            ├── Typing.jsx        titik-titik "sedang mengetik"
            └── CrisisBanner.jsx  banner bantuan darurat
```

<br>

## 🎈 Cara Pakai Fitur Serunya

<table>
<tr><td width="50%" valign="top">

### 🎙️ Kirim pesan suara

1. Klik ikon **mikrofon**
2. Izinkan akses mikrofon
3. Cerita saja — timer berjalan
4. Klik **Selesai** → **Kirim**

*Maksimal 2 menit. Kalau berubah pikiran, klik **Batal**.*

</td><td width="50%" valign="top">

### 🖼️ Kirim screenshot chat

1. Potret layar (`Cmd+Shift+4` / `Win+Shift+S`)
2. Klik kotak ketik
3. Tempel: `Ctrl/Cmd + V`
4. Tambahkan konteks → **Kirim**

*Atau klik ikon klip. Maksimal 4 lampiran, 8MB masing-masing.*

</td></tr>
</table>

<br>

## 🔌 API

| Method | Endpoint | Fungsi |
|---|---|---|
| `GET` | `/api/health` | Cek server hidup |
| `POST` | `/api/chat` | Kirim percakapan, terima balasan streaming (SSE) |

<details>
<summary><b>📬 Contoh isi permintaan</b></summary>

<br>

```jsonc
{
  "messages": [
    {
      "role": "user",
      "text": "ini chatku sama pacarku semalam",
      "files": [
        { "mime": "image/png", "data": "iVBORw0KG..." }  // base64
      ]
    }
  ]
}
```

Balasannya berupa aliran SSE:

```
data: {"type":"crisis"}                    ← hanya jika terdeteksi tanda bahaya
data: {"type":"chunk","text":"Melihat "}
data: {"type":"chunk","text":"percakapan ini…"}
data: {"type":"done"}
```

**Batasan bawaan:** 20 permintaan/menit · 20 pesan terakhir sebagai konteks · 4 lampiran · 8MB per berkas.

</details>

<br>

## 🛡️ Cara Kami Menjaga

Aplikasi ini menyentuh orang dalam kondisi rentan, jadi ada beberapa hal yang **tidak** dipangkas:

- 🚨 **Deteksi krisis dua lapis** — pola kata pada teks, **plus** penyaringan balasan AI (supaya risiko yang disampaikan lewat suara atau gambar tetap tertangkap)
- 🙅 **AI dilarang** mendiagnosis, menyebut nama obat, menjanjikan kesembuhan, atau melabeli orang di screenshot sebagai "toxic"
- 🎯 **Fokus terkunci** — pertanyaan di luar kesehatan mental (coding, PR sekolah, politik) ditolak dengan hangat, termasuk jika dikirim sebagai gambar
- 🔐 **Nol penyimpanan server** — riwayat hanya ada di browsermu; lampiran bahkan tidak ikut tersimpan
- ♿ **Ramah semua orang** — pembaca layar, navigasi keyboard, dan `prefers-reduced-motion` dihormati

<br>

## 🧪 Cek Kesehatan Kode

```bash
cd gemini-flash-api && npm test        # deteksi krisis, parser SSE, validasi lampiran, filter <think>
cd gemini-chatbot-api && npm run build # pastikan frontend ter-build bersih
```

<br>

## 🩹 Kalau Ada Masalah

<details>
<summary><b>❓ Jawaban AI terpotong di tengah kalimat</b></summary>

<br>

Sudah diperbaiki, tapi ini penyebabnya kalau kamu mengutak-atik lagi:

`MiniMax-M2.7-highspeed` adalah *thinking model*, dan penalarannya ikut memakan jatah token.
Kalau `maxTokens` terlalu pas-pasan, balasannya kepotong sebelum sempat selesai.

Kuncinya ada di [`index.js`](gemini-flash-api/index.js):

```js
maxTokens: 3072,
```

Penalarannya dikirim sebagai blok `<think>…</think>` di dalam stream. Blok itu disaring di
[`llm.js`](gemini-flash-api/llm.js) (`thinkFilter`) supaya isi kepala model tidak muncul di layar —
termasuk saat tagnya terbelah antar-chunk SSE.

</details>

<details>
<summary><b>❓ Mikrofon tidak bisa dipakai</b></summary>

<br>

Browser hanya mengizinkan mikrofon di `localhost` atau `https`. Kalau membuka lewat alamat IP (`192.168.x.x`), izin akan ditolak.
Cek juga ikon gembok di address bar → **Izin situs** → **Mikrofon**.

</details>

<details>
<summary><b>❓ Pesan "Koneksi ke server terputus"</b></summary>

<br>

Backend belum jalan. Cek dengan:

```bash
curl localhost:3000/api/health
```

Harusnya membalas `{"ok":true,"model":"MiniMax-M2.7-highspeed","modelMultimodal":"gemini/gemini-3.1-flash-lite"}`.

</details>

<details>
<summary><b>❓ Muncul "Layanan sedang padat"</b></summary>

<br>

Kuota/saldo di penyedia LLM sedang habis, atau kamu menembus batas 20 permintaan per menit dari rate limit server. Tunggu sebentar lalu coba lagi.

</details>

<br>

---

<div align="center">

### 🌈

**Kamu tidak sendirian.**

Kalau bebannya terasa terlalu berat, tolong hubungi orang sungguhan —
**119 ext. 8** · **112** · atau satu orang yang kamu percaya, hari ini juga.

<br>

*Dibuat dengan 💙 untuk siapa pun yang butuh didengarkan.*

</div>
