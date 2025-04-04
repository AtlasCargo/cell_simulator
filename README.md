# 🧬 Cell Simulator: Lipid Bilayer Playground

A dual-mode simulation and visualization of a simplified lipid bilayer with embedded proteins.

Built with:
- 🦀 **Rust** backend for physics simulation
- 🌐 **Three.js** frontend for interactive 3D visualization
- 🎛️ UI controls for frame playback
- 💡 Built to extend with live WebSocket streaming, WASM, or full MD engines

---

## 📁 Project Structure

.
├── backend/         # Rust molecular simulation engine
│   ├── src/
│   ├── Cargo.toml
│   └── (Generates .json snapshots)
│
├── frontend/        # Three.js WebGL visualization
│   ├── index.html
│   ├── main.js
│   └── snapshots/   # Auto-filled by backend with frame_00000.json → frame_00059.json

---

## 🚀 How to Run (in StackBlitz or Replit)

### 1. Generate Simulation Frames
```bash
cd backend
cargo run
```

This creates `frontend/snapshots/frame_00000.json` through `frame_00059.json`.

### 2. Open the Frontend Viewer

Navigate to `/frontend/index.html` in StackBlitz and open the preview window.

You’ll see:
- A **3D animated lipid bilayer**
- Embedded **protein channels**
- UI controls: ▶️ / ⏸️ and frame slider

---

## 🧪 Features

- Bi-layer structure with lipid repulsion
- Time-sequenced JSON frame playback
- Embedded static protein channels
- Clean Three.js visuals + user interaction

---

## 🛠️ Next Goals

- 🛰 Live WebSocket mode (simulate + stream directly)
- 🧠 Smarter lipid physics (flip-flop, viscosity)
- 🌀 Curvature + bending simulation
- 💡 WASM backend for in-browser compute
- 🎥 Export scientific-grade renders

---

> Created to simulate life at the molecular edge. Now let’s go deeper.
