# 🍪 Cookies Farm Extension (Advanced Anti-Detect)

Extension Chrome canggih untuk "warm up" profil browser (anti-detect) melalui aktivitas browsing otomatis yang organik. Dirancang khusus untuk kompatibilitas dengan **RPA Tools** (seperti Automa, UI Vision) dan menghindari deteksi bot.

## 🚀 Fitur Utama (New Updates)

### 🛡️ Anti-Detect & Stealth (Level Advanced)
*   **Referrer Spoofing**: Trafik terlihat seolah datang dari Google, Facebook, Twitter, dll (bukan *Direct*).
*   **Human-like Behavior**:
    *   **Smart Clicks**: Cerdas memilih artikel/produk, menghindari tombol Login/Signup.
    *   **Cookie Consent**: Otomatis menekan "Accept" pada banner cookies.
    *   **Pro Typing**: Simulasi mengetik manusia (dengan typo dan koreksi otomatis) di search bar.

### 🤖 RPA Compatible (Safe Mode)
*   **Anti-Close-Other-Tabs**: Extension **TIDAK** akan menutup tab lain (seperti tab RPA dashboard). Farming berjalan di tab baru yg terisolasi.
*   **Anti-Suicide Browser**: Memiliki sistem *fail-safe* untuk mencegah browser menutup sendiri saat tab terakhir selesai farming.
*   **Instant Start**: Mulai seketika tanpa delay dan tanpa menutup tab saat ini.
*   **Auto-Close Protection**: Mencegah browser profile force-close.

### ⚙️ Mekanisme Kerja
*   **Single Cycle**: Berjalan 1 putaran penuh (semua website di list) lalu berhenti otomatis (menghemat resource).
*   **Single Active Tab**: Hanya 1 tab farming yang aktif dalam satu waktu (ringan RAM).

## 📋 Website Target
List website telah dioptimasi untuk menghindari CAPTCHA (Google Search dihapus default).
1.  **YouTube** - Watch video & scroll
2.  **Facebook** - Landing page visit
3.  **Twitter** - Login page visit
4.  **Instagram** - Landing page interactions
5.  **LinkedIn** - Professional profile simulation
6.  **Reddit** - Forum reading
7.  **Amazon** - Product browsing
8.  **Wikipedia** - Deep reading (article scroll)
9.  **GitHub** - Repo browsing

## 🛠️ Cara Install & Pakai

1.  Buka `chrome://extensions/`
2.  Aktifkan **Developer Mode** (pojok kanan atas).
3.  Klik **Load Unpacked**.
4.  Pilih folder extension ini.
5.  Klik icon Cookies Farm -> Klik **Start Farming**.

## 🧩 Integrasi dengan RPA

Jika Anda menggunakan software RPA untuk mengontrol extension ini:
1.  Gunakan selector CSS `#startBtn` untuk menekan tombol Start.
2.  Jangan khawatir tentang tab RPA Anda, extension akan membuka tab baru dan membiarkan tab RPA tetap hidup.
3.  Tunggu hingga status berubah menjadi "Stopped" atau pantau jumlah "Websites Visited" di popup.

## � Statistik & Logs

Extension now supports **Real-Time Statistics**:
*   Pantau jumlah website yang sudah visited langsung di popup.
*   Status "Pending" berubah menjadi "Visited" secara live.
*   Reset statistik kapan saja.

## ⚠️ Disclaimer
Extension ini dibuat untuk tujuan edukasi dan riset automasi browser. Gunakan dengan bijak.

---
**Version**: 2.1.0 (RPA Edition)
**Last Updated**: 2026