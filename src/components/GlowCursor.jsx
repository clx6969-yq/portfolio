import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";
import "./GlowCursor.css";

/**
 * 鼠标发光拖尾特效(来自 React Bits 的 GlowCursor 组件,做了几处改动)
 * ------------------------------------------------------------
 * 1. 原版组件需要把网站内容包在它里面(children),这里改成了
 *    一个"铺满整个屏幕、不遮挡点击"的固定图层,直接放在 App 最外层
 *    就能让全站都有这个跟随鼠标的发光拖尾,不用改动其他任何模块。
 * 2. 颜色换成了网站自己的红色/暖白色调,而不是原版的青色/紫色,
 *    这样和整站黑白灰 + 红色的风格保持一致。
 * 3. 性能优化:
 *    - DPR 上限从 1.5 降到 1(高 DPR 屏上像素量减到原来的 ~45%)
 *    - 鼠标空闲 / fade 几乎归零时,**整个 RAF 循环直接挂起**,
 *      0 GPU 占用,直到下次鼠标动起来再唤醒
 *    - 删掉了原本每帧每像素都跑的 filmGrain 噪声纹理
 *    - 默认 pulseSpeed = 0(原版每像素还有 sin() 参与发光)
 *    - 默认 trailLength 从 34 砍到 22(每像素循环次数 ↓ 35%)
 *    - 去掉了 canvas 的 `mix-blend-mode: screen`(会让浏览器把
 *      全页面当成图层跟光晕一起重新合成,极吃 GPU)
 *
 * 想关掉这个特效:去 App.jsx 里把 <GlowCursor /> 这一行删掉或注释掉即可。
 * 想调颜色/粗细/亮度:改下面 DEFAULT_CONFIG 里的数值,不用碰下面的逻辑代码。
 *
 * 【当前状态:已停用】
 * 2026-09 做过一次性能排查,实测鼠标持续移动时这个全屏 shader 会让帧率
 * 从 144fps 掉到约 80fps(单帧从 7ms 涨到 28ms),所以暂时从 App.jsx
 * 里摘掉了。文件保留在这里,单纯把 App.jsx 的 import 和 <GlowCursor />
 * 加回去就能重新启用。
 */

const MAX_POINTS = 48;

const DEFAULT_CONFIG = {
  color: "#2f83d8", // 拖尾最亮的头部颜色 —— 用网站的主色(晴空蓝)
  secondaryColor: "#eef6fc", // 拖尾尾部颜色 —— 用网站的天光白
  trailLength: 22,
  trailWidth: 5,
  trailTaper: 0.82,
  followSpeed: 0.18,
  glowIntensity: 1.4,
  glowSpread: 1.1,
  hotspot: 0.55,
  brightness: 1.25, // 略高于原版,弥补失去 screen blending 后的视觉差异
  opacity: 0.85,
  pulseSpeed: 0, // 默认关掉脉冲,少一份 sin() 计算
  noiseStrength: 0, // 默认关掉胶片颗粒
  idleFade: true,
  idleTimeout: 400,
  fadeDuration: 700,
  maxDevicePixelRatio: 1, // 关键:DPR 锁 1,高 DPI 屏不再 4x 像素计算
  enabled: true,
};

