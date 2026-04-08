# Python Maze Run 🐍🎮

Sebuah permainan Labirin di mana Anda mengontrol karakter menggunakan kode Python! Belajar dasar-dasar pemrograman Python sambil menyelesaikan tantangan labirin.

## ✨ Fitur Utama
- **Python-Powered**: Jalankan kode Python sungguhan langsung di browser menggunakan Pyodide.
- **Editor Kode**: Editor kode yang kaya fitur (CodeMirror) dengan syntax highlighting.
- **Level Menantang**: Berbagai tingkat kesulitan maze yang harus dipecahkan.
- **Feedback Real-time**: Visualisasi pergerakan karakter berdasarkan perintah Python Anda.
- **UI Modern**: Antarmuka yang bersih dan responsif menggunakan Tailwind CSS dan Shadcn UI.

## 🛠️ Tech Stack
- **Frontend**: [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Python Engine**: [Pyodide](https://pyodide.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Package Manager**: [Bun](https://bun.sh/)
- **Testing**: [Vitest](https://vitest.dev/) & [Playwright](https://playwright.dev/)

## 🚀 Memulai (Local Development)

### Prasyarat
Pastikan Anda sudah menginstal [Bun](https://bun.sh/) di sistem Anda.

### Instalasi
1. Clone repositori:
   ```bash
   git clone https://github.com/username/python-maze-run.git
   cd python-maze-run
   ```

2. Instal dependensi:
   ```bash
   bun install
   ```

3. Jalankan server pengembangan:
   ```bash
   bun run dev
   ```
   Akses di `http://localhost:8080`

### Menjalankan Test
- **Unit Test**: `bun run test`
- **Linting**: `bun run lint`

## 📦 Deployment

Proyek ini dikonfigurasi untuk otomatis deploy ke **GitHub Pages** setiap kali ada push ke branch `main` melalui GitHub Actions.

### Cara Deploy Sendiri:
1. Push kode ke GitHub.
2. Pastikan di **Settings > Pages**, bagian **Source** diset ke **GitHub Actions**.
3. Workflow di `.github/workflows/deploy.yml` akan menangani proses build dan deployment.

## 📄 Lisensi
[MIT](LICENSE) - Silakan gunakan dan modifikasi sesuai kebutuhan!
