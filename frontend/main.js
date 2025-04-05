import * as THREE from "https://unpkg.com/three@0.152.2/build/three.module.js";
import { OrbitControls } from "./lib/OrbitControls.legacy.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.style.margin = 0;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement, THREE);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'f') toggleFullscreen();
});

function toggleFullscreen() {
  const canvas = renderer.domElement;
  if (!document.fullscreenElement) {
    canvas.requestFullscreen().catch(err => {
      alert(`Error attempting to enable full-screen mode: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
}

const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(10, 10, 10);
scene.add(light);

const geometry = new THREE.SphereGeometry(0.1, 16, 16);
const material = new THREE.MeshPhongMaterial({ color: 0x33ccff });
const proteinMaterial = new THREE.MeshPhongMaterial({ color: 0xff3366 });

let lipidMeshes = [];
let proteinMeshes = [];
let frameIndex = 0;
let frameData = [];

const TOTAL_FRAMES = 60;

function loadAllFrames() {
  console.log("loadAllFrames() starting...");
  let promises = [];
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const path = `snapshots/frame_${String(i).padStart(5, "0")}.json`;
    console.log("Requesting:", path);
    promises.push(
      fetch(path)
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
          return res.json();
        })
        .catch((err) => {
          console.error("Fetch error:", err);
        }),
    );
  }

  Promise.all(promises)
    .then((frames) => {
      console.log("Frames loaded ✅", frames.length);
      if (!frames[0] || !frames[0].lipids) {
        console.error("First frame is empty or malformed:", frames[0]);
        return;
      }

      frameData = frames;
      initLipids(frameData[0].lipids.length);
      initProteins(frameData[0]);
      animate();
    })
    .catch((err) => {
      console.error("Failed to load all frames:", err);
    });
}

function initLipids(count) {
  console.log("Initializing lipids:", count);
  for (let i = 0; i < count; i++) {
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    lipidMeshes.push(mesh);
  }
}

function initProteins(data) {
  const proteins = data.proteins || [];
  console.log("Initializing proteins:", proteins.length);

  proteins.forEach(([pos, radius]) => {
    const geometry = new THREE.SphereGeometry(radius, 16, 16);
    const mesh = new THREE.Mesh(geometry, proteinMaterial);
    mesh.position.set(...pos);
    scene.add(mesh);
    proteinMeshes.push(mesh);
  });
}

function updateFrame(index) {
  if (!frameData[index]) return;
  frameData[index].lipids.forEach((pos, i) => {
    lipidMeshes[i].position.set(...pos);
  });
}

const playBtn = document.getElementById("playBtn");
const slider = document.getElementById("frameSlider");

let playing = true;

playBtn.addEventListener("click", () => {
  playing = !playing;
  playBtn.textContent = playing ? "▶️" : "⏸️";
});

slider.addEventListener("input", () => {
  frameIndex = parseInt(slider.value);
  updateFrame(frameIndex);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);

  if (playing) {
    updateFrame(frameIndex);
    slider.value = frameIndex;
    frameIndex = (frameIndex + 1) % TOTAL_FRAMES;
  }
}

loadAllFrames();