<div align="center">

# 🚢 Deploy PshycoTherapyAI ke Dokploy

*Panduan lengkap dari nol sampai aplikasi hidup di domainmu.*

</div>

---

## ⚠️ Baca Ini Dulu — Kuota Gemini

Saat pengujian, kunci API kamu mengembalikan error ini:

```
Quota exceeded — generate_content_free_tier_requests
limit: 20, model: gemini-3.6-flash
```

**Free tier Gemini hanya memberi 20 request per hari per model.** Untuk chatbot yang dipakai
orang lain, itu habis dalam hitungan menit. Aplikasinya akan tetap hidup dan tidak crash
(pengguna melihat pesan *"Layanan sedang padat"*), tapi praktis tidak bisa dipakai.

> ✅ **Sebelum deploy:** aktifkan billing di [Google AI Studio](https://aistudio.google.com/apikey) →
> pilih project → **Set up Billing**. Batasnya langsung naik drastis dan kamu hanya membayar
> pemakaian nyata. Model `gemini-3.6-flash` termasuk yang paling murah.

---

## 🧱 Bentuk Produksinya

Berbeda dengan development yang menjalankan dua server, produksi memakai **satu container**:

```
                    ┌──────────────────────────────┐
   Pengunjung ──▶   │  Traefik (bawaan Dokploy)    │  🔒 HTTPS otomatis
                    └──────────────┬───────────────┘
                                   │  :3000
                    ┌──────────────▼───────────────┐
                    │   Container PshycoTherapyAI  │
                    │                              │
                    │   Express                    │
                    │    ├─ /api/chat, /api/health │
                    │    └─ / → hasil build React  │
                    └──────────────┬───────────────┘
                                   │
                            🔑 Gemini API
```

**Kenapa satu container?** Satu domain, tanpa CORS, tanpa konfigurasi proxy, tanpa
variabel URL backend di frontend. Lebih sedikit yang bisa salah.

---

## 📋 Yang Perlu Disiapkan

| | Kebutuhan |
|---|---|
| 🖥️ | VPS dengan Dokploy terpasang (minimal 2GB RAM — build Vite butuh memori) |
| 🌐 | Domain/subdomain yang **A record**-nya sudah mengarah ke IP VPS |
| 🔑 | `GEMINI_API_KEY` yang **billing-nya sudah aktif** (lihat peringatan di atas) |
| 📦 | Repository Git (GitHub/GitLab) berisi project ini |

---

## 1️⃣ Push ke Git

Repo-nya sudah siap dan terhubung ke
[`WIBISANA-cmd/PshycoTherapyAI-ChatBot`](https://github.com/WIBISANA-cmd/PshycoTherapyAI-ChatBot),
jadi tinggal kirim berkas deployment yang baru:

```bash
git add .
git commit -m "tambah Dockerfile dan setup deploy Dokploy"
git push
```

> 🔐 **Sudah diperiksa:** `.env` tidak pernah masuk ke git dan tetap terabaikan,
> `node_modules` bersih, dan kedua `package-lock.json` ikut ter-track (wajib untuk `npm ci`).
> Kalau ragu, jalankan `git ls-files | grep .env` — harus kosong.

---

## 2️⃣ Buat Application di Dokploy

1. Login ke panel Dokploy
2. **Create Project** → beri nama, misal `pshycotherapy`
3. Di dalam project → **Create Service** → pilih **Application**
4. Beri nama, misal `web`

---

## 3️⃣ Sambungkan Repository

Buka tab **General** pada application tadi:

| Isian | Nilai |
|---|---|
| Source Type | **GitHub** (kalau sudah connect) atau **Git** |
| Repository | `WIBISANA-cmd/PshycoTherapyAI-ChatBot` |
| Branch | `main` |

---

## 4️⃣ Pilih Build Type: Dockerfile

Masih di tab **General**, bagian **Build Type**:

| Isian | Nilai |
|---|---|
| Build Type | **Dockerfile** |
| Docker File | `Dockerfile` |
| Docker Context Path | `.` |

> ⚠️ **Context harus `.` (root repo), bukan salah satu subfolder.**
> Dockerfile ini menyalin dari `gemini-chatbot-api/` **dan** `gemini-flash-api/`,
> jadi ia butuh melihat keduanya.

---

## 5️⃣ Isi Environment Variables

Buka tab **Environment**, tempel ini:

```ini
GEMINI_API_KEY=isi_kunci_aslimu_di_sini
PORT=3000
TRUST_PROXY=1
NODE_ENV=production
```

<table>
<tr><th>Variabel</th><th>Kenapa penting</th></tr>
<tr><td><code>GEMINI_API_KEY</code></td><td>Tanpa ini container <b>sengaja gagal start</b> dengan pesan jelas di log — bukan hidup lalu error diam-diam</td></tr>
<tr><td><code>TRUST_PROXY=1</code></td><td><b>Wajib.</b> Di balik Traefik, semua request terlihat berasal dari satu IP proxy. Tanpa ini rate limit 20/menit berlaku untuk <i>seluruh pengunjung digabung</i> — satu orang aktif memblokir semua orang</td></tr>
<tr><td><code>PORT</code></td><td>Harus sama dengan port yang diisi di Domain (langkah berikutnya)</td></tr>
</table>

---

## 6️⃣ Pasang Domain & HTTPS

Buka tab **Domains** → **Add Domain**:

| Isian | Nilai |
|---|---|
| Host | `therapy.domainmu.com` |
| Path | `/` |
| Container Port | `3000` |
| HTTPS | ✅ aktifkan |
| Certificate | **Let's Encrypt** |

> 🎙️ **HTTPS bukan opsional di sini.** Browser hanya mengizinkan akses **mikrofon** di
> `localhost` atau `https`. Tanpa sertifikat, fitur voice note mati total.

---

## 7️⃣ Deploy

Klik **Deploy**. Build pertama sekitar 2–4 menit (Vite dan npm install jalan dari nol).

Pantau di tab **Deployments** → **View Logs**. Yang seharusnya terlihat:

```
=> [web 4/5] RUN npm ci
=> [web 5/5] RUN npm run build
=> ✓ built in 1.2s
=> [runtime 3/4] RUN npm ci --omit=dev
=> exporting layers
```

Lalu di tab **Logs** container:

```
server ready on port 3000 (menyajikan frontend juga)
```

Kalimat **"(menyajikan frontend juga)"** adalah penanda bahwa hasil build React
berhasil masuk ke container. Kalau kalimat itu tidak muncul, frontend gagal ter-copy.

---

## 8️⃣ Verifikasi

```bash
# 1. API hidup?
curl https://therapy.domainmu.com/api/health
# → {"ok":true,"model":"gemini-3.6-flash"}

# 2. Halaman tersaji?
curl -s https://therapy.domainmu.com | grep -o "<title>.*</title>"
# → <title>PshycoTherapyAI — Teman Bercerita</title>

# 3. Chat jalan?
curl -N -X POST https://therapy.domainmu.com/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","text":"halo"}]}'
# → data: {"type":"chunk","text":"Halo! ..."}
```

Lalu buka di browser dan cek satu per satu:

- [ ] Layar sambutan muncul dengan 4 kartu quick prompt
- [ ] Kirim pesan → balasan mengalir kata demi kata
- [ ] Klik ikon mikrofon → browser meminta izin (bukti HTTPS jalan)
- [ ] Tempel screenshot dengan `Ctrl/Cmd + V` → pratinjau muncul
- [ ] Refresh halaman → riwayat chat masih ada
- [ ] Buka URL acak seperti `/apa-saja` → tetap membuka aplikasi, bukan 404

---

## 🩹 Kalau Gagal

<details>
<summary><b>❌ Build gagal: "npm ci can only install with an existing package-lock.json"</b></summary>

<br>

Lockfile tidak ikut ter-push. Cek `.gitignore` tidak memblokir `package-lock.json`, lalu:

```bash
git add -f gemini-flash-api/package-lock.json gemini-chatbot-api/package-lock.json
git commit -m "sertakan lockfile" && git push
```

</details>

<details>
<summary><b>❌ Build gagal: "COPY gemini-chatbot-api/package.json: not found"</b></summary>

<br>

**Docker Context Path** salah. Harus `.` (root repo), bukan `gemini-flash-api` atau
`gemini-chatbot-api`. Perbaiki di tab General lalu deploy ulang.

</details>

<details>
<summary><b>❌ Container langsung mati: "GEMINI_API_KEY belum diset"</b></summary>

<br>

Ini memang disengaja. Isi variabelnya di tab **Environment** lalu **Redeploy**.
Perhatikan: menyimpan environment saja tidak cukup — harus deploy ulang.

</details>

<details>
<summary><b>❌ Build kehabisan memori / terhenti di "RUN npm run build"</b></summary>

<br>

VPS 1GB biasanya tidak kuat mem-build Vite. Solusi tercepat: tambah swap di VPS.

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

</details>

<details>
<summary><b>❌ Halaman putih / 502 Bad Gateway</b></summary>

<br>

Port tidak cocok. **Container Port** di tab Domains harus `3000`, dan variabel `PORT`
juga `3000`. Cek juga tab Logs — kalau container restart terus, penyebabnya ada di sana.

</details>

<details>
<summary><b>❌ Mikrofon tidak muncul izinnya</b></summary>

<br>

Situs belum HTTPS, atau diakses lewat IP mentah. Browser memblokir `getUserMedia`
di luar `localhost`/`https`. Aktifkan Let's Encrypt di tab Domains dan akses lewat nama domain.

</details>

<details>
<summary><b>❌ Semua pengguna kena "Terlalu banyak permintaan"</b></summary>

<br>

`TRUST_PROXY=1` belum diisi. Tanpa itu semua pengunjung terhitung sebagai satu IP
(IP internal Traefik), jadi jatah 20 request/menit dibagi ramai-ramai.

</details>

<details>
<summary><b>❌ "Layanan sedang padat" terus-menerus</b></summary>

<br>

Kuota Gemini, bukan bug. Lihat peringatan di paling atas dokumen ini — aktifkan billing.
Cek pemakaianmu di [ai.dev/rate-limit](https://ai.dev/rate-limit).

</details>

---

## 🔄 Update Setelah Deploy

```bash
git add . && git commit -m "perubahan baru" && git push
```

Lalu klik **Redeploy** di Dokploy. Ingin otomatis setiap push? Aktifkan **Auto Deploy**
di tab General dan pasang webhook yang disediakan Dokploy ke repository-mu.

---

## 🧪 Uji Image Secara Lokal

Image ini **sudah dibangun dan dijalankan di laptop ini**, jadi kamu tidak perlu menebak.
Hasilnya:

| Yang diuji | Hasil |
|---|---|
| `docker build` | ✅ sukses dalam 48 detik, image **282MB** |
| Container start | ✅ `server ready on port 3000 (menyajikan frontend juga)` |
| `GET /` | ✅ halaman React tersaji |
| `GET /sesi/apa-saja` | ✅ status 200 — SPA fallback jalan |
| `GET /api/health` | ✅ `{"ok":true,"model":"gemini-3.6-flash"}` |
| Aset ber-hash | ✅ `Cache-Control: public, max-age=31536000` |
| HEALTHCHECK Docker | ✅ `healthy` dalam 10 detik |
| User container | ✅ `node`, bukan root |
| Kebocoran `.env` | ✅ tidak ada `.env` di dalam image |
| Tanpa `GEMINI_API_KEY` | ✅ berhenti dengan pesan jelas, exit code 1 |

Mengulanginya sendiri, dari root project:

```bash
docker build -t pshycotherapy .
docker run --rm -p 3000:3000 -e GEMINI_API_KEY=kuncimu pshycotherapy
```

Buka http://localhost:3000 — tampilannya persis seperti hasil deploy nanti.

> 💡 **macOS tanpa Docker Desktop?** Cukup `brew install colima` lalu
> `colima start --cpu 2 --memory 4`. Hentikan dengan `colima stop` kalau sudah selesai.

---

<div align="center">

**Selamat, aplikasimu sudah bisa menemani orang yang butuh didengarkan. 💙**

</div>
