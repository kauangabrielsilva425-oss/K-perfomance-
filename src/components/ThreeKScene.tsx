import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RotateCw, Sparkles, ChevronDown, ChevronUp, Eye } from 'lucide-react';

export type MetallicFinish = 'platinum' | 'titanium' | 'obsidian' | 'gold';

interface FinishConfig {
  name: string;
  color: number;
  roughness: number;
  metalness: number;
  clearcoat: number;
  clearcoatRoughness: number;
}

const FINISHES: Record<MetallicFinish, FinishConfig> = {
  platinum: {
    name: 'Chrome Platinado',
    color: 0xffffff,
    roughness: 0.12,
    metalness: 0.98,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
  },
  titanium: {
    name: 'Dark Titanium',
    color: 0x6e7278,
    roughness: 0.22,
    metalness: 0.92,
    clearcoat: 0.85,
    clearcoatRoughness: 0.15,
  },
  obsidian: {
    name: 'Liquid Obsidian',
    color: 0x18181b,
    roughness: 0.06,
    metalness: 0.95,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
  },
  gold: {
    name: 'White Gold / Champagne',
    color: 0xe5e1d8,
    roughness: 0.16,
    metalness: 0.95,
    clearcoat: 0.95,
    clearcoatRoughness: 0.1,
  },
};

// Reusable math objects outside the render loop
const _targetRot = new THREE.Euler(0, 0, 0);

