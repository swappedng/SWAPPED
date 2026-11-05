"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const PHONES = [
  "/phones/hero-phones/phone_img1.png",
  "/phones/hero-phones/phone_img2.png",
  "/phones/hero-phones/phone_img3.png",
  "/phones/hero-phones/phone_img4.png",
];

const HOLD = 2.6;
const MORPH = 1.8;

const vertexShader = `
  uniform float p, t;
  varying vec2 vUv;
  varying float vB;

  void main() {
    vUv = uv;
    float k = sin(3.14159 * p);
    vB = k;
    vec3 q = position;
    q.z += sin(q.y * 5. + t * 3.) * .22 * k
      + cos(q.x * 4. - t * 2.) * .12 * k;
    q.x += sin(q.y * 6. + t * 4.) * .08 * k;
    q.y += sin(q.x * 5. + t * 3.) * .05 * k;
    q.xy *= 1. - .1 * k;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(q, 1.);
  }
`;

const fragmentShader = `
  uniform sampler2D a, b;
  uniform float p, t;
  varying vec2 vUv;
  varying float vB;

  float h(vec2 s) {
    return fract(sin(dot(s, vec2(127.1, 311.7))) * 43758.5453);
  }

  float n(vec2 s) {
    vec2 i = floor(s), f = fract(s);
    f = f * f * (3. - 2. * f);
    return mix(
      mix(h(i), h(i + vec2(1., 0.)), f.x),
      mix(h(i + vec2(0., 1.)), h(i + vec2(1., 1.)), f.x),
      f.y
    );
  }

  void main() {
    vec2 w = vec2(
      n(vUv * 4. + vec2(t)),
      n(vUv * 4. - vec2(t) + vec2(9.))
    ) - .5;
    vec2 uv = vUv + w * .09 * vB;

    float edge = vUv.y * .7 + n(vUv * 3. + vec2(t * .5)) * .3;
    float m = smoothstep(p * 1.3 - .3, p * 1.3, edge);

    float ca = .012 * vB;
    vec4 A = vec4(
      texture2D(a, uv + vec2(ca, 0.)).r,
      texture2D(a, uv).g,
      texture2D(a, uv - vec2(ca, 0.)).b,
      texture2D(a, uv).a
    );
    vec4 B = vec4(
      texture2D(b, uv + vec2(ca, 0.)).r,
      texture2D(b, uv).g,
      texture2D(b, uv - vec2(ca, 0.)).b,
      texture2D(b, uv).a
    );

    vec4 c = mix(B, A, m);
    float glow = 1. - smoothstep(0., .1, abs(m - .5));
    c.rgb += vec3(.9, 1., .6) * glow * vB * .25 * c.a;

    float sheen = (1. - smoothstep(
      0., .07, abs(vUv.x + vUv.y * .5 - fract(t * .12) * 2. + .3)
    )) * .22;
    c.rgb += sheen * c.a;

    gl_FragColor = c;
  }
`;

const ease = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

