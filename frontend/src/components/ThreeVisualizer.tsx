import { Box } from 'lucide-react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { ThreeSceneSpec } from '../types/archive';

interface ThreeVisualizerProps {
  spec: ThreeSceneSpec;
}

export function ThreeVisualizer({ spec }: ThreeVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const width = el.clientWidth || 640;
    const height = 280;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#090E1C');

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.6, 7.2);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      return;
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.innerHTML = '';
    el.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0x88aaff, 0.9);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xe5b66a, 1.4);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    const group = new THREE.Group();
    scene.add(group);

    if (spec.mode === 'subglacial-radar') {
      // Bedrock terrain wireframe + translucent ice surface
      const bedGeo = new THREE.PlaneGeometry(7.5, 5, 32, 24);
      bedGeo.rotateX(-Math.PI / 2);
      const pos = bedGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const ridge = Math.sin(x * 1.1) * Math.cos(z * 1.2) * 0.65;
        const basin = Math.exp(-((x + 1.2) ** 2 + z ** 2) * 0.7) * -1.1;
        pos.setY(i, ridge + basin - 0.5);
      }
      bedGeo.computeVertexNormals();
      const bedMat = new THREE.MeshStandardMaterial({
        color: 0x3b66b8,
        wireframe: true,
      });
      group.add(new THREE.Mesh(bedGeo, bedMat));

      const iceGeo = new THREE.PlaneGeometry(7.5, 5, 12, 12);
      iceGeo.rotateX(-Math.PI / 2);
      iceGeo.translate(0, 0.95, 0);
      const iceMat = new THREE.MeshBasicMaterial({
        color: 0xa6c8ff,
        transparent: true,
        opacity: 0.22,
        wireframe: false,
      });
      group.add(new THREE.Mesh(iceGeo, iceMat));
    } else if (spec.mode === 'bathymetric-trench') {
      const geo = new THREE.PlaneGeometry(8, 5.5, 36, 26);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const trench = -2.2 * Math.exp(-((x - Math.sin(z * 0.5) * 0.7) ** 2) * 1.4);
        pos.setY(i, trench + 0.6);
      }
      geo.computeVertexNormals();
      group.add(
        new THREE.Mesh(
          geo,
          new THREE.MeshStandardMaterial({ color: 0x6c9eff, wireframe: true })
        )
      );
    } else if (spec.mode === 'spacetime-cone') {
      const funnelGeo = new THREE.PlaneGeometry(7.5, 7.5, 32, 32);
      funnelGeo.rotateX(-Math.PI / 2);
      const pos = funnelGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const r = Math.sqrt(x * x + z * z);
        pos.setY(i, -1.7 / (r + 0.55) + 0.7);
      }
      group.add(
        new THREE.Mesh(
          funnelGeo,
          new THREE.MeshBasicMaterial({ color: 0x6c9eff, wireframe: true, transparent: true, opacity: 0.65 })
        )
      );
      const coneGeo = new THREE.ConeGeometry(1.15, 2.1, 24, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: 0xe5b66a,
        wireframe: true,
        transparent: true,
        opacity: 0.7,
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.rotation.x = Math.PI;
      cone.position.y = 1.1;
      group.add(cone);
    } else if (spec.mode === 'antikythera-gears') {
      const ratios = [
        { r: 1.45, x: -0.7, y: 0, color: 0xe5b66a, teeth: 28 },
        { r: 0.9, x: 1.55, y: 0.25, color: 0x6c9eff, teeth: 18 },
        { r: 0.6, x: -0.7, y: 0.35, color: 0xb8ccf5, teeth: 14 },
      ];
      ratios.forEach((cfg) => {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(cfg.r, 0.08, 12, cfg.teeth),
          new THREE.MeshStandardMaterial({ color: cfg.color, metalness: 0.5, roughness: 0.35 })
        );
        ring.rotation.x = Math.PI / 2.2;
        ring.position.set(cfg.x, cfg.y, 0);
        group.add(ring);
      });
    } else {
      // Galactic Halo
      const count = 900;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const blue = new THREE.Color('#6C9EFF');
      const amber = new THREE.Color('#E5B66A');

      for (let i = 0; i < count; i++) {
        const isHalo = i > 550;
        if (isHalo) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const r = 1.6 + Math.random() * 2.1;
          positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
          positions[i * 3 + 1] = r * Math.cos(phi) * 0.85;
          positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
          colors[i * 3] = blue.r;
          colors[i * 3 + 1] = blue.g;
          colors[i * 3 + 2] = blue.b;
        } else {
          const arm = i % 2;
          const radius = Math.random() * 2.1;
          const angle = radius * 2.4 + arm * Math.PI;
          positions[i * 3] = Math.cos(angle) * radius;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 0.14;
          positions[i * 3 + 2] = Math.sin(angle) * radius;
          colors[i * 3] = amber.r;
          colors[i * 3 + 1] = amber.g;
          colors[i * 3 + 2] = amber.b;
        }
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const pMat = new THREE.PointsMaterial({ size: 0.06, vertexColors: true });
      group.add(new THREE.Points(pGeo, pMat));
    }

    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      group.rotation.y += 0.0045;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!el) return;
      const w = el.clientWidth || 640;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [spec]);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0E1527] p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#6C9EFF]">
            <Box className="h-3.5 w-3.5" aria-hidden="true" />
            Interactive 3D Scientific Model
          </span>
          <h4 className="font-editorial text-xl font-semibold text-white">{spec.title}</h4>
        </div>
      </div>
      <div
        ref={containerRef}
        aria-label={spec.title}
        className="h-[280px] w-full overflow-hidden rounded-xl border border-white/8 bg-[#090E1C]"
      />
      <p className="mt-3 text-xs text-[#A8B3CF]">{spec.caption}</p>
    </div>
  );
}
