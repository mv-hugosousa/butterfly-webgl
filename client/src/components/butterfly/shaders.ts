export interface ShaderParams {
  intensity: number;
  symmetry: number;
  noiseScale: number;
  noiseSpeed: number;
  animate: boolean;
  grainAmount: number;
  flowAngle: number;
  curveDistortion: number;
  depthIntensity: number;
  highlightStrength: number;
  foldScale: number;
  colorCount: number;
  colors: [number, number, number][];
}

export type Stage = "subtle" | "activated" | "expressive";
export type Wing = "default" | "emerald" | "plumage" | "copper" | "monarch";

function hexToRgb(hex: string): [number, number, number] {
  const sanitized = hex.replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(sanitized)) {
    return [0, 0, 0];
  }
  const r = parseInt(sanitized.slice(0, 2), 16) / 255;
  const g = parseInt(sanitized.slice(2, 4), 16) / 255;
  const b = parseInt(sanitized.slice(4, 6), 16) / 255;
  return [r, g, b];
}

interface WingPalette {
  subtle: [number, number, number][];
  activated: [number, number, number][];
  expressive: [number, number, number][];
}

const WING_PALETTES: Record<Wing, WingPalette> = {
  default: {
    subtle: [
      hexToRgb("#E8E8D0"),
      hexToRgb("#C8D4A0"),
      hexToRgb("#F0EDE0"),
      hexToRgb("#A0A860"),
    ],
    activated: [
      hexToRgb("#C5D030"),
      hexToRgb("#A8B828"),
      hexToRgb("#D8E048"),
      hexToRgb("#8B8C2A"),
    ],
    expressive: [
      hexToRgb("#F0A020"),
      hexToRgb("#C85090"),
      hexToRgb("#60B8D8"),
      hexToRgb("#D080C0"),
    ],
  },
  emerald: {
    subtle: [
      hexToRgb("#D4E8B0"),
      hexToRgb("#A8C878"),
      hexToRgb("#E8E4C8"),
      hexToRgb("#C8D898"),
    ],
    activated: [
      hexToRgb("#8BC34A"),
      hexToRgb("#3A4A10"),
      hexToRgb("#C9A830"),
      hexToRgb("#A4D440"),
    ],
    expressive: [
      hexToRgb("#6AAF20"),
      hexToRgb("#1A1A0A"),
      hexToRgb("#E0B818"),
      hexToRgb("#88E040"),
    ],
  },
  plumage: {
    subtle: [
      hexToRgb("#C0D0E0"),
      hexToRgb("#8A7068"),
      hexToRgb("#D8C8B8"),
      hexToRgb("#A0B8C8"),
    ],
    activated: [
      hexToRgb("#8BB4D0"),
      hexToRgb("#3A2520"),
      hexToRgb("#C48030"),
      hexToRgb("#5A88A8"),
    ],
    expressive: [
      hexToRgb("#70A8D8"),
      hexToRgb("#281810"),
      hexToRgb("#E09028"),
      hexToRgb("#4070A0"),
    ],
  },
  copper: {
    subtle: [
      hexToRgb("#D8C0B0"),
      hexToRgb("#B8A0C0"),
      hexToRgb("#E0C8B8"),
      hexToRgb("#C8B0A0"),
    ],
    activated: [
      hexToRgb("#A04820"),
      hexToRgb("#8A6BA0"),
      hexToRgb("#C86030"),
      hexToRgb("#D0A890"),
    ],
    expressive: [
      hexToRgb("#C03810"),
      hexToRgb("#7050A8"),
      hexToRgb("#E05020"),
      hexToRgb("#D89878"),
    ],
  },
  monarch: {
    subtle: [
      hexToRgb("#E8D8A8"),
      hexToRgb("#90A8C0"),
      hexToRgb("#D0C8B0"),
      hexToRgb("#E0D0A0"),
    ],
    activated: [
      hexToRgb("#D4A030"),
      hexToRgb("#4878A0"),
      hexToRgb("#1A2030"),
      hexToRgb("#E8C060"),
    ],
    expressive: [
      hexToRgb("#E8A010"),
      hexToRgb("#3060A8"),
      hexToRgb("#101828"),
      hexToRgb("#F0D048"),
    ],
  },
};

type StageParams = Omit<ShaderParams, "colors" | "colorCount">;

