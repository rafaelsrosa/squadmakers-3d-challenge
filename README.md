# Squadmakers 3D Challenge

Technical challenge developed with Three.js and TypeScript focused on 3D environment manipulation and entity management.

## Tech Stack
- Three.js: 3D Engine.
- TypeScript: Typed JavaScript for code reliability.
- Vite: modern build tool and dev server.
- OBJLoader: for handling 3D model assets.

## Features
- Block 1: 3D Scene setup with orbital controls, lighting, and a 3D model (OBJ) loader with automatic centering.
- Block 2: Entity management system allowing users to add and remove points with a synchronized UI list.

## How to run locally
1. Clone the repository:
   ```bash
   git clone [https://github.com/rafaelsrosa/squadmakers-3d-challenge.git](https://github.com/rafaelsrosa/squadmakers-3d-challenge.git)

2. Install dependencies:
   npm install

3. Run the development server:
   npm run dev

## Architecture Decisions
The project follows a modular pattern to decouple the 3D rendering logic from the application state. The Scene Manager handles the Three.js lifecycle, while a separate state logic manages the entity list, ensuring that any UI action is properly reflected in the 3D environment and vice-versa.
