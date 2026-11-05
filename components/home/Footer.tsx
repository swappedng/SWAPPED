"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import * as THREE from "three";
import "./Footer.css";

// Keep raw hex colours in the shader (newer three.js versions convert colours by default)
THREE.ColorManagement.enabled = false;

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = vec4(position, 1.); }
`;

const FRAGMENT = /* glsl */ `
  uniform sampler2D tex;
  uniform vec2 m;                 // pointer position (0-1)
  uniform float t, s, rev, asp;   // time, ripple strength, reveal progress, aspect ratio
  uniform vec3 base, dotCol, vio, lime;
  varying vec2 vUv;

  void main(){
    vec2 uv = vUv;

    // entrance: letters rise in one after another, left to right
    float rr = clamp(rev*1.7 - uv.x*.7, 0., 1.);
    float e = 1. - pow(1. - rr, 3.);
    uv.y += (1. - e) * .45;

    // ripple radiating from the pointer
    vec2 d = uv - m; d.x *= asp;
    float dist = length(d);
    float w = sin(dist*34. - t*5.) * exp(-dist*5.) * s;
    vec2 dir = normalize(d + 1e-4); dir.x /= asp;
    uv += dir * w * .03;

    // gentle ambient wobble
    uv.y += sin(uv.x*9. + t*1.2) * .004 * s;
    uv.x += sin(uv.y*7. + t) * .003 * s;

    vec4 c = texture2D(tex, uv);

    // colour: grey letters, tinted violet near the pointer; dot turns lime
    float g = exp(-dist*4.) * s;
    vec3 letters = mix(base, vio, g*.55);
    vec3 dotc = mix(dotCol, lime, clamp(g*1.4, 0., 1.));

    // red channel = letters, green channel = the full stop
    vec3 col = c.g > c.r ? dotc : letters;
    gl_FragColor = vec4(col, c.a * e);
  }
