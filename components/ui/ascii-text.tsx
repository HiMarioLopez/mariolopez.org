// Component ported and enhanced from https://codepen.io/JuanFuentes/pen/eYEeoyE

"use client";

import { useRef, useEffect } from "react";
import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  Camera,
  CanvasTexture,
  NearestFilter,
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
} from "three";

const vertexShader = `
varying vec2 vUv;
uniform float uTime;
uniform float mouse;
uniform float uEnableWaves;

void main() {
    vUv = uv;
    float time = uTime * 5.;

    float waveFactor = uEnableWaves;

    vec3 transformed = position;

    transformed.x += sin(time + position.y) * 0.5 * waveFactor;
    transformed.y += cos(time + position.z) * 0.15 * waveFactor;
    transformed.z += sin(time + position.x) * waveFactor;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform float mouse;
uniform float uTime;
uniform sampler2D uTexture;

void main() {
    float time = uTime;
    vec2 pos = vUv;
    
    float move = sin(time + mouse) * 0.01;
    float r = texture2D(uTexture, pos + cos(time * 2. - time + pos.x) * .01).r;
    float g = texture2D(uTexture, pos + tan(time * .5 + pos.x - time) * .01).g;
    float b = texture2D(uTexture, pos - cos(time * 2. + time + pos.y) * .01).b;
    float a = texture2D(uTexture, pos).a;
    gl_FragColor = vec4(r, g, b, a);
}
`;

function map(
  n: number,
  start: number,
  stop: number,
  start2: number,
  stop2: number
) {
  return ((n - start) / (stop - start)) * (stop2 - start2) + start2;
}

const PX_RATIO = typeof window !== "undefined" ? window.devicePixelRatio : 1;

// Cache for computed font family to avoid DOM creation on every call
let cachedFontFamily: string | null = null;

interface AsciiFilterOptions {
  fontSize?: number;
  fontFamily?: string;
  charset?: string;
  invert?: boolean;
  enableMouseInteraction?: boolean;
}

class AsciiFilter {
  renderer: WebGLRenderer;
  domElement: HTMLDivElement;
  pre: HTMLPreElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D | null;
  invert: boolean;
  fontSize: number;
  fontFamily: string;
  charset: string;
  width: number = 0;
  height: number = 0;
  center: { x: number; y: number } = { x: 0, y: 0 };
  mouse: { x: number; y: number } = { x: 0, y: 0 };
  cols: number = 0;
  rows: number = 0;
  deg: number = 0;
  enableMouseInteraction: boolean;
  // Performance optimizations
  private cachedImageDataSize: { w: number; h: number } = { w: 0, h: 0 };
  private stringBuffer: string[] = [];
  private lastUpdateTime: number = 0;
  private updateThrottle: number = 16; // ~60fps default
  private isVisible: boolean = true;

