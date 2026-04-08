# Squadmakers 3D Challenge
Technical challenge developed with Three.js and TypeScript focused on 3D environment manipulation, entity management, and spatial coordinate integrity.

## Tech Stack
Three.js: 3D Engine.
TypeScript: Typed JavaScript for code reliability.
Vite: modern build tool and dev server.
OBJLoader: for handling 3D model assets.

## Features
Block 1: 3D Scene setup with orbital controls, lighting, and a Geospatial Anchor Loader that preserves relative distances between multiple files.
Block 2: Entity management system allowing users to add and remove points with a synchronized UI list, mapping World Coordinates to the scene space.

## How to run locally
1. Clone the repository:
   git clone https://github.com/rafaelsrosa/squadmakers-3d-challenge.git

2. Install dependencies:
   npm install

3. Run the development server:
   npm run dev

## Architecture Decisions
The project follows a modular pattern to decouple the 3D rendering logic from the application state.
Coordinate Transformation Layer: To ensure spatial coherence, the system implements a Global Anchor Offset. Instead of individual centering, the first model loaded sets the scene origin. All subsequent entities and models are transformed relative to this anchor. This preserves the original file's coordinate relationships and prevents floating-point precision issues, ensuring that the UI reflects real-world positions rather than arbitrary local ones.