const WING_STAGE_PARAMS: Record<Wing, Record<Stage, StageParams>> = {
  default: {
    subtle: {
      intensity: 0.5,
      symmetry: 1.0,
      noiseScale: 1.5,
      noiseSpeed: 50,
      animate: true,
      grainAmount: 0.5,
      flowAngle: 90,
      curveDistortion: 0.45,
      depthIntensity: 0.35,
      highlightStrength: 0.25,
      foldScale: 0.5,
    },
    activated: {
      intensity: 0.7,
      symmetry: 1.0,
      noiseScale: 2.0,
      noiseSpeed: 75,
      animate: true,
      grainAmount: 0.5,
      flowAngle: 45,
      curveDistortion: 0.6,
      depthIntensity: 0.5,
      highlightStrength: 0.4,
      foldScale: 0.6,
    },
    expressive: {
      intensity: 1.0,
      symmetry: 0,
      noiseScale: 5,
      noiseSpeed: 100,
      animate: true,
      grainAmount: 0.5,
      flowAngle: 200,
      curveDistortion: 0.9,
      depthIntensity: 0.8,
      highlightStrength: 0.7,
      foldScale: 0.7,
    },
  },
  emerald: {
    subtle: {
      intensity: 0.45,
      symmetry: 0.95,
      noiseScale: 1.8,
      noiseSpeed: 35,
      animate: true,
      grainAmount: 0.3,
      flowAngle: 110,
      curveDistortion: 0.4,
      depthIntensity: 0.45,
      highlightStrength: 0.2,
      foldScale: 0.45,
    },
    activated: {
      intensity: 0.65,
      symmetry: 0.9,
      noiseScale: 2.2,
      noiseSpeed: 40,
      animate: true,
      grainAmount: 0.35,
      flowAngle: 120,
      curveDistortion: 0.5,
      depthIntensity: 0.6,
      highlightStrength: 0.35,
      foldScale: 0.55,
    },
    expressive: {
      intensity: 0.9,
      symmetry: 0.8,
      noiseScale: 3.5,
      noiseSpeed: 60,
      animate: true,
      grainAmount: 0.25,
      flowAngle: 140,
      curveDistortion: 0.75,
      depthIntensity: 0.75,
      highlightStrength: 0.55,
      foldScale: 0.65,
    },
  },
  plumage: {
    subtle: {
      intensity: 0.4,
      symmetry: 0.8,
      noiseScale: 2.0,
      noiseSpeed: 40,
      animate: true,
      grainAmount: 0.35,
      flowAngle: 50,
      curveDistortion: 0.35,
      depthIntensity: 0.4,
      highlightStrength: 0.3,
      foldScale: 0.55,
    },
    activated: {
      intensity: 0.6,
      symmetry: 0.7,
      noiseScale: 3.0,
      noiseSpeed: 55,
      animate: true,
      grainAmount: 0.4,
      flowAngle: 60,
      curveDistortion: 0.55,
      depthIntensity: 0.55,
      highlightStrength: 0.45,
      foldScale: 0.65,
    },
    expressive: {
      intensity: 0.85,
      symmetry: 0.5,
      noiseScale: 4.5,
      noiseSpeed: 80,
      animate: true,
      grainAmount: 0.45,
      flowAngle: 75,
      curveDistortion: 0.8,
      depthIntensity: 0.7,
      highlightStrength: 0.6,
      foldScale: 0.75,
    },
  },
  copper: {
    subtle: {
      intensity: 0.5,
      symmetry: 0.6,
      noiseScale: 1.6,
      noiseSpeed: 35,
      animate: true,
      grainAmount: 0.4,
      flowAngle: 140,
      curveDistortion: 0.5,
      depthIntensity: 0.45,
      highlightStrength: 0.3,
      foldScale: 0.5,
    },
    activated: {
      intensity: 0.75,
      symmetry: 0.5,
      noiseScale: 2.5,
      noiseSpeed: 45,
      animate: true,
      grainAmount: 0.45,
      flowAngle: 150,
      curveDistortion: 0.7,
      depthIntensity: 0.65,
      highlightStrength: 0.5,
      foldScale: 0.6,
    },
    expressive: {
      intensity: 0.95,
      symmetry: 0.3,
      noiseScale: 4.0,
      noiseSpeed: 70,
      animate: true,
      grainAmount: 0.5,
      flowAngle: 170,
      curveDistortion: 0.85,
      depthIntensity: 0.8,
      highlightStrength: 0.65,
      foldScale: 0.7,
    },
  },
  monarch: {
    subtle: {
      intensity: 0.55,
      symmetry: 0.75,
      noiseScale: 2.0,
      noiseSpeed: 45,
      animate: true,
      grainAmount: 0.25,
      flowAngle: 70,
      curveDistortion: 0.4,
      depthIntensity: 0.5,
      highlightStrength: 0.35,
      foldScale: 0.4,
    },
    activated: {
      intensity: 0.85,
      symmetry: 0.6,
      noiseScale: 3.5,
      noiseSpeed: 65,
      animate: true,
      grainAmount: 0.3,
      flowAngle: 80,
      curveDistortion: 0.65,
      depthIntensity: 0.7,
      highlightStrength: 0.55,
      foldScale: 0.5,
    },
    expressive: {
      intensity: 1.0,
      symmetry: 0.4,
      noiseScale: 5.5,
      noiseSpeed: 90,
      animate: true,
      grainAmount: 0.2,
      flowAngle: 95,
      curveDistortion: 0.9,
      depthIntensity: 0.85,
      highlightStrength: 0.7,
      foldScale: 0.6,
    },
  },
};

