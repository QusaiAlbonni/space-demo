import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { earth } from "../data/earth";
import { planets } from "../data/planet";
import { sun } from "../data/sun";

type SceneBody = {
  id: string;
  modelPath: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  scale?: number;
};

export default function SceneCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isActive = true;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
    camera.position.set(0, 2, 15);
    camera.lookAt(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.85);
    keyLight.position.set(6, 8, 10);
    scene.add(keyLight);

    const manager = new THREE.LoadingManager();
    manager.onStart = () => {
      if (!isActive) return;
      setIsLoading(true);
      setProgress(0);
    };
    manager.onProgress = (_url, itemsLoaded, itemsTotal) => {
      if (!isActive) return;
      const value = itemsTotal > 0 ? itemsLoaded / itemsTotal : 0;
      setProgress(value);
    };
    manager.onLoad = () => {
      if (!isActive) return;
      setProgress(1);
      setIsLoading(false);
    };
    manager.onError = () => {
      if (!isActive) return;
      setProgress(1);
      setIsLoading(false);
    };

    const loader = new GLTFLoader(manager);

    const sceneBodies: SceneBody[] = [
      { id: "sun", ...sun },
      { id: "earth", ...earth },
      ...planets.map((planet) => ({
        id: planet.id,
        modelPath: planet.modelPath,
        position: planet.position,
        scale: planet.scale,
      })),
    ];

    const animated: THREE.Object3D[] = [];

    sceneBodies.forEach((body) => {
      loader.load(body.modelPath, (gltf) => {
        const root = gltf.scene;
        root.position.set(body.position.x, body.position.y, body.position.z);
        if (body.scale) {
          root.scale.setScalar(body.scale);
        }
        root.name = body.id;
        scene.add(root);
        animated.push(root);
      });
    });

    let frameId = 0;

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / height || 1;
      camera.updateProjectionMatrix();
    };

    const animate = () => {
      animated.forEach((object, index) => {
        object.rotation.y += 0.001 + index * 0.0002;
      });
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener("resize", resize);

    return () => {
      isActive = false;
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameId);
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div className={`scene-layer ${isLoading ? "is-loading" : ""}`}>
      <canvas ref={canvasRef} className="scene-canvas" />
      {isLoading && (
        <div className="scene-loader">
          <div className="scene-loader-card">
            <p className="scene-loader-title">Loading scene</p>
            <div className="scene-loader-bar">
              <span style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <p className="scene-loader-percent">
              {Math.round(progress * 100)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
