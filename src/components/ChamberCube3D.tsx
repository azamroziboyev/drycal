import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ChamberPointId, ChamberPointData } from '../types';
import { CHAMBER_POINTS_CONFIG } from '../utils/metrology';
import { CheckCircle2, CircleAlert, Maximize2, DoorOpen, DoorClosed } from 'lucide-react';

interface ChamberCube3DProps {
  pointsData: ChamberPointData[];
  selectedPointId: ChamberPointId | null;
  onSelectPoint: (id: ChamberPointId) => void;
  className?: string;
}

export const ChamberCube3D: React.FC<ChamberCube3DProps> = ({
  pointsData,
  selectedPointId,
  onSelectPoint,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pointsGroupRef = useRef<THREE.Group | null>(null);
  const cubeMeshRef = useRef<THREE.Group | null>(null);
  const doorPivotRef = useRef<THREE.Group | null>(null);
  const sphereMeshesRef = useRef<Map<ChamberPointId, THREE.Mesh>>(new Map());
  const haloMeshesRef = useRef<Map<ChamberPointId, THREE.Mesh>>(new Map());
  const spriteMaterialsRef = useRef<Map<ChamberPointId, THREE.SpriteMaterial>>(new Map());

  const [hoveredPoint, setHoveredPoint] = useState<ChamberPointId | null>(null);
  const [isDoorOpen, setIsDoorOpen] = useState(true);
  const isDoorOpenRef = useRef(true);
  const isDraggingRef = useRef(false);
  const dragStartPositionRef = useRef({ x: 0, y: 0 });
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rotationGroupRef = useRef<THREE.Group | null>(null);

  // Dark mode detection and listener
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const updateTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    isDoorOpenRef.current = isDoorOpen;
  }, [isDoorOpen]);

  // Helper to determine if point has entered values
  const isPointEntered = useCallback(
    (id: ChamberPointId) => {
      const pt = pointsData.find((p) => p.id === id);
      if (!pt) return false;
      return pt.rows.some((r) => r.tStd !== '' && !isNaN(Number(String(r.tStd).replace(',', '.'))));
    },
    [pointsData]
  );

  // Helper to draw point label texture
  const createLabelTexture = useCallback((label: string, entered: boolean, isSelected: boolean) => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = isSelected
        ? 'rgba(37, 99, 235, 0.95)'
        : entered
        ? 'rgba(16, 185, 129, 0.95)'
        : 'rgba(30, 41, 59, 0.9)';
      if (ctx.roundRect) {
        ctx.roundRect(10, 10, 108, 44, 8);
      } else {
        ctx.rect(10, 10, 108, 44);
      }
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#1d4ed8' : entered ? '#059669' : '#475569';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 64, 32);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  // Helper to create control panel texture (top header of drying oven)
  const createControlPanelTexture = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Brushed slate panel background
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 512, 96);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, 508, 92);

      // Brand / Model label on left
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 20px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('RTOP-500Y', 24, 42);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px Arial, sans-serif';
      ctx.fillText('QURITISH SHKAFI', 24, 68);

      // Digital LED temperature display in center
      ctx.fillStyle = '#090d16';
      ctx.fillRect(195, 16, 130, 64);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(195, 16, 130, 64);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('30.0°C', 260, 56);

      // Status LEDs & buttons on right
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(365, 36, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(365, 62, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '12px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('RUN', 380, 40);
      ctx.fillText('HEAT', 380, 66);

      // Power switch button
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(445, 28, 38, 40);
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 2;
      ctx.strokeRect(445, 28, 38, 40);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  // Build 3D Scene once
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 420;

    // 1. Scene with background based on light / dark mode
    const isDark = document.documentElement.classList.contains('dark');
    const bgColor = isDark ? 0x0f172a : 0xffffff;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bgColor);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
    camera.position.set(4.2, 2.5, 5.7);
    camera.lookAt(0, -0.05, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setClearColor(bgColor, 1);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    rendererRef.current = renderer;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.15);
    dirLight1.position.set(6, 10, 8);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x93c5fd, 0.55);
    dirLight2.position.set(-6, -4, -6);
    scene.add(dirLight2);

    // 5. Root rotation group (stationary by default; rotates ONLY around vertical axis via mouse drag)
    const rotGroup = new THREE.Group();
    rotGroup.rotation.set(0, -0.28, 0);
    scene.add(rotGroup);
    rotationGroupRef.current = rotGroup;

    // 6. Drying Oven Cabinet & Inner Chamber Group
    const cubeGroup = new THREE.Group();
    rotGroup.add(cubeGroup);
    cubeMeshRef.current = cubeGroup;

    const boxSize = 2.4;
    const half = boxSize / 2; // 1.2

    // 6a. Inner working chamber volume (translucent glass blue)
    const boxGeo = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    const boxMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.07,
      roughness: 0.2,
      metalness: 0.05,
      clearcoat: 0.8,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const boxMesh = new THREE.Mesh(boxGeo, boxMat);
    cubeGroup.add(boxMesh);

    // Inner chamber wireframe edges
    const edgesGeo = new THREE.EdgesGeometry(boxGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: 0x0284c7,
      linewidth: 2,
      transparent: true,
      opacity: 0.85,
    });
    const wireframe = new THREE.LineSegments(edgesGeo, edgesMat);
    cubeGroup.add(wireframe);

    // 6b. Outer Cabinet Structural Pillars & Frame (gives real drying oven cabinet look)
    const cabinetFrameMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.35,
      metalness: 0.45,
    });
    const darkTrimMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.4,
      metalness: 0.5,
    });

    const pillarThickness = 0.1;
    const cabinetWidth = boxSize + pillarThickness * 2; // 2.6
    const pillarGeo = new THREE.BoxGeometry(pillarThickness, boxSize + 0.12, pillarThickness);

    const pillarCoords: [number, number][] = [
      [-half - pillarThickness / 2, half + pillarThickness / 2],
      [half + pillarThickness / 2, half + pillarThickness / 2],
      [-half - pillarThickness / 2, -half - pillarThickness / 2],
      [half + pillarThickness / 2, -half - pillarThickness / 2],
    ];
    pillarCoords.forEach(([px, pz]) => {
      const pillar = new THREE.Mesh(pillarGeo, cabinetFrameMat);
      pillar.position.set(px, 0, pz);
      cubeGroup.add(pillar);
    });

    // Bottom base plinth of cabinet
    const baseGeo = new THREE.BoxGeometry(cabinetWidth, 0.14, cabinetWidth);
    const baseMesh = new THREE.Mesh(baseGeo, cabinetFrameMat);
    baseMesh.position.set(0, -half - 0.07, 0);
    cubeGroup.add(baseMesh);

    // 4 Cabinet Feet
    const footGeo = new THREE.CylinderGeometry(0.09, 0.07, 0.16, 16);
    const footCoords: [number, number][] = [
      [-half + 0.1, half - 0.1],
      [half - 0.1, half - 0.1],
      [-half + 0.1, -half + 0.1],
      [half - 0.1, -half + 0.1],
    ];
    footCoords.forEach(([fx, fz]) => {
      const foot = new THREE.Mesh(footGeo, darkTrimMat);
      foot.position.set(fx, -half - 0.22, fz);
      cubeGroup.add(foot);
    });

    // Top Control Panel Header of Drying Oven
    const topHeaderHeight = 0.36;
    const panelTexture = createControlPanelTexture();
    const topMaterials = [
      cabinetFrameMat, // right
      cabinetFrameMat, // left
      cabinetFrameMat, // top
      cabinetFrameMat, // bottom
      new THREE.MeshBasicMaterial({ map: panelTexture }), // front control panel
      cabinetFrameMat, // back
    ];
    const topHeaderGeo = new THREE.BoxGeometry(cabinetWidth, topHeaderHeight, cabinetWidth);
    const topHeaderMesh = new THREE.Mesh(topHeaderGeo, topMaterials);
    topHeaderMesh.position.set(0, half + topHeaderHeight / 2 + 0.04, 0);
    cubeGroup.add(topHeaderMesh);

    // Subtle back & side translucent walls of cabinet
    const sideWallMat = new THREE.MeshPhysicalMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.12,
      roughness: 0.3,
      metalness: 0.2,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(boxSize, boxSize), sideWallMat);
    backWall.position.set(0, 0, -half - 0.01);
    cubeGroup.add(backWall);

    // 6c. Internal Wire Shelves (2 shelves inside the drying oven)
    const shelfLevels = [-0.55, 0.55];
    const shelfLineMat = new THREE.LineBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.65,
    });
    shelfLevels.forEach((sy) => {
      const shelfPts: THREE.Vector3[] = [];
      // Outer border of shelf
      shelfPts.push(new THREE.Vector3(-half + 0.05, sy, -half + 0.05));
      shelfPts.push(new THREE.Vector3(half - 0.05, sy, -half + 0.05));
      shelfPts.push(new THREE.Vector3(half - 0.05, sy, -half + 0.05));
      shelfPts.push(new THREE.Vector3(half - 0.05, sy, half - 0.05));
      shelfPts.push(new THREE.Vector3(half - 0.05, sy, half - 0.05));
      shelfPts.push(new THREE.Vector3(-half + 0.05, sy, half - 0.05));
      shelfPts.push(new THREE.Vector3(-half + 0.05, sy, half - 0.05));
      shelfPts.push(new THREE.Vector3(-half + 0.05, sy, -half + 0.05));

      // Grid bars along X
      for (let gx = -0.9; gx <= 0.91; gx += 0.3) {
        shelfPts.push(new THREE.Vector3(gx, sy, -half + 0.05));
        shelfPts.push(new THREE.Vector3(gx, sy, half - 0.05));
      }
      const shelfGeo = new THREE.BufferGeometry().setFromPoints(shelfPts);
      const shelfLines = new THREE.LineSegments(shelfGeo, shelfLineMat);
      cubeGroup.add(shelfLines);
    });

    // 6d. Hinged Front Cabinet Door ("Eshik")
    // Pivot placed at front-left edge of the cabinet so it swings open to the left
    const doorPivot = new THREE.Group();
    doorPivot.position.set(-half - 0.05, 0, half + 0.06);
    doorPivot.rotation.y = -0.62; // Open ~35 degrees by default so it clearly looks like a door
    cubeGroup.add(doorPivot);
    doorPivotRef.current = doorPivot;

    const doorWidth = cabinetWidth; // 2.6
    const doorHeight = boxSize + 0.08; // 2.48
    const doorDepth = 0.07;
    const railWidth = 0.24;

    const doorFrameMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.3,
      metalness: 0.55,
    });

    // Left vertical door stile
    const leftStile = new THREE.Mesh(
      new THREE.BoxGeometry(railWidth, doorHeight, doorDepth),
      doorFrameMat
    );
    leftStile.position.set(railWidth / 2, 0, 0);
    doorPivot.add(leftStile);

    // Right vertical door stile
    const rightStile = new THREE.Mesh(
      new THREE.BoxGeometry(railWidth, doorHeight, doorDepth),
      doorFrameMat
    );
    rightStile.position.set(doorWidth - railWidth / 2, 0, 0);
    doorPivot.add(rightStile);

    // Top horizontal door rail
    const topRail = new THREE.Mesh(
      new THREE.BoxGeometry(doorWidth - railWidth * 2, railWidth, doorDepth),
      doorFrameMat
    );
    topRail.position.set(doorWidth / 2, doorHeight / 2 - railWidth / 2, 0);
    doorPivot.add(topRail);

    // Bottom horizontal door rail
    const bottomRail = new THREE.Mesh(
      new THREE.BoxGeometry(doorWidth - railWidth * 2, railWidth, doorDepth),
      doorFrameMat
    );
    bottomRail.position.set(doorWidth / 2, -doorHeight / 2 + railWidth / 2, 0);
    doorPivot.add(bottomRail);

    // Door observation glass window in center
    const windowW = doorWidth - railWidth * 2;
    const windowH = doorHeight - railWidth * 2;
    const doorGlassGeo = new THREE.BoxGeometry(windowW, windowH, 0.02);
    const doorGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.22,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 1.0,
      depthWrite: false,
    });
    const doorGlass = new THREE.Mesh(doorGlassGeo, doorGlassMat);
    doorGlass.position.set(doorWidth / 2, 0, 0);
    doorPivot.add(doorGlass);

    // Door window border outline
    const windowEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(doorGlassGeo),
      new THREE.LineBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.9 })
    );
    windowEdges.position.set(doorWidth / 2, 0, 0);
    doorPivot.add(windowEdges);

    // 2 Left Door Hinges
    const hingeGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.22, 16);
    [-0.75, 0.75].forEach((hy) => {
      const hinge = new THREE.Mesh(hingeGeo, darkTrimMat);
      hinge.position.set(0.02, hy, 0.02);
      doorPivot.add(hinge);
    });

    // Right Vertical Door Handle (Tutqich)
    const handleMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.25,
      metalness: 0.7,
    });
    const handleMountTop = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.14), handleMat);
    handleMountTop.position.set(doorWidth - 0.12, 0.32, 0.09);
    doorPivot.add(handleMountTop);

    const handleMountBot = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.14), handleMat);
    handleMountBot.position.set(doorWidth - 0.12, -0.32, 0.09);
    doorPivot.add(handleMountBot);

    const handleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.78, 16), handleMat);
    handleBar.position.set(doorWidth - 0.12, 0, 0.16);
    doorPivot.add(handleBar);

    // 6e. Inner chamber diagonal reference lines to center N5
    const corners = [
      new THREE.Vector3(-1.2, 1.2, 1.2),
      new THREE.Vector3(1.2, 1.2, 1.2),
      new THREE.Vector3(1.2, 1.2, -1.2),
      new THREE.Vector3(-1.2, 1.2, -1.2),
      new THREE.Vector3(-1.2, -1.2, 1.2),
      new THREE.Vector3(1.2, -1.2, 1.2),
      new THREE.Vector3(1.2, -1.2, -1.2),
      new THREE.Vector3(-1.2, -1.2, -1.2),
    ];
    const centerVec = new THREE.Vector3(0, 0, 0);

    const diagPoints: THREE.Vector3[] = [];
    corners.forEach((c) => {
      diagPoints.push(c);
      diagPoints.push(centerVec);
    });
    const diagGeo = new THREE.BufferGeometry().setFromPoints(diagPoints);
    const diagMat = new THREE.LineDashedMaterial({
      color: 0x64748b,
      dashSize: 0.1,
      gapSize: 0.08,
      transparent: true,
      opacity: 0.55,
    });
    const diagLines = new THREE.LineSegments(diagGeo, diagMat);
    diagLines.computeLineDistances();
    cubeGroup.add(diagLines);

    // 7. Measurement points (Spheres + Labels)
    const pointsGroup = new THREE.Group();
    rotGroup.add(pointsGroup);
    pointsGroupRef.current = pointsGroup;

    sphereMeshesRef.current.clear();
    haloMeshesRef.current.clear();
    spriteMaterialsRef.current.clear();

    CHAMBER_POINTS_CONFIG.forEach((pt) => {
      const isCenter = pt.isCenter;

      // Sphere geometry
      const radius = isCenter ? 0.22 : 0.17;
      const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);

      const sphereMat = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        emissive: 0x1e293b,
        roughness: 0.3,
        metalness: 0.3,
      });

      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(...pt.coord);
      sphere.userData = { id: pt.id, name: pt.nameUz, isCenter };
      pointsGroup.add(sphere);
      sphereMeshesRef.current.set(pt.id, sphere);

      // Outer Selection / Entered Halo
      const haloGeo = new THREE.RingGeometry(radius * 1.25, radius * 1.55, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x64748b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.set(...pt.coord);
      halo.lookAt(camera.position);
      pointsGroup.add(halo);
      haloMeshesRef.current.set(pt.id, halo);

      // Text Sprite Label
      const labelText = pt.id + (isCenter ? ' (M)' : '');
      const texture = createLabelTexture(labelText, false, false);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(pt.coord[0], pt.coord[1] + (isCenter ? 0.38 : 0.32), pt.coord[2]);
      sprite.scale.set(0.65, 0.32, 1);
      pointsGroup.add(sprite);
      spriteMaterialsRef.current.set(pt.id, spriteMat);
    });

    // 8. Animation loop (NO automatic rotation — cube only rotates when dragged by mouse)
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smoothly animate front door angle when toggled open/closed
      if (doorPivotRef.current) {
        const targetDoorAngle = isDoorOpenRef.current ? -0.62 : 0;
        doorPivotRef.current.rotation.y += (targetDoorAngle - doorPivotRef.current.rotation.y) * 0.15;
      }

      // Halos should always billboard face camera
      haloMeshesRef.current.forEach((halo) => {
        halo.lookAt(camera.position);
      });

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize observer
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth || 500;
      const h = container.clientHeight || 420;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [createLabelTexture, createControlPanelTexture]);

  // Update point sphere colors, halos, and label sprites dynamically when data changes or point selected
  useEffect(() => {
    sphereMeshesRef.current.forEach((mesh, id) => {
      const entered = isPointEntered(id);
      const isSelected = selectedPointId === id;
      const mat = mesh.material as THREE.MeshStandardMaterial;

      if (isSelected) {
        mat.color.setHex(0x2563eb); // Primary blue
        mat.emissive.setHex(0x1d4ed8);
      } else if (entered) {
        mat.color.setHex(0x10b981); // Emerald green
        mat.emissive.setHex(0x047857);
      } else {
        mat.color.setHex(0x64748b); // Slate
        mat.emissive.setHex(0x1e293b);
      }
    });

    haloMeshesRef.current.forEach((halo, id) => {
      const entered = isPointEntered(id);
      const isSelected = selectedPointId === id;
      const mat = halo.material as THREE.MeshBasicMaterial;

      if (isSelected) {
        mat.color.setHex(0x2563eb);
        mat.opacity = 0.85;
      } else if (entered) {
        mat.color.setHex(0x10b981);
        mat.opacity = 0.65;
      } else {
        mat.color.setHex(0x64748b);
        mat.opacity = 0.35;
      }
    });

    spriteMaterialsRef.current.forEach((spriteMat, id) => {
      const pt = CHAMBER_POINTS_CONFIG.find((p) => p.id === id);
      if (!pt) return;
      const entered = isPointEntered(id);
      const isSelected = selectedPointId === id;
      const labelText = pt.id + (pt.isCenter ? ' (M)' : '');
      const oldMap = spriteMat.map;
      spriteMat.map = createLabelTexture(labelText, entered, isSelected);
      spriteMat.needsUpdate = true;
      if (oldMap) oldMap.dispose();
    });
  }, [selectedPointId, pointsData, isPointEntered, createLabelTexture]);

  // Dynamically update Three.js background when theme mode changes
  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current) return;
    const bgColor = isDarkMode ? 0x0f172a : 0xffffff;
    sceneRef.current.background = new THREE.Color(bgColor);
    rendererRef.current.setClearColor(bgColor, 1);
  }, [isDarkMode]);

  // Mouse Drag Rotation & Raycasting for Point Click
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    dragStartPositionRef.current = { x: e.clientX, y: e.clientY };
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    if (!container || !cameraRef.current || !sceneRef.current) return;

    if (isDraggingRef.current) {
      const deltaX = e.clientX - previousMousePositionRef.current.x;

      if (rotationGroupRef.current) {
        rotationGroupRef.current.rotation.y += deltaX * 0.012;
        rotationGroupRef.current.rotation.x = 0;
        rotationGroupRef.current.rotation.z = 0;
      }

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Raycast for hover
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const spheres = Array.from(sphereMeshesRef.current.values());
    const intersects = raycaster.intersectObjects(spheres, false);

    if (intersects.length > 0) {
      const id = intersects[0].object.userData.id as ChamberPointId;
      setHoveredPoint(id);
      container.style.cursor = 'pointer';
    } else {
      setHoveredPoint(null);
      container.style.cursor = 'grab';
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    if (!container || !cameraRef.current) {
      isDraggingRef.current = false;
      return;
    }

    // If it was just a click (not a drag), trigger point selection
    const dx = Math.abs(e.clientX - dragStartPositionRef.current.x);
    const dy = Math.abs(e.clientY - dragStartPositionRef.current.y);

    if (dx < 6 && dy < 6) {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

      const spheres = Array.from(sphereMeshesRef.current.values());
      const intersects = raycaster.intersectObjects(spheres, false);

      if (intersects.length > 0) {
        const id = intersects[0].object.userData.id as ChamberPointId;
        onSelectPoint(id);
      }
    }

    isDraggingRef.current = false;
  };

  // Mobile Touch Gestures (Single finger horizontal rotation & tap selection)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      isDraggingRef.current = true;
      dragStartPositionRef.current = { x: touch.clientX, y: touch.clientY };
      previousMousePositionRef.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - previousMousePositionRef.current.x;

    if (rotationGroupRef.current) {
      rotationGroupRef.current.rotation.y += deltaX * 0.012;
      rotationGroupRef.current.rotation.x = 0;
      rotationGroupRef.current.rotation.z = 0;
    }

    previousMousePositionRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    if (!container || !cameraRef.current) {
      isDraggingRef.current = false;
      return;
    }

    // Tap detection on mobile touch screen
    const touch = e.changedTouches[0];
    if (touch) {
      const dx = Math.abs(touch.clientX - dragStartPositionRef.current.x);
      const dy = Math.abs(touch.clientY - dragStartPositionRef.current.y);

      if (dx < 12 && dy < 12) {
        const rect = container.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

        const spheres = Array.from(sphereMeshesRef.current.values());
        const intersects = raycaster.intersectObjects(spheres, false);

        if (intersects.length > 0) {
          const id = intersects[0].object.userData.id as ChamberPointId;
          onSelectPoint(id);
        }
      }
    }

    isDraggingRef.current = false;
  };

  // Reset orientation
  const resetOrientation = () => {
    if (rotationGroupRef.current) {
      rotationGroupRef.current.rotation.set(0, -0.28, 0);
    }
  };

  // Stats calculation for display
  const enteredCount = pointsData.filter((p) =>
    p.rows.some((r) => r.tStd !== '' && !isNaN(Number(String(r.tStd).replace(',', '.'))))
  ).length;

  const activeHoverPointData = hoveredPoint
    ? CHAMBER_POINTS_CONFIG.find((p) => p.id === hoveredPoint)
    : null;

  return (
    <div
      className={`relative flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm overflow-hidden transition-colors ${className}`}
    >
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10 transition-colors">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="font-semibold text-xs sm:text-sm tracking-wide text-slate-800 dark:text-slate-100 truncate">
            Quritish Shkafi 3D Modeli (9 Nuqta)
          </span>
          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono whitespace-nowrap shrink-0">
            {enteredCount}/9 to'ldirildi
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsDoorOpen((prev) => !prev)}
            title={isDoorOpen ? 'Shkaf eshigini yopish' : 'Shkaf eshigini ochish'}
            className={`px-2.5 py-1 text-xs rounded-lg border flex items-center space-x-1.5 whitespace-nowrap transition-all cursor-pointer ${
              isDoorOpen
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {isDoorOpen ? (
              <DoorOpen className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <DoorClosed className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{isDoorOpen ? 'Eshik: Ochiq' : 'Eshik: Yopiq'}</span>
          </button>

          <button
            type="button"
            onClick={resetOrientation}
            title="Dastlabki holatga qaytarish"
            className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D Canvas Mount - Touch and Mouse Responsive */}
      <div
        ref={mountRef}
        data-testid="chamber-cube-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          isDraggingRef.current = false;
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => {
          isDraggingRef.current = false;
        }}
        style={{ touchAction: 'none' }}
        className="w-full h-[380px] sm:h-[420px] bg-white dark:bg-slate-900 cursor-grab active:cursor-grabbing relative select-none touch-none transition-colors"
      />

      {/* Floating Hover Tooltip */}
      {activeHoverPointData && (
        <div className="absolute top-14 left-4 z-20 pointer-events-none bg-white/95 dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 shadow-lg max-w-xs transition-all backdrop-blur-xs">
          <div className="flex items-center space-x-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isPointEntered(activeHoverPointData.id) ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {activeHoverPointData.id} - {activeHoverPointData.nameUz}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{activeHoverPointData.positionDesc}</p>
          <div className="mt-1.5 text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
            {isPointEntered(activeHoverPointData.id) ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 inline" /> Qiymatlar kiritilgan (Yashil)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <CircleAlert className="w-3.5 h-3.5 text-slate-400 inline" /> Kiritish uchun ustiga bosing
              </span>
            )}
          </div>
        </div>
      )}

      {/* Bottom helper & 9-Points quick buttons */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-10 flex flex-wrap items-center justify-between gap-2 transition-colors">
        <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Yashil = Kiritilgan
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" /> Kulrang = Kiritilmagan
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> Ko'k = Tanlangan
          </span>
        </div>

        {/* Quick point select chips */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full">
          {CHAMBER_POINTS_CONFIG.map((pt) => {
            const entered = isPointEntered(pt.id);
            const isSelected = selectedPointId === pt.id;
            return (
              <button
                key={pt.id}
                type="button"
                onClick={() => onSelectPoint(pt.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold font-mono transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300 dark:ring-blue-700'
                    : entered
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={`${pt.id}: ${pt.nameUz}`}
              >
                {pt.id}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
