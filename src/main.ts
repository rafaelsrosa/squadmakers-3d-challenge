import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

// --- 1. GLOBAL GEOSPATIAL ANCHOR ---
/**
 * To preserve spatial coherence, we store the center of the FIRST loaded model.
 * This acts as our "Global Anchor" (World-to-Local origin).
 */
let globalAnchor: THREE.Vector3 | null = null;

// --- 2. SCENE SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  10000 // Increased far plane for large scale models
);
camera.position.set(150, 150, 150);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// --- 3. LIGHTING ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(100, 200, 150);
scene.add(directionalLight);

// --- 4. HELPERS ---
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);
const gridHelper = new THREE.GridHelper(1000, 100); 
scene.add(gridHelper);

// --- 5. MODEL LOADING & COORDINATE TRANSFORMATION ---
const loader = new OBJLoader();
let model1: THREE.Object3D | null = null;
let model2: THREE.Object3D | null = null;

const loadModel = (fileName: string, color: number, modelNum: number) => {
  loader.load(`/${fileName}`, (object) => {
    object.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshStandardMaterial({
          color: color,
          side: THREE.DoubleSide,
        });
        
        // Ensure bounding box is calculated before centering
        mesh.geometry.computeBoundingBox();
      }
    });

    // A. Calculate the model's center in world coordinates BEFORE normalization
    const box = new THREE.Box3().setFromObject(object);
    const originalCenter = new THREE.Vector3();
    box.getCenter(originalCenter);

    // B. Set the Global Anchor if it's the first model loaded
    if (!globalAnchor) {
      globalAnchor = originalCenter.clone();
      console.log('Global Anchor established at:', globalAnchor);
    }

    // C. GEOMETRY NORMALIZATION
    // Move vertices to (0,0,0) locally so the mesh isn't offset by millions of units.
    // This fixes the "invisible model" issue caused by floating point precision in UTM.
    object.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.geometry.center(); 
      }
    });

    // D. POSITION THE OBJECT IN SCENE SPACE
    // We apply the relative offset between this model and the Global Anchor.
    object.position.set(
      originalCenter.x - globalAnchor.x,
      originalCenter.y - globalAnchor.y,
      originalCenter.z - globalAnchor.z
    );

    scene.add(object);

    if (modelNum === 1) {
      model1 = object;
      // --- AUTO-FOCUS ADJUSTMENT (ZOOM EXTENTS) ---
      // Focus camera on the first model, which sits at (0,0,0) in scene space.
      controls.target.set(0, 0, 0);
      camera.position.set(200, 200, 200); 
      controls.update();
      console.log('Camera auto-focused on Model 1.');
    }
    
    if (modelNum === 2) model2 = object;
    
    console.log(`${fileName} loaded at Scene Pos:`, object.position);
  });
};

loadModel('Modelo1.obj', 0x888888, 1);
loadModel('Modelo2.obj', 0x5555ff, 2);

// --- 6. ENTITY MANAGEMENT (POINT CREATION) ---
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

    // Show transformed "Real World" coordinates to the user
    const pos = entity.mesh.position;
    const worldX = globalAnchor ? (pos.x + globalAnchor.x).toFixed(2) : pos.x;
    const worldY = globalAnchor ? (pos.y + globalAnchor.y).toFixed(2) : pos.y;
    const worldZ = globalAnchor ? (pos.z + globalAnchor.z).toFixed(2) : pos.z;

    li.innerHTML = `
      <span>#${index + 1} World: (${worldX}, ${worldY}, ${worldZ})</span>
      <button onclick="deleteEntity(${entity.id})" style="background: #ff4444; border: none; color: white; border-radius: 3px; cursor: pointer; padding: 2px 8px; font-weight: bold;">X</button>
    `;
    listElement.appendChild(li);
  });
};

const createPoint = () => {
  // User enters "Original/World" coordinates
  const inputX = parseFloat((document.getElementById('posX') as HTMLInputElement).value) || 0;
  const inputY = parseFloat((document.getElementById('posY') as HTMLInputElement).value) || 0;
  const inputZ = parseFloat((document.getElementById('posZ') as HTMLInputElement).value) || 0;

  const geometry = new THREE.SphereGeometry(2, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
    emissiveIntensity: 0.5,
  });
  const sphere = new THREE.Mesh(geometry, material);

  /**
   * MAP USER INPUT TO SCENE SPACE:
   * ScenePos = UserInput (World) - GlobalAnchor
   */
  if (globalAnchor) {
    sphere.position.set(
      inputX - globalAnchor.x,
      inputY - globalAnchor.y,
      inputZ - globalAnchor.z
    );
  } else {
    sphere.position.set(inputX, inputY, inputZ);
  }

  scene.add(sphere);
  entities.push({ id: Date.now(), mesh: sphere });
  updateUIList();

  // Focus camera
  controls.target.set(sphere.position.x, sphere.position.y, sphere.position.z);
};

// Global delete function
(window as any).deleteEntity = (id: number) => {
  const index = entities.findIndex((e) => e.id === id);
  if (index !== -1) {
    scene.remove(entities[index].mesh);
    entities.splice(index, 1);
    updateUIList();
  }
};

// Visibility Toggles Logic
document.getElementById('toggleModel1')?.addEventListener('change', (e) => {
  if (model1) model1.visible = (e.target as HTMLInputElement).checked;
});
document.getElementById('toggleModel2')?.addEventListener('change', (e) => {
  if (model2) model2.visible = (e.target as HTMLInputElement).checked;
});

document.getElementById('btnCreate')?.addEventListener('click', createPoint);

// --- 7. ANIMATION LOOP ---
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
