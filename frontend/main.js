import * as THREE from 'https://cdn.skypack.dev/three@0.152.2';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.152.2/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// Lighting
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
  let promises = [];
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const path = `snapshots/frame_${String(i).padStart(5, '0')}.json`;
    promises.push(fetch(path).then(res => res.json()));
  }

  Promise.all(promises).then(frames => {
    frameData = frames;
    initLipids(frameData[0].lipids.length);
    initProteins(frameData[0]);
    animate();
  });
}

function initLipids(count) {
  for (let i = 0; i < count; i++) {
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    lipidMeshes.push(mesh);
  }
}

function initProteins(data) {
  const proteins = data.proteins;
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

const playBtn = document.getElementById('playBtn');
const slider = document.getElementById('frameSlider');

let playing = true;

playBtn.addEventListener('click', () => {
  playing = !playing;
  playBtn.textContent = playing ? '▶️' : '⏸️';
});

slider.addEventListener('input', () => {
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
