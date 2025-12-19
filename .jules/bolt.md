## 2024-05-23 - GPU Instancing Optimization
**Learning:** React Three Fiber's `instancedMesh` is efficient for rendering, but updating matrices in a JS loop (`useFrame`) destroys performance (12k instances/frame = heavy CPU).
**Action:** Move instance animation logic (like wind bending) to the Vertex Shader using `material.onBeforeCompile`. This removes the CPU loop entirely while keeping the visual effect.
