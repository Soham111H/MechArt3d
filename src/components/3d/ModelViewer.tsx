'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { Loader2 } from 'lucide-react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

function Model({ url }: { url: string }) {
  const ext = url.split('.').pop()?.toLowerCase();
  
  if (ext === 'gltf' || ext === 'glb') {
    const gltf = useLoader(GLTFLoader, url) as any;
    return <primitive object={gltf.scene} />;
  } else if (ext === 'obj') {
    const obj = useLoader(OBJLoader, url);
    return <primitive object={obj} />;
  } else if (ext === 'stl') {
    const geometry = useLoader(STLLoader, url);
    return (
      <mesh geometry={geometry as any}>
        <meshStandardMaterial color={0xcccccc} />
      </mesh>
    );
  }
  
  return null;
}

export default function ModelViewer({ url }: { url: string }) {
  return (
    <div className="w-full h-full relative bg-[#f8fafc] dark:bg-slate-900 rounded-3xl overflow-hidden cursor-move">
      <div className="absolute inset-x-0 top-4 text-center z-10 pointer-events-none opacity-50">
        <span className="bg-white/80 dark:bg-slate-800/80 px-3 py-1 rounded-full text-xs font-bold text-slate-500">
          Drag to rotate &middot; Scroll to zoom
        </span>
      </div>
      
      <Canvas shadows camera={{ position: [0, 0, 150], fov: 45 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6}>
            <Model url={url} />
          </Stage>
        </Suspense>
        <OrbitControls autoRotate autoRotateSpeed={1} enableDamping />
      </Canvas>
    </div>
  );
}
