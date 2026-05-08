import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { earth } from "../data/earth";
import { planets } from "../data/planet";
import { sun } from "../data/sun";
import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  GodRaysEffect,
  RenderPass,
} from "postprocessing";
import { HDRLoader } from "three/examples/jsm/Addons.js";

type SceneBody = {
  id: string;
  modelPath: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  scale?: number;
  distanceFromSurfaceFactor: number;
  lateralFactor: number;
};

type Screen = "hero" | "planets" | "end";

type BodyRuntime = {
  pivot: THREE.Group;
  radius: number;
  distanceFromSurfaceFactor: number;
  lateralFactor: number;
};

export default function SceneCanvas({
  screen,
  planetIndex,
}: {
  screen?: "hero" | "planets" | "end";
  planetIndex?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const viewApiRef = useRef<{
    setView: (nextScreen: Screen, nextPlanetIndex: number) => void;
  } | null>(null);

  useEffect(() => {
    const normalizedScreen: Screen = (screen ?? "hero") as Screen;
    const normalizedIndex = typeof planetIndex === "number" ? planetIndex : 0;
    viewApiRef.current?.setView(normalizedScreen, normalizedIndex);
  }, [screen, planetIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isActive = true;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      logarithmicDepthBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
    camera.position.set(0, 2, 15);
    camera.lookAt(0, 0, 0);

    const desiredPos = new THREE.Vector3().copy(camera.position);
    const desiredLookAt = new THREE.Vector3(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.01);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2);
    keyLight.position.set(-40, 0, 0);
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

    const hdrloader = new HDRLoader(manager);

    hdrloader.load(`${import.meta.env.BASE_URL}hdr/hazy_nebulae_1.hdr`, (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.background = texture;
      scene.environment = texture;
    });

    const loader = new GLTFLoader(manager);

    const sceneBodies: SceneBody[] = [
      { id: "sun", ...sun },
      { id: "earth", ...earth },
      ...planets.map((planet) => ({
        id: planet.id,
        modelPath: planet.modelPath,
        position: planet.position,
        scale: planet.scale,
        distanceFromSurfaceFactor: planet.distanceFromSurfaceFactor,
        lateralFactor: planet.lateralFactor,
      })),
    ];

    const bodyById = new Map<string, SceneBody>(
      sceneBodies.map((b) => [b.id, b]),
    );

    const animated: THREE.Object3D[] = [];
    const runtimes = new Map<string, BodyRuntime>();

    let composer: EffectComposer | null = null;
    let sunSourceMesh: THREE.Mesh | null = null;

    const rebuildComposer = () => {
      const { width, height } = canvas.getBoundingClientRect();

      if (composer) {
        try {
          composer.dispose();
        } catch (e) {}
      }

      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));

      const bloom = new BloomEffect({
        intensity: 1.35,
        luminanceThreshold: 0.55,
        luminanceSmoothing: 0.08,
      });

      const effects: any[] = [bloom];
      if (sunSourceMesh) {
        const godrays = new GodRaysEffect(camera, sunSourceMesh, {
          exposure: 0.65,
          density: 0.96,
          decay: 0.92,
          weight: 0.72,
          samples: 60,
          clampMax: 1,
          blur: true,
        });
        effects.push(godrays);
      }

      const pass = new EffectPass(camera, ...effects);
      pass.renderToScreen = true;
      composer.addPass(pass);
      composer.setSize(
        Math.max(1, Math.floor(width)),
        Math.max(1, Math.floor(height)),
      );
    };

    const isPbrMaterial = (mat: any) =>
      mat instanceof THREE.MeshStandardMaterial ||
      mat instanceof THREE.MeshPhysicalMaterial;

    const toStandardMaterial = (mat: any, treatAsSun = false) => {
      const out = new THREE.MeshStandardMaterial();

      out.map = mat?.map ?? null;
      out.normalMap = mat?.normalMap ?? null;
      out.roughnessMap = mat?.roughnessMap ?? null;
      out.metalnessMap = mat?.metalnessMap ?? null;
      out.emissiveMap = mat?.emissiveMap ?? null;
      out.alphaMap = mat?.alphaMap ?? null;
      out.aoMap = mat?.aoMap ?? null;

      if (mat?.color) out.color = mat.color;
      out.opacity = typeof mat?.opacity === "number" ? mat.opacity : 1;
      out.transparent = Boolean(mat?.transparent);
      out.side = typeof mat?.side === "number" ? mat.side : THREE.FrontSide;
      out.depthWrite = mat?.depthWrite ?? true;
      out.depthTest = mat?.depthTest ?? true;

      out.roughness = typeof mat?.roughness === "number" ? mat.roughness : 1;
      out.metalness = typeof mat?.metalness === "number" ? mat.metalness : 0;

      if (mat?.emissive) out.emissive = mat.emissive;
      out.emissiveIntensity =
        typeof mat?.emissiveIntensity === "number" ? mat.emissiveIntensity : 1;

      if (treatAsSun) {
        out.emissive = new THREE.Color(0xffb45c);
        out.emissiveIntensity = 6;
        out.color = new THREE.Color(0xffffff);
        (out as any).toneMapped = false;
      }

      out.needsUpdate = true;
      return out;
    };

    const loadBody = (body: SceneBody) => {
      loader.load(
        `${import.meta.env.BASE_URL}${body.modelPath}`,
        (gltf) => {
          const pivot = new THREE.Group();
          pivot.name = body.id;

          const root = gltf.scene;
          if (body.scale) root.scale.setScalar(body.scale);

          const treatAsSun = body.id === "sun";

          root.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;

            const mats = Array.isArray(child.material)
              ? child.material
              : [child.material];
            const nextMats = mats.map((m: any) => {
              if (!m) return toStandardMaterial({}, treatAsSun);
              if (isPbrMaterial(m)) {
                if (treatAsSun) {
                  (m as any).emissive = new THREE.Color(0xffb45c);
                  (m as any).emissiveIntensity = 6;
                  (m as any).toneMapped = false;
                  (m as any).needsUpdate = true;
                }
                return m;
              }
              return toStandardMaterial(m, treatAsSun);
            });

            child.material = Array.isArray(child.material)
              ? nextMats
              : nextMats[0];
          });
          pivot.position.set(body.position.x, body.position.y, body.position.z);
          scene.add(pivot);

          root.updateMatrixWorld(true);
          const box = new THREE.Box3().setFromObject(root);
          const center = new THREE.Vector3();
          box.getCenter(center);
          root.position.sub(center);

          const sphere = new THREE.Sphere();
          box.getBoundingSphere(sphere);

          pivot.add(root);

          if (treatAsSun) {
            const lightGeo = new THREE.SphereGeometry(1, 32, 32);
            const lightMat = new THREE.MeshBasicMaterial({
              color: 0xffffff,
              transparent: true,
              opacity: 1,
              depthWrite: false,
              blending: THREE.AdditiveBlending,
            });
            (lightMat as any).toneMapped = false;

            const lightMesh = new THREE.Mesh(lightGeo, lightMat);
            lightMesh.name = "sun-light-source";
            lightMesh.renderOrder = 10;
            lightMesh.scale.setScalar(Math.max(0.001, sphere.radius * 0.9));
            pivot.add(lightMesh);
            sunSourceMesh = lightMesh;
          }

          if (body.id === "earth") {
            pivot.rotation.z = 0.25;
            pivot.rotation.x = 0.1;
          }

          runtimes.set(body.id, {
            pivot,
            radius: Math.max(0.001, sphere.radius),
            distanceFromSurfaceFactor: body.distanceFromSurfaceFactor,
            lateralFactor: body.lateralFactor,
          });

          animated.push(pivot);

          if (body.id === "sun") rebuildComposer();

          const normalizedScreen: Screen = (screen ?? "hero") as Screen;
          const normalizedIndex =
            typeof planetIndex === "number" ? planetIndex : 0;
          viewApiRef.current?.setView(normalizedScreen, normalizedIndex);
        },
        undefined,
        (err) => {
          console.warn("Failed to load model", body.modelPath, err);
        },
      );
    };

    sceneBodies.forEach(loadBody);

    const getBodyInfo = (id: string) => {
      const rt = runtimes.get(id);
      if (rt) {
        const center = new THREE.Vector3();
        rt.pivot.getWorldPosition(center);
        return {
          center,
          radius: rt.radius,
          distanceFromSurfaceFactor: rt.distanceFromSurfaceFactor,
          lateralFactor: rt.lateralFactor,
        };
      }

      const fallback = bodyById.get(id);
      const center = fallback
        ? new THREE.Vector3(
            fallback.position.x,
            fallback.position.y,
            fallback.position.z,
          )
        : new THREE.Vector3(0, 0, 0);
      const scale = fallback?.scale ?? 1;
      return {
        center,
        radius: Math.max(1.5, scale * 6),
        distanceFromSurfaceFactor: fallback?.distanceFromSurfaceFactor ?? 1.18,
        lateralFactor: 0.75,
      };
    };

    const setView = (nextScreen: Screen, nextPlanetIndex: number) => {
      const clampedIndex = Math.max(
        0,
        Math.min(planets.length - 1, nextPlanetIndex),
      );

      let targetBodyId = "earth";
      if (nextScreen === "planets" || nextScreen === "end") {
        targetBodyId = planets[clampedIndex]?.id ?? "earth";
      }

      const sunInfo = getBodyInfo("sun");
      const bodyInfo = getBodyInfo(targetBodyId);

      const planetCenter = bodyInfo.center;
      const sunCenter = sunInfo.center;

      const dirToSun = new THREE.Vector3().subVectors(sunCenter, planetCenter);
      if (dirToSun.lengthSq() < 1e-6) dirToSun.set(-1, 0, 0);
      dirToSun.normalize();

      const up = new THREE.Vector3(0, 1, 0);
      let lateralDir = new THREE.Vector3().crossVectors(dirToSun, up);
      if (lateralDir.lengthSq() < 1e-6) lateralDir = new THREE.Vector3(1, 0, 0);
      lateralDir.normalize();

      let lateralSide = nextScreen === "planets" ? 1 : -1;
      if (targetBodyId === "earth") lateralSide = -1;

      const radius = bodyInfo.radius;
      const distanceFromSurface = radius * bodyInfo.distanceFromSurfaceFactor;
      const lateralFactor = bodyInfo.lateralFactor;
      const lateralOffset = lateralDir
        .clone()
        .multiplyScalar(radius * lateralFactor * lateralSide);
      const heightOffset = up.clone().multiplyScalar(radius * 0.18);

      const pos = planetCenter
        .clone()
        .add(dirToSun.clone().multiplyScalar(-distanceFromSurface))
        .add(lateralOffset)
        .add(heightOffset);

      if (targetBodyId === "earth" && nextScreen === "hero") {
        pos.add(up.clone().multiplyScalar(radius * 0.3));
      }

      desiredPos.copy(pos);
      desiredLookAt.copy(sunCenter);
    };

    viewApiRef.current = { setView };

    rebuildComposer();

    setView(
      (screen ?? "hero") as Screen,
      typeof planetIndex === "number" ? planetIndex : 0,
    );

    let frameId = 0;

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / height || 1;
      camera.updateProjectionMatrix();
      if (composer)
        composer.setSize(
          Math.max(1, Math.floor(width)),
          Math.max(1, Math.floor(height)),
        );
    };

    const animate = () => {
      animated.forEach((object, index) => {
        object.rotation.y += 0.0001 + index * 0.0001;
      });

      camera.position.lerp(desiredPos, 0.06);

      const m = new THREE.Matrix4();
      m.lookAt(camera.position, desiredLookAt, camera.up);
      const targetQuat = new THREE.Quaternion().setFromRotationMatrix(m);
      camera.quaternion.slerp(targetQuat, 0.08);

      const delta = 1 / 60;
      if (composer) composer.render(delta);
      else renderer.render(scene, camera);

      frameId = requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener("resize", resize);

    return () => {
      isActive = false;
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameId);
      viewApiRef.current = null;

      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(
              (material: any) => material.dispose && material.dispose(),
            );
          } else {
            (child.material as any)?.dispose &&
              (child.material as any).dispose();
          }
        }
      });

      renderer.dispose();
      try {
        composer?.dispose();
      } catch (e) {}
    };
  }, []);

  return (
    <div className={`scene-layer ${isLoading ? "is-loading" : ""}`}>
      <canvas ref={canvasRef} className="scene-canvas" />
      {isLoading && (
        <div className="scene-loader">
          <div className="scene-loader-card">
            <p className="scene-loader-title">Stand Ready For My Arrival, Worm</p>
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
