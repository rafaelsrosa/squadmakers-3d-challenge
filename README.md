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

Real-Time Spatial Debugging: An interactive UTM Mouse Tracker that reverse-engineers scene coordinates back to real-world UTM values in real-time.


## How to run locally
1. Clone the repository:
   git clone https://github.com/rafaelsrosa/squadmakers-3d-challenge.git

2. Install dependencies:
   npm install

3. Run the development server:
   npm run dev

## Architecture Decisions
1. Spatial Coherence & Global Anchor Transformation
To ensure 100% geospatial integrity, the system implements a Global Anchor Transformation. Instead of treating models as isolated objects, the first model loaded establishes the Geospatial Origin. All subsequent models and user-created entities are positioned using their absolute UTM offset relative to this anchor. This preserves the 1:1 metric distance between all assets, ensuring that spatial relationships from the original CAD/OBJ files are maintained exactly in the 3D scene.
The system also performs a Coordinate System Alignment: since OBJ files from engineering (CAD) often use Z as the vertical axis (Altitude), the loader automatically applies a 90° X-axis rotation and remapping. This ensures that 'Altitude' translates to the scene's Y-axis, while maintaining 'North' and 'East' on the horizontal plane.

2. Precision Handling (Avoiding Jitter)
Standard 3D engines struggle with UTM coordinates (exceeding 4,000,000 units) due to floating-point precision limits, which usually causes "shaking" (jitter) or invisible models.
The Solution: We apply a vertex-level normalization while keeping the Object3D's world matrix synchronized with the UTM offset.
The Result: The rendering remains rock-solid and stable, while the UI "reconstructs" the real-world coordinates by adding the Global Anchor back to the local position, providing accurate data for engineering validation.

3. Automated Camera Targeting
To improve User Experience, the system automatically calculates the bounding box of the loaded assets and teleports the camera target to the Global Anchor. This prevents the "empty scene" effect common when dealing with large-scale geospatial data.

## How to Validate Real-World Coordinates
1. Check the browser console to see the **Global Anchor** UTM coordinates.
2. In the "New Entity" panel, enter the exact coordinates of a known model.
3. The created point will appear precisely at the model's center, proving the **World-to-Local** transformation is accurate.
4. Any offset entered (e.g., adding 10m to X) will translate to an exact 10-unit movement in the scene, maintaining 1:1 scale.