  constructor(
    renderer: WebGLRenderer,
    {
      fontSize,
      fontFamily,
      charset,
      invert,
      enableMouseInteraction = false,
    }: AsciiFilterOptions = {}
  ) {
    this.renderer = renderer;
    this.domElement = document.createElement("div");
    this.domElement.style.position = "absolute";
    this.domElement.style.top = "0";
    this.domElement.style.left = "0";
    this.domElement.style.width = "100%";
    this.domElement.style.height = "100%";

    this.pre = document.createElement("pre");
    this.domElement.appendChild(this.pre);

    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    this.domElement.appendChild(this.canvas);

    this.invert = invert ?? true;
    this.fontSize = fontSize ?? 12;
    this.fontFamily = fontFamily ?? "'Courier New', monospace";
    this.charset =
      charset ??
      " .'`^\",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
    this.enableMouseInteraction = enableMouseInteraction ?? false;

    if (this.context) {
      this.context.imageSmoothingEnabled = false;
      this.context.imageSmoothingEnabled = false;
    }

    if (this.enableMouseInteraction) {
      this.onMouseMove = this.onMouseMove.bind(this);
      document.addEventListener("mousemove", this.onMouseMove);
    }
  }

  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height);
    this.reset();

    this.center = { x: width / 2, y: height / 2 };
    this.mouse = { x: this.center.x, y: this.center.y };
  }

  reset() {
    if (this.context) {
      this.context.font = `${this.fontSize}px ${this.fontFamily}`;
      const charWidth = this.context.measureText("A").width;

      this.cols = Math.floor(
        this.width / (this.fontSize * (charWidth / this.fontSize))
      );
      this.rows = Math.floor(this.height / this.fontSize);

      this.canvas.width = this.cols;
      this.canvas.height = this.rows;
      this.pre.style.fontFamily = this.fontFamily;
      this.pre.style.fontSize = `${this.fontSize}px`;
      this.pre.style.margin = "0";
      this.pre.style.padding = "0";
      this.pre.style.lineHeight = "1em";
      this.pre.style.position = "absolute";
      this.pre.style.left = "50%";
      this.pre.style.top = "50%";
      this.pre.style.transform = "translate(-50%, -50%)";
      this.pre.style.zIndex = "9";
      this.pre.style.backgroundAttachment = "fixed";
      this.pre.style.mixBlendMode = "difference";

      // Invalidate cached size when canvas size changes
      this.cachedImageDataSize = { w: 0, h: 0 };
    }
  }

  render(scene: Scene, camera: Camera) {
    if (!this.isVisible) return;

    this.renderer.render(scene, camera);

    const w = this.canvas.width;
    const h = this.canvas.height;
    if (this.context) {
      this.context.clearRect(0, 0, w, h);
      if (this.context && w && h) {
        this.context.drawImage(this.renderer.domElement, 0, 0, w, h);
      }

      // Throttle DOM updates based on frame rate
      const now = performance.now();
      const shouldUpdate = now - this.lastUpdateTime >= this.updateThrottle;

      if (shouldUpdate) {
        this.asciify(this.context, w, h);
        this.lastUpdateTime = now;
      }

      if (this.enableMouseInteraction) {
        this.hue();
      }
    }
  }

  setUpdateThrottle(ms: number) {
    this.updateThrottle = ms;
  }

  setVisible(visible: boolean) {
    this.isVisible = visible;
  }

  private lastMouseUpdate: number = 0;
  private mouseThrottle: number = 16; // ~60fps

  onMouseMove(e: MouseEvent) {
    const now = performance.now();
    if (now - this.lastMouseUpdate < this.mouseThrottle) return;
    this.mouse = { x: e.clientX * PX_RATIO, y: e.clientY * PX_RATIO };
    this.lastMouseUpdate = now;
  }

  get dx() {
    return this.mouse.x - this.center.x;
  }

  get dy() {
    return this.mouse.y - this.center.y;
  }

  hue() {
    const deg = (Math.atan2(this.dy, this.dx) * 180) / Math.PI;
    this.deg += (deg - this.deg) * 0.075;
    this.domElement.style.filter = `hue-rotate(${this.deg.toFixed(1)}deg)`;
  }

  asciify(ctx: CanvasRenderingContext2D, w: number, h: number) {
    if (!w || !h) return;

    // Get fresh image data each frame (necessary for animation)
    // Update cached size if it changed
    if (this.cachedImageDataSize.w !== w || this.cachedImageDataSize.h !== h) {
      this.cachedImageDataSize = { w, h };
    }
    const imageData = ctx.getImageData(0, 0, w, h);
    const imgData = imageData.data;

    // Pre-allocate array for string building (much faster than concatenation)
    const totalChars = w * h + h; // chars + newlines
    if (this.stringBuffer.length < totalChars) {
      this.stringBuffer = new Array(totalChars);
    }

    let bufferIdx = 0;
    const charsetLen = this.charset.length;
    const charsetLenMinusOne = charsetLen - 1;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = x * 4 + y * 4 * w;
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];
        const a = imgData[i + 3];

        if (a === 0) {
          this.stringBuffer[bufferIdx++] = " ";
          continue;
        }

        const gray = (0.3 * r + 0.6 * g + 0.1 * b) / 255;
        let idx = Math.floor((1 - gray) * charsetLenMinusOne);
        if (this.invert) idx = charsetLen - idx - 1;
        this.stringBuffer[bufferIdx++] = this.charset[idx];
      }
      this.stringBuffer[bufferIdx++] = "\n";
    }

    // Use textContent instead of innerHTML (faster and safer)
    // Join array is much faster than string concatenation
    this.pre.textContent = this.stringBuffer.slice(0, bufferIdx).join("");
  }

  dispose() {
    if (this.enableMouseInteraction) {
      document.removeEventListener("mousemove", this.onMouseMove);
    }
  }
}

interface CanvasTxtOptions {
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

class CanvasTxt {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D | null;
  txt: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  font: string;
  private lastRenderProps: { txt: string; fontSize: number; color: string } = {
    txt: "",
    fontSize: 0,
    color: "",
  };
  private needsRender: boolean = true;

