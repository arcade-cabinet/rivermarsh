/**
 * GPU-Driven Instancing System
 * 
 * Uses GPU vertex shaders for instance animation (wind) and LOD,
 * removing heavy CPU overhead from the main loop.
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { fbm, getBiomeAt, BiomeData } from '../utils/sdf';

// =============================================================================
// SHADER CHUNKS
// =============================================================================

const windShaderChunk = `
  uniform float uTime;
  uniform float uWindStrength;
  uniform float uLodDistance;
  uniform vec3 uCameraPos;
  uniform bool uEnableWind;

  // Simple pseudo-random noise
  float hash(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * .1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
  }

  float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void applyWind(inout vec3 position, vec3 instancePos) {
      if (!uEnableWind) return;

      // Calculate wind based on instance position and time
      // Use instancePos.xz to keep wind consistent per instance
      float windPhase = uTime * 2.0 + instancePos.x * 0.1 + instancePos.z * 0.1;
      float windNoiseVal = noise(instancePos.xz * 0.05 + uTime * 0.1);

      // Bend amount increases with height (y)
      // Assuming pivot is at y=0
      float heightFactor = max(0.0, position.y);

      float bendAngle = sin(windPhase) * uWindStrength * 0.5 * (0.5 + 0.5 * windNoiseVal);

      // Simple shear displacement in local space
      // Note: This rotates with the instance, giving "noisy" wind direction
      position.x += bendAngle * heightFactor;
      position.z += cos(windPhase * 0.7) * uWindStrength * 0.2 * heightFactor;
  }
`;

// =============================================================================
// DATA GENERATION (CPU)
// =============================================================================

interface InstanceData {
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
}

function generateInstanceData(
    count: number,
    areaSize: number,
    heightFunc: (x: number, z: number) => number,
    biomes: BiomeData[],
    allowedBiomes: string[]
): InstanceData[] {
    const instances: InstanceData[] = [];
    
    let attempts = 0;
    const maxAttempts = count * 10;
    
    while (instances.length < count && attempts < maxAttempts) {
        attempts++;
        
        // Random position
        const x = (Math.random() - 0.5) * areaSize;
        const z = (Math.random() - 0.5) * areaSize;
        
        // Check biome
        const biome = getBiomeAt(x, z, biomes);
        if (!allowedBiomes.includes(biome.type)) continue;
        
        // Get terrain height
        const y = heightFunc(x, z);
        
        // Skip underwater
        if (y < 0) continue;
        
        // Add some clustering using noise
        const densityNoise = fbm(x * 0.05, 0, z * 0.05, 2);
        if (Math.random() > densityNoise * 1.5) continue;
        
        // Random rotation and scale
        const rotation = new THREE.Euler(
            (Math.random() - 0.5) * 0.2,
            Math.random() * Math.PI * 2,
            (Math.random() - 0.5) * 0.2
        );
        
        const baseScale = 0.8 + Math.random() * 0.4;
        const scale = new THREE.Vector3(baseScale, baseScale, baseScale);
        
        instances.push({
            position: new THREE.Vector3(x, y, z),
            rotation,
            scale
        });
    }
    
    return instances;
}

// =============================================================================
// INSTANCED MESH COMPONENT
// =============================================================================

interface GPUInstancedMeshProps {
    geometry: THREE.BufferGeometry;
    material: THREE.Material;
    count: number;
    instances: InstanceData[];
    enableWind?: boolean;
    windStrength?: number;
    lodDistance?: number;
    frustumCulled?: boolean;
    castShadow?: boolean;
    receiveShadow?: boolean;
}

export function GPUInstancedMesh({
    geometry,
    material,
    count,
    instances,
    enableWind = true,
    windStrength = 0.5,
    lodDistance = 100,
    frustumCulled = true,
    castShadow = true,
    receiveShadow = true
}: GPUInstancedMeshProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const materialRef = useRef<THREE.Material>(material);
    
    // Stable uniforms object
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uWindStrength: { value: windStrength },
        uLodDistance: { value: lodDistance },
        uCameraPos: { value: new THREE.Vector3() },
        uEnableWind: { value: enableWind }
    }), []);

    // Update uniform values when props change
    useEffect(() => {
        uniforms.uWindStrength.value = windStrength;
        uniforms.uLodDistance.value = lodDistance;
        uniforms.uEnableWind.value = enableWind;
    }, [windStrength, lodDistance, enableWind, uniforms]);

    // Initialize instance matrices and patch material
    useEffect(() => {
        if (!meshRef.current) return;
        
        const mesh = meshRef.current;
        const matrix = new THREE.Matrix4();
        const quaternion = new THREE.Quaternion();
        
        const activeCount = Math.min(instances.length, count);

        for (let i = 0; i < activeCount; i++) {
            const instance = instances[i];
            quaternion.setFromEuler(instance.rotation);
            matrix.compose(instance.position, quaternion, instance.scale);
            mesh.setMatrixAt(i, matrix);
        }
        
        mesh.instanceMatrix.needsUpdate = true;
        mesh.count = activeCount;

        // Patch the material for vertex shader wind and LOD
        // We use onBeforeCompile to inject our logic into the standard material
        material.onBeforeCompile = (shader) => {
            // Assign uniforms
            shader.uniforms.uTime = uniforms.uTime;
            shader.uniforms.uWindStrength = uniforms.uWindStrength;
            shader.uniforms.uLodDistance = uniforms.uLodDistance;
            shader.uniforms.uCameraPos = uniforms.uCameraPos;
            shader.uniforms.uEnableWind = uniforms.uEnableWind;
            
            // Inject functions and uniforms declarations
            shader.vertexShader = windShaderChunk + shader.vertexShader;
            
            // Inject logic
            // We need to access instanceMatrix (which provides world position)
            // and apply wind to 'transformed' (local position)
            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                `
                #include <begin_vertex>

                #ifdef USE_INSTANCING
                    // instanceMatrix column 3 is translation (world position of instance origin)
                    vec3 instancePos = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);

                    // LOD Logic
                    float distToCamera = distance(instancePos, uCameraPos);

                    // 1.0 = full scale, 0.0 = hidden
                    // Smooth transition from 0.5*lod to lod
                    float lodScale = 1.0 - smoothstep(uLodDistance * 0.5, uLodDistance, distToCamera);

                    if (lodScale < 0.01) {
                        // Collapse geometry if too far
                        transformed = vec3(0.0);
                    } else {
                        // Apply LOD scale
                        transformed *= lodScale;

                        // Apply Wind
                        applyWind(transformed, instancePos);
                    }
                #endif
                `
            );
        };

        // Trigger material update
        material.needsUpdate = true;
        materialRef.current = material;

    }, [instances, count, material, uniforms]);

    // Update time and camera position per frame
    useFrame((state) => {
        uniforms.uTime.value = state.clock.elapsedTime;
        uniforms.uCameraPos.value.copy(state.camera.position);
    });
    
    return (
        <instancedMesh
            ref={meshRef}
            args={[geometry, material, count]}
            frustumCulled={frustumCulled}
            castShadow={castShadow}
            receiveShadow={receiveShadow}
        />
    );
}

// =============================================================================
// VEGETATION SYSTEMS
// =============================================================================

interface GrassInstancesProps {
    count?: number;
    areaSize?: number;
    biomes?: BiomeData[];
    heightFunc?: (x: number, z: number) => number;
}

const DEFAULT_BIOMES: BiomeData[] = [
    { type: 'marsh', center: new THREE.Vector2(0, 0), radius: 30 },
    { type: 'forest', center: new THREE.Vector2(50, 0), radius: 40 },
    { type: 'savanna', center: new THREE.Vector2(60, 60), radius: 50 },
];

export function GrassInstances({
    count = 10000,
    areaSize = 100,
    biomes = DEFAULT_BIOMES,
    heightFunc = () => 0
}: GrassInstancesProps) {
    const geometry = useMemo(() => {
        // Grass blade geometry - tapered quad
        const geo = new THREE.BufferGeometry();
        
        const positions = new Float32Array([
            // Two triangles forming a tapered blade
            -0.05, 0, 0,
            0.05, 0, 0,
            0, 1, 0,
            
            0.05, 0, 0,
            0.03, 1, 0,
            0, 1, 0,
        ]);
        
        const normals = new Float32Array([
            0, 0, 1, 0, 0, 1, 0, 0, 1,
            0, 0, 1, 0, 0, 1, 0, 0, 1,
        ]);
        
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
        
        return geo;
    }, []);
    
    const material = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: 0x4a7c23,
            roughness: 0.8,
            metalness: 0.0,
            side: THREE.DoubleSide
        });
    }, []);
    
    const instances = useMemo(() => {
        return generateInstanceData(
            count,
            areaSize,
            heightFunc,
            biomes,
            ['marsh', 'forest', 'savanna', 'scrubland']
        );
    }, [count, areaSize, biomes, heightFunc]);
    
    // Cleanup
    useEffect(() => {
        return () => {
            geometry.dispose();
            material.dispose();
        };
    }, [geometry, material]);
    
    return (
        <GPUInstancedMesh
            geometry={geometry}
            material={material}
            count={count}
            instances={instances}
            enableWind={true}
            windStrength={0.3}
            lodDistance={80}
            castShadow={false}
            receiveShadow={true}
        />
    );
}

interface TreeInstancesProps {
    count?: number;
    areaSize?: number;
    biomes?: BiomeData[];
    heightFunc?: (x: number, z: number) => number;
}

export function TreeInstances({
    count = 500,
    areaSize = 100,
    biomes = DEFAULT_BIOMES,
    heightFunc = () => 0
}: TreeInstancesProps) {
    const geometry = useMemo(() => {
        // Simple tree geometry - cone for foliage
        return new THREE.ConeGeometry(1, 3, 6);
    }, []);
    
    const material = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: 0x2d5a27,
            roughness: 0.85,
            metalness: 0.0
        });
    }, []);
    
    const instances = useMemo(() => {
        return generateInstanceData(
            count,
            areaSize,
            heightFunc,
            biomes,
            ['forest', 'tundra']
        );
    }, [count, areaSize, biomes, heightFunc]);
    
    // Cleanup
    useEffect(() => {
        return () => {
            geometry.dispose();
            material.dispose();
        };
    }, [geometry, material]);
    
    return (
        <GPUInstancedMesh
            geometry={geometry}
            material={material}
            count={count}
            instances={instances}
            enableWind={true}
            windStrength={0.15}
            lodDistance={150}
            castShadow={true}
            receiveShadow={true}
        />
    );
}

interface RockInstancesProps {
    count?: number;
    areaSize?: number;
    biomes?: BiomeData[];
    heightFunc?: (x: number, z: number) => number;
}

export function RockInstances({
    count = 200,
    areaSize = 100,
    biomes = DEFAULT_BIOMES,
    heightFunc = () => 0
}: RockInstancesProps) {
    const geometry = useMemo(() => {
        // Irregular rock geometry
        return new THREE.DodecahedronGeometry(0.5, 0);
    }, []);
    
    const material = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: 0x696969,
            roughness: 0.9,
            metalness: 0.1
        });
    }, []);
    
    const instances = useMemo(() => {
        return generateInstanceData(
            count,
            areaSize,
            heightFunc,
            biomes,
            ['mountain', 'tundra', 'desert', 'scrubland']
        );
    }, [count, areaSize, biomes, heightFunc]);
    
    // Cleanup
    useEffect(() => {
        return () => {
            geometry.dispose();
            material.dispose();
        };
    }, [geometry, material]);
    
    return (
        <GPUInstancedMesh
            geometry={geometry}
            material={material}
            count={count}
            instances={instances}
            enableWind={false}
            lodDistance={120}
            castShadow={true}
            receiveShadow={true}
        />
    );
}