export const ThreeKScene: React.FC<{
  onExploreClick?: () => void;
  onRoutineClick?: () => void;
}> = ({ onExploreClick, onRoutineClick }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeFinish, setActiveFinish] = useState<MetallicFinish>('platinum');
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  const sceneStateRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    materials: THREE.MeshPhysicalMaterial[];
    kGroup?: THREE.Group;
    targetYRot: number;
    targetXRot: number;
    isDragging: boolean;
    prevMouseX: number;
    prevMouseY: number;
  }>({
    materials: [],
    targetYRot: 0,
    targetXRot: 0,
    isDragging: false,
    prevMouseX: 0,
    prevMouseY: 0,
  });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.04);

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.28, 5.6);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    sceneStateRef.current.renderer = renderer;

    // Studio Environment map using PMREMGenerator
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // Studio 3-point lighting
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(3, 4, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xa1a1aa, 1.4);
    fillLight.position.set(-4, -1, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 3.2);
    rimLight.position.set(0, 5, -4);
    scene.add(rimLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x18181b, 0.8);
    scene.add(hemiLight);

    // K Emblem Procedural Master Group
    const kGroup = new THREE.Group();
    sceneStateRef.current.kGroup = kGroup;
    scene.add(kGroup);

    // Create Main Metallic Material
    const initialConfig = FINISHES[activeFinish];
    const mainMaterial = new THREE.MeshPhysicalMaterial({
      color: initialConfig.color,
      metalness: initialConfig.metalness,
      roughness: initialConfig.roughness,
      clearcoat: initialConfig.clearcoat,
      clearcoatRoughness: initialConfig.clearcoatRoughness,
      reflectivity: 1.0,
      envMapIntensity: 2.2,
    });

    const accentMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.99,
      roughness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      reflectivity: 1.0,
      envMapIntensity: 2.5,
    });

    sceneStateRef.current.materials = [mainMaterial, accentMaterial];

    // Procedural Heraldic / Gothic K geometry (referencing Harry Portugal sharp stylized emblem)
    // 1. Vertical Spine with Gothic pointed ends
    const spineShape = new THREE.Shape();
    spineShape.moveTo(-0.45, -1.6);
    spineShape.lineTo(-0.25, -1.9); // sharp bottom gothic point
    spineShape.lineTo(-0.05, -1.6);
    spineShape.lineTo(-0.05, 1.6);
    spineShape.lineTo(-0.25, 1.9); // sharp top gothic point
    spineShape.lineTo(-0.45, 1.6);
    spineShape.closePath();

    const extrudeSettings = {
      steps: 2,
      depth: 0.28,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.07,
      bevelOffset: 0,
      bevelSegments: 5,
    };

    const spineGeo = new THREE.ExtrudeGeometry(spineShape, extrudeSettings);
    spineGeo.center();
    const spineMesh = new THREE.Mesh(spineGeo, mainMaterial);
    kGroup.add(spineMesh);

    // 2. Upper Diagonal Arm with Gothic pointed spear tip
    const upperArmShape = new THREE.Shape();
    upperArmShape.moveTo(-0.1, -0.1);
    upperArmShape.lineTo(0.9, 1.25);
    upperArmShape.lineTo(1.15, 1.65); // sharp angled spear tip
    upperArmShape.lineTo(0.75, 1.5);
    upperArmShape.lineTo(-0.1, 0.4);
    upperArmShape.closePath();

    const upperGeo = new THREE.ExtrudeGeometry(upperArmShape, extrudeSettings);
    upperGeo.center();
    const upperMesh = new THREE.Mesh(upperGeo, mainMaterial);
    upperMesh.position.set(0.48, 0.72, 0);
    kGroup.add(upperMesh);

    // 3. Lower Diagonal Arm with Gothic spear tip
    const lowerArmShape = new THREE.Shape();
    lowerArmShape.moveTo(-0.08, 0.15);
    lowerArmShape.lineTo(0.3, 0.0);
    lowerArmShape.lineTo(1.1, -1.45);
    lowerArmShape.lineTo(0.95, -1.8); // sharp angled spear tip
    lowerArmShape.lineTo(0.65, -1.35);
    lowerArmShape.lineTo(-0.08, -0.45);
    lowerArmShape.closePath();

    const lowerGeo = new THREE.ExtrudeGeometry(lowerArmShape, extrudeSettings);
    lowerGeo.center();
    const lowerMesh = new THREE.Mesh(lowerGeo, mainMaterial);
    lowerMesh.position.set(0.52, -0.72, 0);
    kGroup.add(lowerMesh);

    // 4. Central Emblem Star / Diamond Crest (Harry Portugal star detail at junction)
    const starShape = new THREE.Shape();
    const points = 8;
    const outerRadius = 0.22;
    const innerRadius = 0.09;
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i / (points * 2)) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) starShape.moveTo(x, y);
      else starShape.lineTo(x, y);
    }
    starShape.closePath();

    const starGeo = new THREE.ExtrudeGeometry(starShape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.04,
      bevelSegments: 4,
    });
    starGeo.center();
    const starMesh = new THREE.Mesh(starGeo, accentMaterial);
    starMesh.position.set(0.04, -0.05, 0.22);
    kGroup.add(starMesh);

    // 5. Subtle ambient orbital particles (chrome particles floating around)
    const particleCount = 45;
    const particleGeo = new THREE.SphereGeometry(0.018, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });
    const particlesGroup = new THREE.Group();

    for (let i = 0; i < particleCount; i++) {
      const p = new THREE.Mesh(particleGeo, particleMat);
      const radius = 2.2 + Math.random() * 1.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      p.position.set(
        radius * Math.cos(theta) * Math.cos(phi),
        radius * Math.sin(phi),
        radius * Math.sin(theta) * Math.cos(phi)
      );
      particlesGroup.add(p);
    }
    scene.add(particlesGroup);

    // Soft contact shadow plane beneath
    const shadowGeo = new THREE.PlaneGeometry(3.5, 3.5);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 60);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -2.1;
    scene.add(shadowMesh);

    // Pointer Parallax & Drag Handling
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const rect = container.getBoundingClientRect();
      const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);

      if (sceneStateRef.current.isDragging) {
        const deltaX = clientX - sceneStateRef.current.prevMouseX;
        const deltaY = clientY - sceneStateRef.current.prevMouseY;
        sceneStateRef.current.targetYRot += deltaX * 0.008;
        sceneStateRef.current.targetXRot += deltaY * 0.008;
        sceneStateRef.current.prevMouseX = clientX;
        sceneStateRef.current.prevMouseY = clientY;
      } else {
        // Parallax tilt when hovering
        sceneStateRef.current.targetYRot = normX * 0.45;
        sceneStateRef.current.targetXRot = -normY * 0.28;
      }
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      sceneStateRef.current.isDragging = true;
      setAutoRotate(false);
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      sceneStateRef.current.prevMouseX = clientX;
      sceneStateRef.current.prevMouseY = clientY;
    };

    const handlePointerUp = () => {
      sceneStateRef.current.isDragging = false;
    };

    window.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mouseup', handlePointerUp);

    container.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    // Resize Observer
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Render Loop with frame pacing and smooth exponential damping
    let frameId = 0;
    let clock = new THREE.Clock();

    function renderLoop() {
      frameId = requestAnimationFrame(renderLoop);
      const delta = Math.min(clock.getDelta(), 0.1);

      if (autoRotate && !sceneStateRef.current.isDragging) {
        sceneStateRef.current.targetYRot += delta * 0.4;
      }

      // Smooth damping
      kGroup.rotation.y = THREE.MathUtils.damp(
        kGroup.rotation.y,
        sceneStateRef.current.targetYRot,
        4.5,
        delta
      );
      kGroup.rotation.x = THREE.MathUtils.damp(
        kGroup.rotation.x,
        sceneStateRef.current.targetXRot,
        4.5,
        delta
      );

      // Subtle breathing float with elevated center
      const elapsed = clock.getElapsedTime();
      kGroup.position.y = 0.32 + Math.sin(elapsed * 1.5) * 0.05;

      // Particle gentle orbit
      particlesGroup.rotation.y += delta * 0.05;

      renderer.render(scene, camera);
    }

    renderLoop();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mouseup', handlePointerUp);
      container.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);

      renderer.dispose();
      spineGeo.dispose();
      upperGeo.dispose();
      lowerGeo.dispose();
      starGeo.dispose();
      mainMaterial.dispose();
      accentMaterial.dispose();
      envTexture.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [autoRotate]);

  // Update materials when finish changes
  const handleSelectFinish = (finishKey: MetallicFinish) => {
    setActiveFinish(finishKey);
    const config = FINISHES[finishKey];
    sceneStateRef.current.materials.forEach((mat) => {
      mat.color.setHex(config.color);
      mat.metalness = config.metalness;
      mat.roughness = config.roughness;
      mat.clearcoat = config.clearcoat;
      mat.clearcoatRoughness = config.clearcoatRoughness;
      mat.needsUpdate = true;
    });
  };

  const resetView = () => {
    sceneStateRef.current.targetYRot = 0;
    sceneStateRef.current.targetXRot = 0;
    if (sceneStateRef.current.kGroup) {
      sceneStateRef.current.kGroup.rotation.set(0, 0, 0);
    }
    setAutoRotate(true);
  };

  return (
    <div className="relative w-full h-[620px] lg:h-[700px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-black via-neutral-950 to-black select-none">
      {/* 1. Background Letter K — Discreet, non-intrusive graphite luxury watermark */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden z-0 select-none"
        aria-hidden="true"
      >
        <span
          className="font-display font-black text-[380px] sm:text-[500px] md:text-[640px] lg:text-[740px] text-neutral-800/20 leading-none select-none tracking-tighter transform -translate-y-6 md:-translate-y-10 filter blur-[0.5px]"
          style={{
            maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 15%, rgba(0,0,0,0.25) 55%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 15%, rgba(0,0,0,0.25) 55%, transparent 75%)',
          }}
        >
          K
        </span>
      </div>

      {/* 2. Main 3D Metallic Letter K Canvas */}
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-10"
        title="Arraste para inspecionar em 3D"
      />

      {/* 3. Top Editorial Headline & Badge (Positioned with clear breathing room above 3D K) */}
      <div className="pointer-events-none absolute inset-x-0 top-10 md:top-14 flex flex-col items-center text-center px-4 z-20">
        <span className="text-[10px] md:text-[11px] font-mono tracking-[0.25em] uppercase text-neutral-400 mb-2 border border-white/10 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md">
          Plataforma de Engenharia Corporal & Nutrição
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-widest font-display metallic-gradient max-w-4xl leading-tight">
          K PERFORMANCE
        </h1>
      </div>

      {/* 4. Lower Crisp Subtitle & Quick Call to Action Buttons */}
      <div className="absolute bottom-20 md:bottom-20 inset-x-0 flex flex-col items-center gap-4 px-4 z-20 pointer-events-auto">
        <div className="px-4 py-1.5 rounded-full bg-black/65 border border-white/10 backdrop-blur-md shadow-lg max-w-md mx-auto pointer-events-none">
          <p className="text-neutral-300 text-xs md:text-sm font-normal text-center leading-relaxed">
            Ciência do treinamento resistido, precisão alimentar e evolução contínua.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onRoutineClick}
            className="px-6 py-2.5 bg-white text-black text-xs md:text-sm font-semibold tracking-wider uppercase rounded-full hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 cursor-pointer"
          >
            Montar Minha Rotina
          </button>
          <button
            onClick={onExploreClick}
            className="px-6 py-2.5 border border-neutral-700 bg-neutral-900/80 text-white text-xs md:text-sm font-medium tracking-wider uppercase rounded-full hover:bg-neutral-800 transition-all hover:border-neutral-500 active:scale-95 backdrop-blur-sm cursor-pointer"
          >
            Explorar Recursos
          </button>
        </div>
      </div>

      {/* Ergonomic Collapsible Bottom 3D Control Dock */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-lg pointer-events-auto">
        <div className="flex flex-col items-center">
          <button
            onClick={() => setIsControlsOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono tracking-wider text-neutral-400 bg-neutral-900/90 border border-neutral-800 rounded-t-lg hover:text-white transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-neutral-300" />
            <span>{isControlsOpen ? 'Ocultar Controles 3D' : 'Personalizar Metal 3D'}</span>
            {isControlsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>

          {isControlsOpen && (
            <div className="w-full bg-neutral-950/95 border border-neutral-800 rounded-b-xl rounded-t-sm p-3.5 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Acabamento Metalizado
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAutoRotate((prev) => !prev)}
                    className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                      autoRotate
                        ? 'border-neutral-600 bg-neutral-800 text-white'
                        : 'border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    Auto-Giro: {autoRotate ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={resetView}
                    className="p-1 text-neutral-400 hover:text-white rounded border border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer"
                    title="Resetar Vista"
                  >
                    <RotateCw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(Object.keys(FINISHES) as MetallicFinish[]).map((finishKey) => {
                  const conf = FINISHES[finishKey];
                  const isSelected = activeFinish === finishKey;
                  return (
                    <button
                      key={finishKey}
                      onClick={() => handleSelectFinish(finishKey)}
                      className={`text-left px-2.5 py-1.5 rounded-lg border text-[11px] transition-all cursor-pointer ${
                        isSelected
                          ? 'border-white bg-neutral-800 text-white shadow-sm'
                          : 'border-neutral-800/80 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                      }`}
                    >
                      <div className="font-medium truncate">{conf.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subtle indicator hint */}
      <div className="absolute bottom-2 left-6 hidden md:block text-[10px] font-mono tracking-widest text-neutral-600 uppercase pointer-events-none">
        K-ENGINE // THREE.JS R160+ // PBR SHADING
      </div>
      <div className="absolute bottom-2 right-6 hidden md:block text-[10px] font-mono tracking-widest text-neutral-600 uppercase pointer-events-none">
        INTERAÇÃO COM O CURSOR ATIVA
      </div>
    </div>
  );
};