  constructor(
    txt: string,
    {
      fontSize = 200,
      fontFamily = "Arial",
      color = "#fdf9f3",
    }: CanvasTxtOptions = {}
  ) {
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    this.txt = txt;
    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.color = color;

    this.font = `600 ${this.fontSize}px ${this.fontFamily}`;
  }

  resize() {
    if (this.context) {
      this.context.font = this.font;
      const metrics = this.context.measureText(this.txt);

      const textWidth = Math.ceil(metrics.width) + 10;
      const textHeight =
        Math.ceil(
          metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
        ) + 10;

      this.canvas.width = textWidth;
      this.canvas.height = textHeight;
    }
  }

  render(): boolean {
    if (!this.context) return false;

    // Only re-render if text, fontSize, or color changed
    const propsChanged =
      this.lastRenderProps.txt !== this.txt ||
      this.lastRenderProps.fontSize !== this.fontSize ||
      this.lastRenderProps.color !== this.color;

    if (!propsChanged && !this.needsRender) {
      return false;
    }

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = this.color;
    this.context.font = this.font;

    const metrics = this.context.measureText(this.txt);
    const yPos = 5 + metrics.actualBoundingBoxAscent;

    this.context.fillText(this.txt, 5, yPos);

    // Update cached props
    this.lastRenderProps = {
      txt: this.txt,
      fontSize: this.fontSize,
      color: this.color,
    };
    this.needsRender = false;
    return true; // Indicates texture needs update
  }

  invalidate() {
    this.needsRender = true;
  }

  get width() {
    return this.canvas.width;
  }

  get height() {
    return this.canvas.height;
  }

  get texture() {
    return this.canvas;
  }
}

interface CanvAsciiOptions {
  text: string;
  asciiFontSize: number;
  textFontSize: number;
  textColor: string;
  planeBaseHeight: number;
  enableWaves: boolean;
  enableMouseInteraction?: boolean;
}

class CanvAscii {
  textString: string;
  asciiFontSize: number;
  textFontSize: number;
  textColor: string;
  planeBaseHeight: number;
  container: HTMLElement;
  width: number;
  height: number;
  enableWaves: boolean;
  enableMouseInteraction: boolean;
  camera: PerspectiveCamera;
  scene: Scene;
  mouse: { x: number; y: number };
  textCanvas!: CanvasTxt;
  texture!: CanvasTexture;
  geometry!: PlaneGeometry;
  material!: ShaderMaterial;
  mesh!: Mesh;
  renderer!: WebGLRenderer;
  filter!: AsciiFilter;
  center!: { x: number; y: number };
  animationFrameId: number = 0;
  // Performance optimizations
  private isVisible: boolean = true;
  private intersectionObserver: IntersectionObserver | null = null;
  private lastUniformTime: number = -1;
  private lastMouseInteraction: number = 0;
  private mouseThrottleTimeout: number | null = null;

  constructor(
    {
      text,
      asciiFontSize,
      textFontSize,
      textColor,
      planeBaseHeight,
      enableWaves,
      enableMouseInteraction = false,
    }: CanvAsciiOptions,
    containerElem: HTMLElement,
    width: number,
    height: number
  ) {
    this.textString = text;
    this.asciiFontSize = asciiFontSize;
    this.textFontSize = textFontSize;
    this.textColor = textColor;
    this.planeBaseHeight = planeBaseHeight;
    this.container = containerElem;
    this.width = width;
    this.height = height;
    this.enableWaves = enableWaves;
    this.enableMouseInteraction = enableMouseInteraction ?? false;

    this.camera = new PerspectiveCamera(45, this.width / this.height, 1, 1000);
    this.camera.position.z = 40;

    this.scene = new Scene();
    this.mouse = { x: 0, y: 0 };

    this.onMouseMove = this.onMouseMove.bind(this);

    this.setMesh();
    this.setRenderer();
  }