export function getPreset(wing: Wing, stage: Stage): ShaderParams {
  return {
    ...WING_STAGE_PARAMS[wing][stage],
    colorCount: 4,
    colors: WING_PALETTES[wing][stage],
  };
}

export const STAGE_PRESETS: Record<Stage, ShaderParams> = {
  subtle: getPreset("default", "subtle"),
  activated: getPreset("default", "activated"),
  expressive: getPreset("default", "expressive"),
};

export const PARAM_RANGES: Record<
  keyof Omit<ShaderParams, "colors" | "colorCount" | "animate">,
  { min: number; max: number; step: number; label: string }
> = {
  intensity: { min: 0, max: 1, step: 0.01, label: "Intensity" },
  symmetry: { min: 0, max: 1, step: 0.01, label: "Symmetry" },
  noiseScale: { min: 0.5, max: 10, step: 0.1, label: "Noise Scale" },
  noiseSpeed: { min: 1, max: 200, step: 1, label: "Speed" },
  grainAmount: { min: 0, max: 1, step: 0.01, label: "Grain" },
  flowAngle: { min: 0, max: 360, step: 1, label: "Flow Angle" },
  curveDistortion: { min: 0, max: 1, step: 0.01, label: "Curve Distortion" },
  depthIntensity: { min: 0, max: 1, step: 0.01, label: "Depth" },
  highlightStrength: { min: 0, max: 1, step: 0.01, label: "Highlights" },
  foldScale: { min: 0.1, max: 1, step: 0.01, label: "Fold Scale" },
};

export const VERTEX_SHADER = `#version 300 es
in vec4 a_position;
void main() {
  gl_Position = a_position;
}
`;

export const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_intensity;
uniform float u_symmetry;
uniform float u_noiseScale;
uniform float u_noiseSpeed;
uniform float u_grainAmount;
uniform float u_flowAngle;
uniform float u_curveDistortion;
uniform float u_depthIntensity;
uniform float u_highlightStrength;
uniform float u_foldScale;
uniform vec3 u_colors[8];
uniform int u_colorCount;

out vec4 fragColor;