`;

// Draws "swapped." onto a 2D canvas (letters in red, the dot in green) to use as a texture
async function makeWordmark() {
  try {
    await document.fonts.load('700 200px "Inter Tight"');
  } catch {}
  const W = 2048;
  const c = document.createElement("canvas");
  const x = c.getContext("2d");
  if (!x) throw new Error("Could not get canvas context");
  const fam = '"Inter Tight", system-ui, sans-serif';

  x.font = `700 200px ${fam}`;
  const tw = x.measureText("swapped").width + x.measureText(".").width;
  const fs = (200 * W * 0.97) / tw; // fit the word to the canvas width
  const F = `700 ${fs}px ${fam}`;
  x.font = F;

  const m1 = x.measureText("swapped");
  const m2 = x.measureText(".");
  const asc = Math.max(m1.actualBoundingBoxAscent, m2.actualBoundingBoxAscent);
  const des = m1.actualBoundingBoxDescent;
  const H = Math.ceil((asc + des) * 1.2);

  c.width = W;
  c.height = H;
  x.font = F; // resizing resets the context
  const y = H / 2 + (asc - des) / 2;
  const x0 = (W - m1.width - m2.width) / 2;
  x.fillStyle = "#f00";
  x.fillText("swapped", x0, y);
  x.fillStyle = "#0f0";
  x.fillText(".", x0 + m1.width, y);
  return c;
}

export function Footer({
  email = "hello@swapped.com",
  designer = "Funmi Amusan",
  designerUrl = "https://funmiamusan.com",
  tagline = "Upgrade your iPhone without paying full price.",
}: {
  email?: string;
  designer?: string;
  designerUrl?: string;
  tagline?: string;
}) {
  const footRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const box = footRef.current;
    const cv = canvasRef.current;
    if (!cv || !box) return;

    const css = (n: string) =>
      getComputedStyle(box).getPropertyValue(n).trim() || "#ccc";
    let raf = 0,
      cancelled = false,
      renderer: THREE.WebGLRenderer | null = null,
      texture: THREE.CanvasTexture | null = null,
      material: THREE.ShaderMaterial | null = null,
      observer: IntersectionObserver | null = null;
    const cleanups: (() => void)[] = [];

    try {
      renderer = new THREE.WebGLRenderer({
        canvas: cv,
        alpha: true,
        antialias: true,
        premultipliedAlpha: false,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      const U = {
        tex: { value: null },
        m: { value: new THREE.Vector2(0.5, 0.5) },
        t: { value: 0 },
        s: { value: 0 },
        rev: { value: 0 },
        asp: { value: 3 },
        base: { value: new THREE.Color(css("--wm")) },
        dotCol: { value: new THREE.Color(css("--wm-dot")) },
        vio: { value: new THREE.Color("#7B4DFF") },
        lime: { value: new THREE.Color("#D4F55C") },
      };
      material = new THREE.ShaderMaterial({
        uniforms: U,
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        transparent: true,
        blending: THREE.NoBlending,
      });
      const geo = new THREE.PlaneGeometry(2, 2);
      scene.add(new THREE.Mesh(geo, material));
      cleanups.push(() => geo.dispose());

      makeWordmark()
        .then((c) => {
          if (cancelled) return;
          texture = new THREE.CanvasTexture(c);
          U.tex.value = texture;
          U.asp.value = c.width / c.height;
          cv.style.aspectRatio = `${c.width} / ${c.height}`;

          const size = () =>
            renderer?.setSize(cv.clientWidth, cv.clientHeight, false);
          size();
          window.addEventListener("resize", size);
          cleanups.push(() => window.removeEventListener("resize", size));

          // refresh colours when the OS theme changes
          const mq = matchMedia("(prefers-color-scheme: dark)");
          const onTheme = () =>
            setTimeout(() => {
              U.base.value.set(css("--wm"));
              U.dotCol.value.set(css("--wm-dot"));
            }, 50);
          mq.addEventListener("change", onTheme);
          cleanups.push(() => mq.removeEventListener("change", onTheme));

          const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
          let visible = false,
            seen = 0,
            lastMove = -1e9;
          const target = new THREE.Vector2(0.5, 0.5);

          // only animate while the footer is on screen
          observer = new IntersectionObserver(([en]) => {
            visible = en.isIntersecting;
            if (visible && !seen) seen = performance.now();
          });
          observer.observe(cv);

          const onMove = (e: PointerEvent) => {
            const b = cv.getBoundingClientRect();
            target.set(
              (e.clientX - b.left) / b.width,
              1 - (e.clientY - b.top) / b.height,
            );
            lastMove = performance.now();
          };
          box.addEventListener("pointermove", onMove);
          cleanups.push(() => box.removeEventListener("pointermove", onMove));

          const t0 = performance.now();
          const loop = () => {
            raf = requestAnimationFrame(loop);
            if (!visible) return;
            const now = performance.now();
            const t = (now - t0) / 1000;
            U.t.value = t;

            if (reduce) {
              U.rev.value = 1;
              U.s.value = 0;
            } else {
              U.rev.value = Math.min(1, (now - seen) / 1500);
              const live = now - lastMove < 2000; // pointer recently moved?
              const goal = live
                ? target
                : new THREE.Vector2(
                    0.5 + 0.35 * Math.sin(t * 0.5),
                    0.5 + 0.1 * Math.cos(t * 0.7),
                  ); // idle drift
              U.m.value.lerp(goal, 0.1);
              U.s.value += ((live ? 1 : 0.3) - U.s.value) * 0.06;
            }
            renderer?.render(scene, camera);
          };
          loop();
        })
        .catch(() => setFallback(true));
    } catch {
      setFallback(true);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      observer?.disconnect();
      cleanups.forEach((fn) => fn());
      texture?.dispose();
      material?.dispose();
      renderer?.dispose();
    };
  }, []);

  return (
    <footer className="foot" ref={footRef}>
      <div className="foot-top">
        <p className="foot-tag">{tagline}</p>
        <Link className="foot-cta" href="/tradein">
          Swap Your iPhone
          <span aria-hidden="true">
            <ArrowUpRight size={18} strokeWidth={2.5} />
          </span>
        </Link>
      </div>

      {fallback ? (
        <div className="wm-fallback" role="img" aria-label="swapped">
          swapped
        </div>
      ) : (
        <canvas id="wm" ref={canvasRef} role="img" aria-label="swapped" />
      )}

      <div className="foot-bot">
        <span>© {new Date().getFullYear()} Swapped</span>
        <span>
          Designed and built by <a href={designerUrl}>{designer}</a>
        </span>
      </div>
    </footer>
  );
}