  setMesh() {
    this.textCanvas = new CanvasTxt(this.textString, {
      fontSize: this.textFontSize,
      fontFamily: getComputedFontFamily(),
      color: this.textColor,
    });
    this.textCanvas.resize();
    this.textCanvas.render();

    this.texture = new CanvasTexture(this.textCanvas.texture);
    this.texture.minFilter = NearestFilter;

    const textAspect = this.textCanvas.width / this.textCanvas.height;
    const baseH = this.planeBaseHeight;
    const planeW = baseH * textAspect;
    const planeH = baseH;

    this.geometry = new PlaneGeometry(planeW, planeH, 36, 36);
    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        mouse: { value: 1.0 },
        uTexture: { value: this.texture },
        uEnableWaves: { value: this.enableWaves ? 1.0 : 0.0 },
      },
    });

    this.mesh = new Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  setRenderer() {
    this.renderer = new WebGLRenderer({ antialias: false, alpha: true });
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x000000, 0);

    this.filter = new AsciiFilter(this.renderer, {
      fontFamily: getComputedFontFamily(),
      fontSize: this.asciiFontSize,
      invert: true,
      enableMouseInteraction: this.enableMouseInteraction,
    });

    this.container.appendChild(this.filter.domElement);
    this.setSize(this.width, this.height);

    // Set up visibility-based frame rate limiting
    this.setupVisibilityObserver();

    if (this.enableMouseInteraction) {
      // Throttle mouse events to prevent excessive updates
      this.container.addEventListener("mousemove", this.onMouseMoveThrottled);
      this.container.addEventListener("touchmove", this.onMouseMoveThrottled);
    }
  }

  private setupVisibilityObserver() {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0]?.isIntersecting ?? true;
        this.isVisible = isVisible;
        this.filter.setVisible(isVisible);

        // Adjust frame rate: 60fps when visible and interacting, 30fps when visible but not interacting
        if (isVisible) {
          const timeSinceInteraction =
            performance.now() - this.lastMouseInteraction;
          const isInteracting = timeSinceInteraction < 1000; // Consider interacting if mouse moved in last second
          this.filter.setUpdateThrottle(isInteracting ? 16 : 33); // 60fps vs 30fps
        }
      },
      { threshold: 0.1 }
    );

    this.intersectionObserver.observe(this.container);
  }

  private onMouseMoveThrottled = (evt: MouseEvent | TouchEvent) => {
    if (this.mouseThrottleTimeout !== null) return;

    this.lastMouseInteraction = performance.now();
    this.onMouseMove(evt);

    this.mouseThrottleTimeout = window.setTimeout(() => {
      this.mouseThrottleTimeout = null;
    }, 16); // ~60fps throttle
  };

  setSize(w: number, h: number) {
    this.width = w;
    this.height = h;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    this.filter.setSize(w, h);

    this.center = { x: w / 2, y: h / 2 };
  }

  load() {
    this.animate();
  }

  animate() {
    const animateFrame = () => {
      this.animationFrameId = requestAnimationFrame(animateFrame);
      this.render();
    };
    animateFrame();
  }

  onMouseMove(evt: MouseEvent | TouchEvent) {
    const e = (evt as TouchEvent).touches
      ? (evt as TouchEvent).touches[0]
      : (evt as MouseEvent);
    const bounds = this.container.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    this.mouse = { x, y };
  }

  updateRotation() {
    const x = map(this.mouse.y, 0, this.height, 0.5, -0.5);
    const y = map(this.mouse.x, 0, this.width, -0.5, 0.5);

    this.mesh.rotation.x += (x - this.mesh.rotation.x) * 0.05;
    this.mesh.rotation.y += (y - this.mesh.rotation.y) * 0.05;
  }

  render() {
    if (!this.isVisible) return;

    const time = new Date().getTime() * 0.001;
    const sinTime = Math.sin(time);

    // Only update texture if text canvas was actually re-rendered
    const textureNeedsUpdate = this.textCanvas.render();
    if (textureNeedsUpdate) {
      this.texture.needsUpdate = true;
    }

    // Only update uniform if value changed
    if (this.lastUniformTime !== sinTime) {
      (this.mesh.material as ShaderMaterial).uniforms.uTime.value = sinTime;
      this.lastUniformTime = sinTime;
    }

    if (this.enableMouseInteraction) {
      this.updateRotation();
    }

    this.filter.render(this.scene, this.camera);
  }

  clear() {
    this.scene.traverse((object) => {
      const obj = object as unknown as Mesh;
      if (!obj.isMesh) return;
      [obj.material].flat().forEach((material) => {
        material.dispose();
        Object.keys(material).forEach((key) => {
          const matProp = material[key as keyof typeof material];
          if (
            matProp &&
            typeof matProp === "object" &&
            "dispose" in matProp &&
            typeof matProp.dispose === "function"
          ) {
            matProp.dispose();
          }
        });
      });
      obj.geometry.dispose();
    });
    this.scene.clear();
  }

  dispose() {
    cancelAnimationFrame(this.animationFrameId);
    if (this.mouseThrottleTimeout !== null) {
      clearTimeout(this.mouseThrottleTimeout);
      this.mouseThrottleTimeout = null;
    }
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
    this.filter.dispose();
    this.container.removeChild(this.filter.domElement);
    if (this.enableMouseInteraction) {
      this.container.removeEventListener(
        "mousemove",
        this.onMouseMoveThrottled
      );
      this.container.removeEventListener(
        "touchmove",
        this.onMouseMoveThrottled
      );
    }
    this.clear();
    this.renderer.dispose();
  }
}