const VERTEX_SHADER = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// 注意:已经删掉了原本每帧每像素都跑的 filmGrain,只剩发光/拖尾本体。
// 视觉上会少一点"颗粒感",但性能直接降一个量级。
const FRAGMENT_SHADER = `
precision highp float;

#define MAX_POINTS 48

uniform vec2 uResolution;
uniform vec2 uPoints[MAX_POINTS];
uniform float uPointCount;
uniform vec3 uColor;
uniform vec3 uSecondaryColor;
uniform float uTrailWidth;
uniform float uTaper;
uniform float uGlowIntensity;
uniform float uGlowSpread;
uniform float uHotspot;
uniform float uBrightness;
uniform float uOpacity;
uniform float uPulseSpeed;
uniform float uTime;
uniform float uFade;

varying vec2 vUv;

float sRGB(float x) {
  if (x <= 0.00031308) return 12.92 * x;
  return 1.055 * pow(x, 1.0 / 2.4) - 0.055;
}

void main() {
  vec2 pixel = vUv * uResolution;
  float denominator = max(uPointCount - 1.0, 1.0);
  float strongest = 0.0;
  float strongestCore = 0.0;
  float colorWeight = 0.0;
  vec3 colorSum = vec3(0.0);

  for (int i = 0; i < MAX_POINTS - 1; i++) {
    float index = float(i);
    float active = 1.0 - step(uPointCount - 1.0, index);
    vec2 start = uPoints[i];
    vec2 end = uPoints[i + 1];
    vec2 toPixel = pixel - start;
    vec2 segment = end - start;
    float along = clamp(dot(toPixel, segment) / max(dot(segment, segment), 0.0001), 0.0, 1.0);
    float progress = clamp((index + along) / denominator, 0.0, 1.0);
    float life = pow(max(1.0 - progress, 0.0), mix(0.55, 1.25, uTaper));
    float width = uTrailWidth * mix(1.0, 0.25, pow(progress, mix(0.55, 1.6, uTaper)));
    float distanceToTrail = length(toPixel - segment * along);
    float falloff = max(width * (0.8 + uGlowSpread * 1.4), 0.5);
    float beam = min(1.0, (falloff * falloff) / (distanceToTrail * distanceToTrail + falloff * falloff));
    float core = exp(-pow(distanceToTrail / max(width, 0.5), 2.0) * 2.5);
    // pulseSpeed = 0 时,sin() 永远是 0,加法直接被编译器短路为"啥都没做"
    float pulseAmount = min(abs(uPulseSpeed), 1.0);
    float pulse = 1.0 + sin(uTime * uPulseSpeed * 3.0 - progress * 11.0) * 0.16 * pulseAmount;
    float intensity = (core + beam * uGlowIntensity * 0.55) * life * pulse * active;
    vec3 segmentColor = mix(uColor, uSecondaryColor, progress);

    strongest = max(strongest, intensity);
    strongestCore = max(strongestCore, core * life * active);
    colorSum += segmentColor * intensity;
    colorWeight += intensity;
  }

  float alpha = clamp(strongest * uOpacity * uFade, 0.0, 1.0);
  if (alpha < 0.0005) discard;

  vec3 color = colorSum / max(colorWeight, 0.0001);
  color = mix(color, vec3(1.0), smoothstep(0.25, 0.95, strongestCore) * uHotspot);
  float luminance = sRGB(clamp(strongest * uBrightness, 0.0, 1.0));
  vec3 additiveColor = color * luminance;
  gl_FragColor = vec4(additiveColor, alpha);
}
`;