export function SwapIllustration() {
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const frameElement = frameRef.current;
    const fallbackImage = imageRef.current;
    const canvas = canvasRef.current;
    if (!frameElement || !fallbackImage || !canvas) return;

    const context = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
    });
    if (!context) {
      console.warn("WebGL 2 is unavailable; showing the static hero phone.");
      return;
    }

    const renderer = new THREE.WebGLRenderer({
      canvas,
      context,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
    camera.position.z = 5.5;

    const loader = new THREE.TextureLoader();
    let loadedTextures = 0;
    let texturesReady = false;
    let disposed = false;
    let elapsed = 0;
    let startedAt: number | null = null;
    let animationFrame: number | null = null;
    let lastCycle = -1;
    let isInView = !("IntersectionObserver" in window);
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let pointerX = 0;
    let pointerY = 0;

    const textures = PHONES.map((src) =>
      loader.load(
        src,
        (texture) => {
          if (disposed) {
            texture.dispose();
            return;
          }
          texture.colorSpace = THREE.SRGBColorSpace;
          loadedTextures += 1;
          if (loadedTextures !== PHONES.length) return;

          texturesReady = true;
          fallbackImage.style.opacity = "0";
          canvas.style.opacity = "1";
          render();
          if (motionPreference.matches) {
            drawStaticPhone();
          } else {
            resumeAnimation();
          }
        },
        undefined,
        (error) => {
          if (!disposed) {
            console.error(`Unable to load hero phone image: ${src}`, error);
          }
        },
      ),
    );

    const uniforms = {
      a: { value: textures[0] },
      b: { value: textures[1] },
      p: { value: 0 },
      t: { value: 0 },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      side: THREE.DoubleSide,
      vertexShader,
      fragmentShader,
    });
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.3, 2.83, 64, 64),
      material,
    );
    scene.add(mesh);

    function render() {
      renderer.render(scene, camera);
    }

    function drawStaticPhone() {
      uniforms.a.value = textures[0];
      uniforms.b.value = textures[1];
      uniforms.p.value = 0;
      uniforms.t.value = 0;
      lastCycle = -1;
      mesh.rotation.set(0, 0, 0);
      mesh.position.y = 0;
      render();
    }

    function animate(now: number) {
      if (startedAt === null) return;

      const seconds = elapsed + (now - startedAt) / 1000;
      const cycleLength = HOLD + MORPH;
      const cycle = Math.floor(seconds / cycleLength);
      const phase = seconds % cycleLength;
      const progress =
        phase < HOLD ? 0 : ease((phase - HOLD) / MORPH);

      if (cycle !== lastCycle) {
        lastCycle = cycle;
        uniforms.a.value = textures[cycle % PHONES.length];
        uniforms.b.value = textures[(cycle + 1) % PHONES.length];
      }

      uniforms.p.value = progress;
      uniforms.t.value = seconds;

      const wobble = Math.sin(Math.PI * progress);
      mesh.rotation.y +=
        (pointerX * 0.7 + Math.sin(seconds * 0.8) * 0.15 + wobble * 0.5 -
          mesh.rotation.y) *
        0.06;
      mesh.rotation.x += (pointerY * 0.4 - mesh.rotation.x) * 0.06;
      mesh.position.y = Math.sin(seconds * 1.3) * 0.05;

      render();
      animationFrame = window.requestAnimationFrame(animate);
    }

    function resumeAnimation() {
      if (
        !texturesReady ||
        !isInView ||
        document.hidden ||
        motionPreference.matches ||
        animationFrame !== null
      ) {
        return;
      }

      startedAt = performance.now();
      animationFrame = window.requestAnimationFrame(animate);
    }

    function pauseAnimation() {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
      if (startedAt !== null) {
        elapsed += (performance.now() - startedAt) / 1000;
        startedAt = null;
      }
    }

    function resize() {
      const bounds = frameElement?.getBoundingClientRect();
      if (!bounds) return;
      const { width, height } = bounds;
      if (width === 0 || height === 0) return;

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      if (texturesReady && animationFrame === null) render();
    }

    function handlePointerMove(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      pointerX = event.clientX / window.innerWidth - 0.5;
      pointerY = event.clientY / window.innerHeight - 0.5;
    }

    function resetPointer() {
      pointerX = 0;
      pointerY = 0;
    }

    function handleMotionChange() {
      if (motionPreference.matches) {
        pauseAnimation();
        if (texturesReady) drawStaticPhone();
      } else {
        resumeAnimation();
      }
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        pauseAnimation();
      } else {
        resumeAnimation();
      }
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(frameElement);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove);
    frameElement.addEventListener("pointerleave", resetPointer);
    motionPreference.addEventListener("change", handleMotionChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const visibilityObserver =
      "IntersectionObserver" in window
        ? new IntersectionObserver(([entry]) => {
            isInView = entry.isIntersecting;
            if (isInView) {
              resumeAnimation();
            } else {
              pauseAnimation();
            }
          })
        : null;
    visibilityObserver?.observe(frameElement);

    resize();

    return () => {
      disposed = true;
      pauseAnimation();
      resizeObserver.disconnect();
      visibilityObserver?.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      frameElement.removeEventListener("pointerleave", resetPointer);
      motionPreference.removeEventListener("change", handleMotionChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      textures.forEach((texture) => texture.dispose());
      mesh.geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <figure
      data-landing-reveal
      className="relative mx-auto mt-5 grid max-w-[720px] items-end sm:mt-4"
      aria-label="Illustrations of iPhones changing through the generations."
    >
      <div className="relative flex h-[168px] w-full items-end justify-center sm:h-[224px]">
        <div
          ref={frameRef}
          className="relative aspect-[2.3/2.83] h-full"
        >
          <Image
            ref={imageRef}
            src={PHONES[0]}
            alt=""
            fill
            sizes="(max-width: 639px) 137px, 183px"
            priority
            draggable={false}
            className="select-none object-fill mix-blend-multiply transition-opacity duration-300 motion-reduce:transition-none"
          />
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="absolute inset-0 h-full w-full opacity-0 mix-blend-multiply transition-opacity duration-300 motion-reduce:transition-none"
          />
        </div>
      </div>
    </figure>
  );
}
