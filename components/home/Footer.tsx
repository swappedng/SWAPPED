"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import * as THREE from "three";

THREE.ColorManagement.enabled = false;

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = vec4(position, 1.); }
`;

const FRAGMENT = /* glsl */ `
  uniform sampler2D tex;
  uniform vec2 m;
  uniform float t, s, rev, asp;
  uniform vec3 base, dotCol, vio, lime;
  varying vec2 vUv;

  void main(){
    vec2 uv = vUv;
    float rr = clamp(rev*1.7 - uv.x*.7, 0., 1.);
    float e = 1. - pow(1. - rr, 3.);
    uv.y += (1. - e) * .45;

    vec2 d = uv - m; d.x *= asp;
    float dist = length(d);
    float w = sin(dist*34. - t*5.) * exp(-dist*5.) * s;
    vec2 dir = normalize(d + 1e-4); dir.x /= asp;
    uv += dir * w * .03;
    uv.y += sin(uv.x*9. + t*1.2) * .004 * s;
    uv.x += sin(uv.y*7. + t) * .003 * s;

    vec4 c = texture2D(tex, uv);
    float g = exp(-dist*4.) * s;
    vec3 letters = mix(base, vio, g*.55);
    vec3 dotc = mix(dotCol, lime, clamp(g*1.4, 0., 1.));
    vec3 col = c.g > c.r ? dotc : letters;
    gl_FragColor = vec4(col, c.a * e);
  }