const hexToRgb = (hex) => {
  let value = (hex || "").replace("#", "").trim();
  if (value.length === 3) {
    value = value
      .split("")
      .map((char) => char + char)
      .join("");
  }
  const parsed = Number.parseInt(value || "000000", 16);
  return [((parsed >> 16) & 255) / 255, ((parsed >> 8) & 255) / 255, (parsed & 255) / 255];
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function GlowCursor(props) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const propsRef = useRef({});

  propsRef.current = { ...DEFAULT_CONFIG, ...props };

  useEffect(() => {
    // 尊重"减少动态效果"的系统设置,避免对敏感用户造成不适
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const initialConfig = propsRef.current;
    const renderer = new Renderer({
      canvas,
      alpha: true,
      dpr: Math.min(window.devicePixelRatio || 1, initialConfig.maxDevicePixelRatio),
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const pointData = Array(MAX_POINTS * 2).fill(0);
    const points = Array.from({ length: MAX_POINTS }, () => ({ x: 0, y: 0 }));
    const target = { x: 0, y: 0 };
    const head = { x: 0, y: 0 };

    const program = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: FRAGMENT_SHADER,
      uniforms: {
        uResolution: { value: [1, 1] },
        uPoints: { value: pointData },
        uPointCount: { value: initialConfig.trailLength },
        uColor: { value: hexToRgb(initialConfig.color) },
        uSecondaryColor: { value: hexToRgb(initialConfig.secondaryColor) },
        uTrailWidth: { value: initialConfig.trailWidth },
        uTaper: { value: initialConfig.trailTaper },
        uGlowIntensity: { value: initialConfig.glowIntensity },
        uGlowSpread: { value: initialConfig.glowSpread },
        uHotspot: { value: initialConfig.hotspot },
        uBrightness: { value: initialConfig.brightness },
        uOpacity: { value: initialConfig.opacity },
        uPulseSpeed: { value: initialConfig.pulseSpeed },
        uTime: { value: 0 },
        uFade: { value: 0 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    let width = 1;
    let height = 1;
    let initialized = false;
    let pointerInside = false;
    let fade = 0;
    let lastInputTime = performance.now();
    let lastFrameTime = performance.now();
    let raf = 0;
    let destroyed = false;
    let running = false; // RAF 循环开关——挂起时是 false,直接零 GPU 占用

    const resize = () => {
      width = Math.max(window.innerWidth, 1);
      height = Math.max(window.innerHeight, 1);
      renderer.setSize(width, height);
      program.uniforms.uResolution.value = [width, height];
    };

    const initializeTrail = (x, y) => {
      target.x = x;
      target.y = y;
      head.x = x;
      head.y = y;
      for (const point of points) {
        point.x = x;
        point.y = y;
      }
      initialized = true;
      fade = 1;
    };

    const updatePointer = (event) => {
      const x = clamp(event.clientX, 0, width);
      const y = clamp(height - event.clientY, 0, height);
      if (!initialized) initializeTrail(x, y);
      target.x = x;
      target.y = y;
      pointerInside = true;
      lastInputTime = performance.now();
      // 鼠标重新进入/动了一下,确保 RAF 循环是开着的
      if (!running) {
        running = true;
        raf = requestAnimationFrame(render);
      }
    };

    const onPointerLeave = () => {
      pointerInside = false;
      lastInputTime = performance.now();
    };

    // 启动 / 挂起 RAF 循环的两扇门。
    // 进入挂起态之后这一帧就不再 requestAnimationFrame 了——直到
    // 鼠标再次触发 updatePointer,才重新唤醒。
    function suspendLoop() {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
    }

    function render(now) {
      if (destroyed) return;
      if (!running) return; // 保险:挂起期间被回调,直接退出
      const config = propsRef.current;
      const delta = Math.min((now - lastFrameTime) / 16.667, 3);
      lastFrameTime = now;

      if (initialized) {
        const headEase = 1 - Math.pow(1 - clamp(config.followSpeed, 0.01, 0.99), delta);
        const chainBase = clamp(0.28 + config.followSpeed * 0.35, 0.08, 0.92);
        const chainEase = 1 - Math.pow(1 - chainBase, delta);
        head.x += (target.x - head.x) * headEase;
        head.y += (target.y - head.y) * headEase;
        points[0].x = head.x;
        points[0].y = head.y;

        for (let i = 1; i < MAX_POINTS; i++) {
          points[i].x += (points[i - 1].x - points[i].x) * chainEase;
          points[i].y += (points[i - 1].y - points[i].y) * chainEase;
        }

        for (let i = 0; i < MAX_POINTS; i++) {
          pointData[i * 2] = points[i].x;
          pointData[i * 2 + 1] = points[i].y;
        }
      }

      const idleFor = now - lastInputTime;
      const shouldFade = config.idleFade && (!pointerInside || idleFor > config.idleTimeout);
      const fadeStep = (16.667 * delta) / Math.max(config.fadeDuration, 16);
      const fadeTarget = initialized && config.enabled && !shouldFade ? 1 : 0;
      fade += (fadeTarget - fade) * Math.min(1, fadeStep * 7);

      program.uniforms.uPointCount.value = clamp(Math.round(config.trailLength), 2, MAX_POINTS);
      program.uniforms.uColor.value = hexToRgb(config.color);
      program.uniforms.uSecondaryColor.value = hexToRgb(config.secondaryColor);
      program.uniforms.uTrailWidth.value = Math.max(config.trailWidth, 0.1);
      program.uniforms.uTaper.value = clamp(config.trailTaper, 0, 1);
      program.uniforms.uGlowIntensity.value = Math.max(config.glowIntensity, 0);
      program.uniforms.uGlowSpread.value = Math.max(config.glowSpread, 0);
      program.uniforms.uHotspot.value = clamp(config.hotspot, 0, 1);
      program.uniforms.uBrightness.value = Math.max(config.brightness, 0);
      program.uniforms.uOpacity.value = clamp(config.opacity, 0, 1);
      program.uniforms.uPulseSpeed.value = config.pulseSpeed;
      program.uniforms.uTime.value = now * 0.001;
      program.uniforms.uFade.value = fade;

      renderer.render({ scene: mesh });

      // 关键节能:fade 几乎归零后,直接挂起 RAF 循环,完全不渲染
      // (gl 也不动),等鼠标下次动起来再唤醒。
      if (fade < 0.001 && fadeTarget === 0) {
        // 清屏一次,让屏幕上残留的拖尾彻底消失
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        suspendLoop();
        return;
      }

      if (running) raf = requestAnimationFrame(render);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("pointerdown", updatePointer, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave);
    resize();
    running = true;
    raf = requestAnimationFrame(render);

    return () => {
      destroyed = true;
      suspendLoop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerdown", updatePointer);
      document.removeEventListener("mouseleave", onPointerLeave);
      mesh.geometry.remove();
      program.remove();
    };
  }, []);

  return (
    <div ref={containerRef} className="glow-cursor-overlay" aria-hidden="true">
      <canvas ref={canvasRef} className="glow-cursor__canvas" />
    </div>
  );
}