// Helper function to get computed font family from CSS variable
// Cached to avoid DOM creation on every call
function getComputedFontFamily(): string {
  if (typeof window === "undefined") {
    return "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', 'Consolas', 'Courier New', monospace";
  }

  // Return cached value if available
  if (cachedFontFamily !== null) {
    return cachedFontFamily;
  }

  // Create a temporary element to resolve the CSS variable
  const tempEl = document.createElement("div");
  tempEl.style.fontFamily =
    "var(--font-geist-mono), 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', 'Consolas', 'Courier New', monospace";
  tempEl.style.position = "absolute";
  tempEl.style.visibility = "hidden";
  document.body.appendChild(tempEl);

  const computedFontFamily = getComputedStyle(tempEl).fontFamily;
  document.body.removeChild(tempEl);

  cachedFontFamily =
    computedFontFamily ||
    "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', 'Consolas', 'Courier New', monospace";

  return cachedFontFamily;
}

// Function to invalidate font cache (e.g., on theme change)
export function invalidateFontCache() {
  cachedFontFamily = null;
}

interface ASCIITextProps {
  text?: string;
  asciiFontSize?: number;
  textFontSize?: number;
  textColor?: string;
  planeBaseHeight?: number;
  enableWaves?: boolean;
  enableMouseInteraction?: boolean;
}

export default function ASCIIText({
  text = "David!",
  asciiFontSize = 8,
  textFontSize = 200,
  textColor = "#fdf9f3",
  planeBaseHeight = 8,
  enableWaves = true,
  enableMouseInteraction = false,
}: ASCIITextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const asciiRef = useRef<CanvAscii | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const { width, height } = containerRef.current.getBoundingClientRect();

    if (width === 0 || height === 0) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (
            entry.isIntersecting &&
            entry.boundingClientRect.width > 0 &&
            entry.boundingClientRect.height > 0
          ) {
            const { width: w, height: h } = entry.boundingClientRect;

            asciiRef.current = new CanvAscii(
              {
                text,
                asciiFontSize,
                textFontSize,
                textColor,
                planeBaseHeight,
                enableWaves,
                enableMouseInteraction,
              },
              containerRef.current!,
              w,
              h
            );
            asciiRef.current.load();

            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(containerRef.current);

      return () => {
        observer.disconnect();
        if (asciiRef.current) {
          asciiRef.current.dispose();
        }
      };
    }

    asciiRef.current = new CanvAscii(
      {
        text,
        asciiFontSize,
        textFontSize,
        textColor,
        planeBaseHeight,
        enableWaves,
        enableMouseInteraction,
      },
      containerRef.current,
      width,
      height
    );
    asciiRef.current.load();

    const ro = new ResizeObserver((entries) => {
      if (!entries[0] || !asciiRef.current) return;
      const { width: w, height: h } = entries[0].contentRect;
      if (w > 0 && h > 0) {
        asciiRef.current.setSize(w, h);
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      if (asciiRef.current) {
        asciiRef.current.dispose();
      }
    };
  }, [
    text,
    asciiFontSize,
    textFontSize,
    textColor,
    planeBaseHeight,
    enableWaves,
    enableMouseInteraction,
  ]);

  return (
    <div
      ref={containerRef}
      className="ascii-text-container"
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
      }}
    >
      <style>{`
        body {
          margin: 0;
          padding: 0;
        }

        .ascii-text-container canvas {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          image-rendering: optimizeSpeed;
          image-rendering: -moz-crisp-edges;
          image-rendering: -o-crisp-edges;
          image-rendering: -webkit-optimize-contrast;
          image-rendering: optimize-contrast;
          image-rendering: crisp-edges;
          image-rendering: pixelated;
        }

        .ascii-text-container pre {
          margin: 0;
          user-select: none;
          padding: 0;
          line-height: 1em;
          text-align: left;
          position: absolute;
          left: 0;
          top: 0;
          background-image: radial-gradient(circle, #ff6188 0%, #fc9867 50%, #ffd866 100%);
          background-attachment: fixed;
          -webkit-text-fill-color: transparent;
          -webkit-background-clip: text;
          z-index: 9;
          mix-blend-mode: difference;
        }
      `}</style>
    </div>
  );
}
