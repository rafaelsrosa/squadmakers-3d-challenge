import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

// --- 1. SCENE SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);
camera.position.set(100, 100, 100);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// --- 2. LIGHTING ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 20, 15);
scene.add(directionalLight);

// --- 3. HELPERS ---
const axesHelper = new THREE.AxesHelper(50);
scene.add(axesHelper);
const gridHelper = new THREE.GridHelper(500, 50); // Increased grid to match model scale
scene.add(gridHelper);

// --- 4. MODEL LOADING & VISIBILITY ---
const loader = new OBJLoader();
let model1: THREE.Object3D | null = null;
let model2: THREE.Object3D | null = null;

const loadModel = (fileName: string, color: number, modelNum: number) => {
  loader.load(`/${fileName}`, (object) => {
    object.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({
          color: color,
          side: THREE.DoubleSide,
        });
      }
    });

    // Centralize the model geometry
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    object.position.sub(center);

    scene.add(object);
    if (modelNum === 1) model1 = object;
    if (modelNum === 2) model2 = object;
    console.log(`${fileName} loaded.`);
  });
};

loadModel('Modelo1.obj', 0x888888, 1); // Grey Model
loadModel('Modelo2.obj', 0x5555ff, 2); // Blue Model

// Visibility Toggles Logic
document.getElementById('toggleModel1')?.addEventListener('change', (e) => {
  if (model1) model1.visible = (e.target as HTMLInputElement).checked;
});
document.getElementById('toggleModel2')?.addEventListener('change', (e) => {
  if (model2) model2.visible = (e.target as HTMLInputElement).checked;
});

// --- 5. ENTITY MANAGEMENT (BLOCK 2) ---
interface Entity {
  id: number;
  mesh: THREE.Mesh;
}
let entities: Entity[] = [];

const updateUIList = () => {
  const listElement = document.getElementById('entityList');
  if (!listElement) return;
  listElement.innerHTML = '';

  entities.forEach((entity, index) => {
    const li = document.createElement('li');
    li.style.cssText =
      'background: #222; margin-bottom: 5px; padding: 8px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #444;';

    const pos = entity.mesh.position;
    li.innerHTML = `
      <span>#${index + 1} (${pos.x}, ${pos.y}, ${pos.z})</span>
      <button onclick="deleteEntity(${
        entity.id
      })" style="background: #ff4444; border: none; color: white; border-radius: 3px; cursor: pointer; padding: 2px 8px; font-weight: bold;">X</button>
    `;
    listElement.appendChild(li);
  });
};

const createPoint = () => {
  const x =
    parseFloat((document.getElementById('posX') as HTMLInputElement).value) ||
    0;
  const y =
    parseFloat((document.getElementById('posY') as HTMLInputElement).value) ||
    0;
  const z =
    parseFloat((document.getElementById('posZ') as HTMLInputElement).value) ||
    0;

  // Sphere size adjusted for visibility against large models
  const geometry = new THREE.SphereGeometry(2, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
    emissiveIntensity: 0.5,
  });
  const sphere = new THREE.Mesh(geometry, material);

  sphere.position.set(x, y, z);
  scene.add(sphere);

  entities.push({ id: Date.now(), mesh: sphere });
  updateUIList();

  // Center camera on new entity
  controls.target.set(x, y, z);
};

// Global delete function for HTML access
(window as any).deleteEntity = (id: number) => {
  const index = entities.findIndex((e) => e.id === id);
  if (index !== -1) {
    scene.remove(entities[index].mesh);
    entities.splice(index, 1);
    updateUIList();
  }
};

document.getElementById('btnCreate')?.addEventListener('click', createPoint);

// --- 6. ANIMATION LOOP ---
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Handle Window Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
