# Squadmakers 3D Challenge
Technical challenge developed with Three.js and TypeScript focused on 3D environment manipulation, entity management, and spatial coordinate integrity.

## Tech Stack
Three.js: 3D Engine.
TypeScript: Typed JavaScript for code reliability.
Vite: modern build tool and dev server.
OBJLoader: for handling 3D model assets.

## Features
Block 1: 3D Scene setup with orbital controls, lighting, and a Geospatial Anchor Loader.
Block 2: Entity management system with a synchronized UI list, mapping Real-World UTM Coordinates to the scene space.
UX Enhancement: Automatic "Zoom Extents" focus on model load to handle large-scale offsets.

## How to run locally
1. Clone the repository:
   git clone https://github.com/rafaelsrosa/squadmakers-3d-challenge.git

2. Install dependencies:
   npm install

3. Run the development server:
   npm run dev

## Architecture Decisions
1. Spatial Coherence & Global Anchor
To preserve spatial coherence, the system implements a Global Anchor Offset. Instead of individual centering (which destroys relative distances), the first model loaded sets the World-to-Local origin.

2. Geometry Normalization (Precision Handling)
Since the provided models use UTM Coordinates (with values exceeding 4,000,000 units), rendering them directly would cause "Floating Point Jitter" and visibility issues.
The Solution: We normalize the geometry by centering meshes locally and applying the offset at the Object3D level.
The Result: This ensures the engine renders with high precision while the UI still reflects the accurate real-world coordinates required for engineering tasks.

3. Automated Camera Targeting
To improve User Experience, the system automatically calculates the bounding box of the loaded assets and teleports the camera target to the Global Anchor. This prevents the "empty scene" effect common when dealing with large-scale geospatial data.