vec3 mod289v3(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289v2(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute3(vec3 x) { return mod289v3(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289v2(i);
  vec3 p = permute3(permute3(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  float maxValue = 0.0;
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    value += amplitude * snoise(p * frequency);
    maxValue += amplitude;
    frequency *= 1.8;
    amplitude *= 0.55;
  }
  return value / maxValue;
}

vec2 warp(vec2 p, float strength) {
  float n1 = fbm(p * 0.4 + u_time * 0.15, 2);
  float n2 = fbm(p * 0.4 + vec2(5.2, 1.3) + u_time * 0.13, 2);
  vec2 warped = p + strength * vec2(n1, n2);

  float n3 = fbm(warped * 0.6 + vec2(1.7, 9.2) + u_time * 0.11, 2);
  float n4 = fbm(warped * 0.6 + vec2(8.3, 2.8) + u_time * 0.09, 2);
  warped = warped + strength * 0.5 * vec2(n3, n4);

  return warped;
}

float glassWave(vec2 p, float scale, float speed) {
  float wave = sin(p.x * scale + u_time * speed + fbm(p * 0.5, 2) * 3.0);
  wave += sin(p.y * scale * 0.7 + u_time * speed * 0.8 + fbm(p * 0.6 + vec2(3.3, 7.1), 2) * 2.5);
  wave += sin((p.x + p.y) * scale * 0.5 + u_time * speed * 0.6) * 0.5;
  return wave / 2.5;
}

float computeHeight(vec2 sUV, float fScale) {
  return glassWave(sUV, fScale * 0.8, 0.12) * 0.5 +
         fbm(sUV * 0.7 + u_time * 0.08, 2) * 0.3 +
         glassWave(sUV * 1.3 + vec2(2.2, 3.3), fScale * 1.5, 0.09) * 0.2;
}

vec3 getGradientColor(float t) {
  t = clamp(t, 0.0, 1.0);

  int count = clamp(u_colorCount, 2, 8);
  int segments = count - 1;

  float scaledT = t * float(segments);
  int idx = int(floor(scaledT));
  idx = min(idx, segments - 1);

  float localT = scaledT - float(idx);
  localT = localT * localT * (3.0 - 2.0 * localT);
  localT = localT * localT * (3.0 - 2.0 * localT);

  return mix(u_colors[idx], u_colors[idx + 1], localT);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.y = 1.0 - uv.y;

  vec2 symUv = uv;
  float mirrorX = 0.5 + (0.5 - abs(uv.x - 0.5));
  symUv.x = mix(uv.x, mirrorX, u_symmetry);

  float angle = u_flowAngle * 3.14159 / 180.0;
  vec2 center = vec2(0.5, 0.5);
  vec2 centeredUV = symUv - center;
  vec2 rotatedUV = vec2(
    centeredUV.x * cos(angle) - centeredUV.y * sin(angle),
    centeredUV.x * sin(angle) + centeredUV.y * cos(angle)
  );
  rotatedUV += center;

  vec2 surfaceUV = rotatedUV * u_noiseScale * 0.4;

  float fScale = u_foldScale * 3.0;
  float heightField = computeHeight(surfaceUV, fScale);

  vec2 warpedUV = warp(surfaceUV, u_curveDistortion * 2.0);

  float heightDisplace = heightField * u_curveDistortion * 0.8;
  warpedUV += vec2(heightDisplace, heightDisplace * 0.6);

  float eps = 0.01;
  float hX = computeHeight(surfaceUV + vec2(eps, 0.0), fScale);
  float hY = computeHeight(surfaceUV + vec2(0.0, eps), fScale);

  vec3 surfaceNormal = normalize(vec3(
    (heightField - hX) * 2.0,
    (heightField - hY) * 2.0,
    0.3
  ));

  vec3 lightDir = normalize(vec3(0.5, 0.6, 0.8));
  float diffuse = max(dot(surfaceNormal, lightDir), 0.0);

  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(surfaceNormal, halfDir), 0.0), 24.0);

  float fresnel = pow(1.0 - max(dot(surfaceNormal, viewDir), 0.0), 2.5);

  float lighting = diffuse * 0.7 + spec * 0.4 + fresnel * 0.2;

  float gradientT = rotatedUV.x;

  gradientT += fbm(warpedUV * 0.5, 2) * u_intensity * 0.8;

  gradientT += heightField * u_depthIntensity * 0.5;

  float lightShift = (lighting - 0.5) * u_depthIntensity * 0.4;
  gradientT += lightShift;

  gradientT += fresnel * u_highlightStrength * 0.2;

  vec3 surfaceColor = getGradientColor(gradientT);

  float brightnessVar = 1.0 + (lighting - 0.5) * u_highlightStrength * 0.3;
  brightnessVar += (heightField - 0.0) * u_depthIntensity * 0.15;
  surfaceColor *= brightnessVar;

  surfaceColor += vec3(spec * u_highlightStrength * 0.15);

  vec2 grainUV = gl_FragCoord.xy / 3.0;
  float grain = fract(sin(dot(grainUV + u_time * 0.3, vec2(12.9898, 78.233))) * 43758.5453);
  grain = (grain - 0.5) * u_grainAmount;

  vec3 finalColor = surfaceColor + grain;

  float luminance = dot(finalColor, vec3(0.299, 0.587, 0.114));
  finalColor = mix(vec3(luminance), finalColor, 1.0);

  fragColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
}
`;

export function getShaderCode(): string {
  return FRAGMENT_SHADER;
}

export function rgbToHex(rgb: [number, number, number]): string {
  const r = Math.round(rgb[0] * 255).toString(16).padStart(2, "0");
  const g = Math.round(rgb[1] * 255).toString(16).padStart(2, "0");
  const b = Math.round(rgb[2] * 255).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
}

export { hexToRgb };
