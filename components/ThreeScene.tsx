"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── fBm Noise (4-octave fractal Brownian motion) ────────────────────────────
function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerpN(a: number, b: number, t: number) { return a + t * (b - a); }

const perm = (() => {
  const arr = Array.from({ length: 256 }, (_: unknown, i: number) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const p = new Uint8Array(512);
  for (let i = 0; i < 512; i++) p[i] = arr[i & 255];
  return p;
})();

function grad(hash: number, x: number, y: number, z: number) {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
  return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
}

function noise(x: number, y: number, z: number): number {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
  x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
  const u = fade(x), v = fade(y), w = fade(z);
  const A = perm[X] + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z;
  const B = perm[X + 1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z;
  return lerpN(
    lerpN(lerpN(grad(perm[AA], x, y, z), grad(perm[BA], x - 1, y, z), u),
          lerpN(grad(perm[AB], x, y - 1, z), grad(perm[BB], x - 1, y - 1, z), u), v),
    lerpN(lerpN(grad(perm[AA + 1], x, y, z - 1), grad(perm[BA + 1], x - 1, y, z - 1), u),
          lerpN(grad(perm[AB + 1], x, y - 1, z - 1), grad(perm[BB + 1], x - 1, y - 1, z - 1), u), v), w
  );
}

// 4-octave fBm
function fbm(x: number, y: number, z: number): number {
  let val = 0, amp = 0.5, freq = 1.0;
  for (let i = 0; i < 4; i++) {
    val += noise(x * freq, y * freq, z * freq) * amp;
    amp *= 0.5;
    freq *= 2.1;
  }
  return val;
}

// ─── Contour Shader ───────────────────────────────────────────────────────────
// Near-black base, thin teal iso-lines, Fresnel rim glow. Never solid teal.
const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying float vElevation;

  void main() {
    // vElevation = displacement from base sphere radius (1.6)
    // This encodes the noise amount applied in JS
    vElevation = length(position);

    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vNormal = normalize(normalMatrix * normal);

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying float vElevation;

  uniform float uTime;
  uniform vec3 uKeyLight;

  // Camera position is a built-in Three.js uniform
  // (passed automatically when using ShaderMaterial with lights: false)
  // We'll compute it from vWorldPos via the inverse of what we know.

  void main() {
    // ── Contour iso-lines ──────────────────────────────────────────────
    float freq = 9.0;
    float e = vElevation * freq;

    // Anti-aliased iso-lines using screen-space derivatives (fwidth)
    float fw = fwidth(e);
    // Distance from nearest iso-line (0 = on a line)
    float distToLine = abs(fract(e + 0.5) - 0.5);
    float lineWidth = 0.018;
    float line = 1.0 - smoothstep(lineWidth, lineWidth + fw * 2.0, distToLine);

    // ── Fresnel rim ────────────────────────────────────────────────────
    // Reconstruct view direction from world position
    // Three.js passes cameraPosition as a built-in in ShaderMaterial
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float NdotV = max(dot(normalize(vNormal), viewDir), 0.0);
    float fresnel = pow(1.0 - NdotV, 3.0);

    // ── Lighting — soft diffuse for depth ──────────────────────────────
    vec3 lightDir = normalize(uKeyLight - vWorldPos);
    float NdotL = max(dot(normalize(vNormal), lightDir), 0.0);
    float diffuse = NdotL * 0.3;

    // ── Specular highlight (moving) ────────────────────────────────────
    vec3 halfVec = normalize(viewDir + lightDir);
    float spec = pow(max(dot(normalize(vNormal), halfVec), 0.0), 32.0) * 0.15;

    // ── Color composition ──────────────────────────────────────────────
    // Base: near-black with very faint depth shading
    vec3 base = vec3(0.025 + diffuse * 0.5, 0.03 + diffuse * 0.5, 0.03 + diffuse * 0.5);

    // Line color: muted teal at partial opacity
    vec3 lineCol = vec3(0.18, 0.72, 0.65);

    // Rim: slightly brighter teal, only at silhouette
    vec3 rimCol = vec3(0.22, 0.80, 0.72);

    // Specular: almost-white glint
    vec3 specCol = vec3(0.6, 0.9, 0.85);

    vec3 color = base;
    color = mix(color, lineCol, line * 0.88);        // draw iso-lines
    color = mix(color, rimCol, fresnel * 0.55);      // Fresnel rim glow
    color += specCol * spec;                         // moving specular

    // Alpha: lines are nearly opaque, base has faint fill for depth
    float alpha = line * 0.82
                + fresnel * 0.28
                + spec * 0.8
                + 0.04;                              // tiny base so it's not pure void
    alpha = clamp(alpha, 0.0, 1.0);

    gl_FragColor = vec4(color, alpha);
  }
`;

// ─── Organic Sphere ───────────────────────────────────────────────────────────
function OrganicSphere({
  mouseRef,
  scrollRef,
}: {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
  scrollRef: React.MutableRefObject<number>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const currentTilt = useRef({ x: 0, y: 0 });
  const currentScale = useRef(1.0);

  // Build noise-displaced icosahedron
  const geometry = useMemo(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 700;
    // Detail 5 = 20480 faces (smooth), detail 4 = 5120 (mobile)
    const detail = isMobile ? 4 : 5;
    const geo = new THREE.IcosahedronGeometry(1.6, detail);
    const pos = geo.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const len = Math.sqrt(x * x + y * y + z * z);
      const nx = x / len, ny = y / len, nz = z / len;

      // 4-octave fBm for organic silhouette
      const displacement = fbm(nx * 1.8, ny * 1.8, nz * 1.8) * 0.55;
      const r = 1.6 * (1.0 + displacement);
      pos.setXYZ(i, nx * r, ny * r, nz * r);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uKeyLight: { value: new THREE.Vector3(4, 6, 5) },
  }), []);

  useFrame((state) => {
    if (!meshRef.current || !matRef.current) return;
    const t = state.clock.elapsedTime;

    // 1. Auto-rotation
    meshRef.current.rotation.y += 0.0025;

    // 2. Idle float (breathing — Y and subtle X)
    meshRef.current.position.y = Math.sin(t * 0.45) * 0.07;
    meshRef.current.position.x = Math.sin(t * 0.28) * 0.035;

    // 3. Mouse tilt (damped lerp toward target)
    const targetTiltX = mouseRef.current.y * 0.4;
    const targetTiltY = mouseRef.current.x * 0.4;
    currentTilt.current.x += (targetTiltX - currentTilt.current.x) * 0.04;
    currentTilt.current.y += (targetTiltY - currentTilt.current.y) * 0.04;
    meshRef.current.rotation.x = currentTilt.current.x;
    // rotation.y already accumulates — apply mouse offset via a quaternion offset
    // Simple: just add to current rotation each frame (handled by the lerp)

    // 4. Scroll-tied scale (subtle — scales down as user scrolls)
    const targetScale = 1.0 - scrollRef.current * 0.12;
    currentScale.current += (targetScale - currentScale.current) * 0.06;
    const s = Math.max(0.6, currentScale.current);
    meshRef.current.scale.setScalar(s);

    // 5. Shader time + moving key light
    matRef.current.uniforms.uTime.value = t;
    // Slowly orbit the key light for moving specular
    matRef.current.uniforms.uKeyLight.value.set(
      Math.sin(t * 0.3) * 6,
      4 + Math.cos(t * 0.2) * 2,
      5
    );
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ─── Ambient particles ────────────────────────────────────────────────────────
function Particles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 7;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 7;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1;
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.015;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.022}
        color="#2dd4bf"
        transparent
        opacity={0.25}
        sizeAttenuation
      />
    </points>
  );
}

// ─── Static SVG fallback ──────────────────────────────────────────────────────
function StaticFallback() {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox="0 0 300 300" width="280" height="280" xmlns="http://www.w3.org/2000/svg"
        aria-label="Abstract contour sphere illustration">
        {/* Concentric contour circles */}
        {[125, 105, 85, 65, 45, 25].map((r, i) => (
          <circle key={`c${i}`} cx="150" cy="150" r={r}
            fill="none" stroke={`rgba(45,212,191,${0.08 + i * 0.05})`} strokeWidth="0.8" />
        ))}
        {/* Vertical ellipses */}
        {[110, 80, 50, 25].map((rx, i) => (
          <ellipse key={`e${i}`} cx="150" cy="150" rx={rx} ry={125}
            fill="none" stroke="rgba(45,212,191,0.1)" strokeWidth="0.6" />
        ))}
        {/* Horizontal ellipses */}
        {[110, 80, 50, 25].map((ry, i) => (
          <ellipse key={`h${i}`} cx="150" cy="150" rx={125} ry={ry}
            fill="none" stroke="rgba(45,212,191,0.1)" strokeWidth="0.6" />
        ))}
        {/* Outer ring — brighter */}
        <circle cx="150" cy="150" r="124" fill="none" stroke="rgba(45,212,191,0.38)" strokeWidth="1" />
      </svg>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function ThreeScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0); // 0..1 fraction of first viewport height
  const [visible, setVisible] = useState(true);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const [webglOk, setWebglOk] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    setIsMobile(window.innerWidth < 700);

    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl") ?? c.getContext("experimental-webgl");
      if (!gl) setWebglOk(false);
    } catch { setWebglOk(false); }

    // Mouse tracking (normalized -1..1)
    const onMove = (e: MouseEvent) => {
      if (mq.matches) return;
      mouseRef.current.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    // Scroll tracking (0 = top, 1 = 1 viewport scrolled)
    const onScroll = () => {
      scrollRef.current = Math.min(window.scrollY / window.innerHeight, 1);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    // Pause render when off-screen
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  if (!webglOk || prefersReduced) {
    return <div ref={containerRef} style={{ width: "100%", height: "100%" }}><StaticFallback /></div>;
  }

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }} aria-hidden="true">
      <Canvas
        dpr={[1, Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, isMobile ? 1 : 1.5)]}
        camera={{ position: [0, 0, 5.5], fov: 40 }}
        gl={{
          alpha: true,
          antialias: !isMobile,
          powerPreference: "high-performance",
        }}
        frameloop={visible ? "always" : "never"}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.15} />
        <Particles count={isMobile ? 40 : 90} />
        <OrganicSphere mouseRef={mouseRef} scrollRef={scrollRef} />
      </Canvas>
    </div>
  );
}