`;

async function makeWordmark() {
  await document.fonts.load('700 200px "Inter Tight"');

  const width = 2048;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not create footer wordmark canvas");

  const fontFamily = '"Inter Tight", system-ui, sans-serif';
  context.font = `700 200px ${fontFamily}`;
  const wordWidth =
    context.measureText("swapped").width + context.measureText(".").width;
  const fontSize = (200 * width * 0.97) / wordWidth;
  const font = `700 ${fontSize}px ${fontFamily}`;
  context.font = font;

  const word = context.measureText("swapped");
  const dot = context.measureText(".");
  const ascent = Math.max(
    word.actualBoundingBoxAscent,
    dot.actualBoundingBoxAscent,
  );
  const descent = word.actualBoundingBoxDescent;
  canvas.width = width;
  canvas.height = Math.ceil((ascent + descent) * 1.2);
  context.font = font;

  const y = canvas.height / 2 + (ascent - descent) / 2;
  const x = (width - word.width - dot.width) / 2;
  context.fillStyle = "#f00";
  context.fillText("swapped", x, y);
  context.fillStyle = "#0f0";
  context.fillText(".", x + word.width, y);

  return canvas;
}

export function Footer({
  email = "swapped.ng@gmail.com",
  designer = "Funmi Amusan",
  designerUrl = "https://funmiamusan.com",
  tagline = "Upgrade your iPhone without paying full price.",
}: {
  email?: string;
  designer?: string;
  designerUrl?: string;
  tagline?: string;
}) {
  return (
    <FooterContent
      email={email}
      designer={designer}
      designerUrl={designerUrl}
      tagline={tagline}
    />
  );
}

function FooterContent({
  email,
  designer,
  designerUrl,
  tagline,
}: {
  email: string;
  designer: string;
  designerUrl: string;
  tagline: string;
}) {
  const footerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const footer = footerRef.current;
    const canvas = canvasRef.current;
    if (!footer || !canvas) return;

    let frame = 0;
    let cancelled = false;
    let renderer: THREE.WebGLRenderer | null = null;
    let texture: THREE.CanvasTexture | null = null;
    let material: THREE.ShaderMaterial | null = null;
    let observer: IntersectionObserver | null = null;
    const cleanups: (() => void)[] = [];

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        premultipliedAlpha: false,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const uniforms = {
        tex: { value: null as THREE.Texture | null },
        m: { value: new THREE.Vector2(0.5, 0.5) },
        t: { value: 0 },
        s: { value: 0 },
        rev: { value: 0 },
        asp: { value: 3 },
        base: { value: new THREE.Color("#e3e4e0") },
        dotCol: { value: new THREE.Color("#e6e1f5") },
        vio: { value: new THREE.Color("#7B4DFF") },
        lime: { value: new THREE.Color("#D4F55C") },
      };

      material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        transparent: true,
        blending: THREE.NoBlending,
      });
      const geometry = new THREE.PlaneGeometry(2, 2);
      scene.add(new THREE.Mesh(geometry, material));
      cleanups.push(() => geometry.dispose());

      makeWordmark()
        .then((wordmark) => {
          if (cancelled) return;
          texture = new THREE.CanvasTexture(wordmark);
          uniforms.tex.value = texture;
          uniforms.asp.value = wordmark.width / wordmark.height;
          canvas.style.aspectRatio = `${wordmark.width} / ${wordmark.height}`;

          const resize = () =>
            renderer?.setSize(canvas.clientWidth, canvas.clientHeight, false);
          resize();
          window.addEventListener("resize", resize);
          cleanups.push(() => window.removeEventListener("resize", resize));

          let visible = false;
          let firstVisibleAt = 0;
          let lastPointerMove = -Infinity;
          const pointer = new THREE.Vector2(0.5, 0.5);
          const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;

          observer = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible && !firstVisibleAt) firstVisibleAt = performance.now();
          });
          observer.observe(canvas);

          const onPointerMove = (event: PointerEvent) => {
            const bounds = canvas.getBoundingClientRect();
            pointer.set(
              (event.clientX - bounds.left) / bounds.width,
              1 - (event.clientY - bounds.top) / bounds.height,
            );
            lastPointerMove = performance.now();
          };
          footer.addEventListener("pointermove", onPointerMove);
          cleanups.push(() =>
            footer.removeEventListener("pointermove", onPointerMove),
          );

          const startTime = performance.now();
          const render = () => {
            frame = requestAnimationFrame(render);
            if (!visible) return;

            const now = performance.now();
            const time = (now - startTime) / 1000;
            uniforms.t.value = time;

            if (reducedMotion) {
              uniforms.rev.value = 1;
              uniforms.s.value = 0;
            } else {
              uniforms.rev.value = Math.min(1, (now - firstVisibleAt) / 1500);
              const pointerIsActive = now - lastPointerMove < 2000;
              const target = pointerIsActive
                ? pointer
                : new THREE.Vector2(
                    0.5 + 0.35 * Math.sin(time * 0.5),
                    0.5 + 0.1 * Math.cos(time * 0.7),
                  );
              uniforms.m.value.lerp(target, 0.1);
              uniforms.s.value +=
                ((pointerIsActive ? 1 : 0.3) - uniforms.s.value) * 0.06;
            }

            renderer?.render(scene, camera);
          };
          render();
        })
        .catch(() => setFallback(true));
    } catch {
      setFallback(true);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      cleanups.forEach((cleanup) => cleanup());
      texture?.dispose();
      material?.dispose();
      renderer?.dispose();
    };
  }, []);

  return (
    <footer
      className="mx-auto box-border w-full max-w-[1440px] overflow-hidden  px-[clamp(24px,5.3vw,76px)] pt-16 text-[#192331] max-[700px]:pt-12"
      ref={footerRef}
    >
      {/* <div className="grid min-h-[260px] grid-cols-[minmax(0,1fr)_minmax(240px,1fr)_minmax(140px,0.6fr)] items-start gap-[clamp(32px,6vw,88px)] max-[700px]:min-h-0 max-[700px]:grid-cols-2 max-[700px]:gap-x-6 max-[700px]:gap-y-10 max-[700px]:pb-12">
        <div>
          <p className="mb-[18px] text-xs font-semibold uppercase tracking-[0.08em] text-[#69717d]">
            Get in touch
          </p>
          <a
            className="text-[clamp(18px,2vw,24px)] font-medium tracking-[-0.035em] text-[#192331] no-underline transition-colors hover:text-[#4c00bd]"
            href={`mailto:${email}`}
          >
            {email}
          </a>
          <p className="mt-5 text-sm leading-[1.65] text-[#69717d]">
            Lagos, Nigeria
          </p>
        </div>

        <div className="flex flex-col items-center gap-5 pt-10 text-center max-[700px]:col-span-full max-[700px]:row-start-2 max-[700px]:items-start max-[700px]:pt-0 max-[700px]:text-left">
          <Link
            href="/tradein"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#090909] px-5 text-xs font-semibold text-white transition-colors hover:bg-[#292929] focus-visible:outline-2 focus-visible:outline-[#4a00bd] focus-visible:outline-offset-3 sm:h-11 sm:px-6 sm:text-sm"
          >
            Swap iPhone
          </Link>
        </div>

        <nav
          className="flex flex-col items-end gap-[14px] max-[700px]:items-end"
          aria-label="Footer navigation"
        >
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#69717d]">
            Explore
          </p>
          <Link
            className="text-sm text-[#192331] no-underline transition-colors hover:text-[#4c00bd]"
            href="/#how-it-works"
          >
            How it works
          </Link>
          <Link
            className="text-sm text-[#192331] no-underline transition-colors hover:text-[#4c00bd]"
            href="/#stories"
          >
            Customer stories
          </Link>
          <Link
            className="text-sm text-[#192331] no-underline transition-colors hover:text-[#4c00bd]"
            href="/#faqs"
          >
            FAQs
          </Link>
          <Link
            className="text-sm text-[#192331] no-underline transition-colors hover:text-[#4c00bd]"
            href="/tradein"
          >
            Start a swap
          </Link>
        </nav>
      </div> */}

      {fallback ? (
        <div
          className="animate-footer-wordmark-rise w-full overflow-hidden whitespace-nowrap text-center text-[clamp(90px,22vw,300px)] font-bold leading-[0.78] tracking-[-0.085em] text-[#e3e4e0] motion-reduce:animate-none max-[700px]:text-[23vw]"
          role="img"
          aria-label="Swapped"
        >
          swapped<span className="text-[#e6e1f5]">.</span>
        </div>
      ) : (
        <canvas
          id="wm"
          className=" block aspect-[3/1] w-full touch-pan-y"
          ref={canvasRef}
          role="img"
          aria-label="Swapped"
        />
      )}
      <div className="flex flex-wrap justify-between gap-4 py-6 text-[13px] text-[#69717d] max-[700px]:flex-col max-[700px]:gap-2.5">
        <span>© {new Date().getFullYear()} Swapped. All rights reserved.</span>
        <span>
          Designed and built by{" "}
          <a
            className="text-inherit underline decoration-[#c9b8ff] underline-offset-[3px] hover:text-[#4c00bd]"
            href={designerUrl}
            target="_blank"
            rel="noreferrer"
          >
            {designer}
          </a>
        </span>
      </div>
    </footer>
  );
}
