import { useRef, useEffect, useState, useCallback } from "react";
import { VERTEX_SHADER, FRAGMENT_SHADER, type ShaderParams } from "./shaders";

export interface ShaderCanvasHandle {
  captureFrame: () => string | null;
}

interface ShaderCanvasProps {
  params: ShaderParams;
  onCompiled?: () => void;
  onError?: (error: string) => void;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

export default function ShaderCanvas({ params, onCompiled, onError, canvasRef: externalCanvasRef }: ShaderCanvasProps) {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasElement = externalCanvasRef || internalCanvasRef;
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const shadersRef = useRef<WebGLShader[]>([]);
  const bufferRef = useRef<WebGLBuffer | null>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const frozenTimeRef = useRef<number | null>(null);
  const uniformLocsRef = useRef<Record<string, WebGLUniformLocation | null>>({});
  const paramsRef = useRef<ShaderParams>(params);
  const targetParamsRef = useRef<ShaderParams>(params);
  const [isCompiling, setIsCompiling] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    targetParamsRef.current = params;
  }, [params]);

  const initGL = useCallback(() => {
    const canvas = canvasElement.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", { antialias: true, preserveDrawingBuffer: true });
    if (!gl) {
      const msg = "WebGL2 is not supported";
      setError(msg);
      setIsCompiling(false);
      onError?.(msg);
      return;
    }
    glRef.current = gl;

    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, VERTEX_SHADER);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      const msg = `Vertex shader error: ${gl.getShaderInfoLog(vs)}`;
      setError(msg);
      setIsCompiling(false);
      onError?.(msg);
      return;
    }

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, FRAGMENT_SHADER);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      const msg = `Fragment shader error: ${gl.getShaderInfoLog(fs)}`;
      setError(msg);
      setIsCompiling(false);
      onError?.(msg);
      return;
    }

    shadersRef.current = [vs, fs];

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const msg = `Program link error: ${gl.getProgramInfoLog(program)}`;
      setError(msg);
      setIsCompiling(false);
      onError?.(msg);
      return;
    }
    programRef.current = program;

    const posBuffer = gl.createBuffer();
    bufferRef.current = posBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uniformNames = [
      "u_resolution", "u_time", "u_intensity", "u_symmetry",
      "u_noiseScale", "u_noiseSpeed", "u_grainAmount",
      "u_flowAngle", "u_curveDistortion", "u_depthIntensity",
      "u_highlightStrength", "u_foldScale", "u_colorCount",
    ];
    uniformNames.forEach(name => {
      uniformLocsRef.current[name] = gl.getUniformLocation(program, name);
    });
    for (let i = 0; i < 8; i++) {
      uniformLocsRef.current[`u_colors_${i}`] = gl.getUniformLocation(program, `u_colors[${i}]`);
    }

    gl.useProgram(program);
    setIsCompiling(false);
    onCompiled?.();
  }, [onCompiled, onError, canvasElement]);

  const resize = useCallback(() => {
    const canvas = canvasElement.current;
    const gl = glRef.current;
    if (!canvas || !gl) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }, [canvasElement]);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const lerpColor = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] => [
    lerp(a[0], b[0], t),
    lerp(a[1], b[1], t),
    lerp(a[2], b[2], t),
  ];

  const render = useCallback(() => {
    const gl = glRef.current;
    const program = programRef.current;
    const canvas = canvasElement.current;
    if (!gl || !program || !canvas) return;

    const lerpFactor = 0.04;
    const current = paramsRef.current;
    const target = targetParamsRef.current;

    const maxLen = Math.max(current.colors.length, target.colors.length);
    const lerpedColors: [number, number, number][] = [];
    for (let i = 0; i < maxLen; i++) {
      const c = current.colors[i] || current.colors[current.colors.length - 1];
      const t = target.colors[i] || target.colors[target.colors.length - 1];
      lerpedColors.push(lerpColor(c, t, lerpFactor));
    }

    paramsRef.current = {
      intensity: lerp(current.intensity, target.intensity, lerpFactor),
      symmetry: lerp(current.symmetry, target.symmetry, lerpFactor),
      noiseScale: lerp(current.noiseScale, target.noiseScale, lerpFactor),
      noiseSpeed: lerp(current.noiseSpeed, target.noiseSpeed, lerpFactor),
      animate: target.animate,
      grainAmount: lerp(current.grainAmount, target.grainAmount, lerpFactor),
      flowAngle: lerp(current.flowAngle, target.flowAngle, lerpFactor),
      curveDistortion: lerp(current.curveDistortion, target.curveDistortion, lerpFactor),
      depthIntensity: lerp(current.depthIntensity, target.depthIntensity, lerpFactor),
      highlightStrength: lerp(current.highlightStrength, target.highlightStrength, lerpFactor),
      foldScale: lerp(current.foldScale, target.foldScale, lerpFactor),
      colorCount: target.colorCount,
      colors: lerpedColors,
    };

    const p = paramsRef.current;
    const locs = uniformLocsRef.current;
    if (!p.animate && frozenTimeRef.current === null) {
      frozenTimeRef.current = (performance.now() - startTimeRef.current) / 1000 * (p.noiseSpeed / 100);
    } else if (p.animate && frozenTimeRef.current !== null) {
      startTimeRef.current = performance.now() - (frozenTimeRef.current / (p.noiseSpeed / 100)) * 1000;
      frozenTimeRef.current = null;
    }
    const time = p.animate
      ? (performance.now() - startTimeRef.current) / 1000 * (p.noiseSpeed / 100)
      : (frozenTimeRef.current ?? 0);

    gl.uniform2f(locs.u_resolution, canvas.width, canvas.height);
    gl.uniform1f(locs.u_time, time);
    gl.uniform1f(locs.u_intensity, p.intensity);
    gl.uniform1f(locs.u_symmetry, p.symmetry);
    gl.uniform1f(locs.u_noiseScale, p.noiseScale);
    gl.uniform1f(locs.u_noiseSpeed, p.noiseSpeed);
    gl.uniform1f(locs.u_grainAmount, p.grainAmount);
    gl.uniform1f(locs.u_flowAngle, p.flowAngle);
    gl.uniform1f(locs.u_curveDistortion, p.curveDistortion);
    gl.uniform1f(locs.u_depthIntensity, p.depthIntensity);
    gl.uniform1f(locs.u_highlightStrength, p.highlightStrength);
    gl.uniform1f(locs.u_foldScale, p.foldScale);
    gl.uniform1i(locs.u_colorCount, p.colorCount);
    for (let i = 0; i < 8; i++) {
      const color = p.colors[i] || p.colors[p.colors.length - 1];
      gl.uniform3fv(locs[`u_colors_${i}`], color);
    }

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    animFrameRef.current = requestAnimationFrame(render);
  }, [canvasElement]);

  useEffect(() => {
    initGL();
    resize();
    window.addEventListener("resize", resize);
    startTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameRef.current);
      const gl = glRef.current;
      if (gl) {
        shadersRef.current.forEach(s => gl.deleteShader(s));
        if (programRef.current) gl.deleteProgram(programRef.current);
        if (bufferRef.current) gl.deleteBuffer(bufferRef.current);
      }
    };
  }, [initGL, resize, render]);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0c]">
        <div className="text-center">
          <p className="text-s text-white/70">{error}</p>
          <p className="text-xs text-white/40 mt-1">Try using a different browser</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasElement as React.RefObject<HTMLCanvasElement>}
        className="w-full h-full block"
        data-testid="shader-canvas"
      />
      {isCompiling && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80" data-testid="shader-loading">
          <div className="flex flex-col items-center" style={{ gap: "12px" }}>
            <div className="w-[32px] h-[32px] border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span className="text-s text-white/70">Compiling shader...</span>
          </div>
        </div>
      )}
    </div>
  );
}
