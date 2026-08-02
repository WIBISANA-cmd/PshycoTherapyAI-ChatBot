// Foto asli dari Unsplash (lisensi bebas pakai, termasuk komersial).
// Setiap ID sudah diverifikasi 200 OK + dicek isinya secara visual.
const u = (id, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=${w}`;

export const img = {
  // Hero — potret tenang, pencahayaan biru/ungu, selaras palet sky app
  heroMain: u('1534528741775-53994a69daeb', 900),
  heroSide: u('1517841905240-472988babdf9', 700), // hoodie, dinding biru
  heroSmall: u('1531746020798-e6953c6e8e04', 600), // close-up wajah, latar peach

  night: u('1465101046530-73398c7f28ca', 1600), // milky way — "jam 3 pagi"
  bridge: u('1447752875215-b2761acb3c5d', 1400), // jembatan kayu ke hutan
  mist: u('1470071459604-3b5ec3a7fe05', 1400), // gunung berkabut

  // Fitur
  featTalk: u('1524504388940-b1c1722653e1', 900), // potret moody
  featVoice: u('1607746882042-944635dfe10e', 900), // potret, latar gelap
  featImage: u('1517842645767-c639042777db', 900), // buku catatan + kacamata
  featSafety: u('1528716321680-815a8cdb8cbe', 900), // papan "difficult roads…"

  // Cara kerja
  step1: u('1484480974693-6ca0a78fb36b', 1000), // tangan menulis di buku
  step2: u('1506126613408-eca07ce68773', 1000), // meditasi saat matahari terbenam
  step3: u('1519834785169-98be25ec3f84', 1000), // duduk di tebing, senja

  mindful: u('1499728603263-13726abce5fd', 1000), // tulisan "mindfulness"
  hope: u('1499209974431-9dddcece7f88', 1400), // tangan terbuka ke matahari
};

export const faces = [
  { src: u('1494790108377-be9c29b29330', 240), name: 'Rani', age: 24, city: 'Bandung' },
  { src: u('1500648767791-00dcc994a43e', 240), name: 'Bagas', age: 27, city: 'Surabaya' },
  { src: u('1580489944761-15a19d654956', 240), name: 'Tiara', age: 21, city: 'Depok' },
  { src: u('1633332755192-727a05c4013d', 240), name: 'Aldi', age: 30, city: 'Makassar' },
  { src: u('1573497019940-1c28c88b4f3e', 240), name: 'Sekar', age: 26, city: 'Yogyakarta' },
  { src: u('1552058544-f2b08422138a', 240), name: 'Damar', age: 33, city: 'Semarang' },
];
