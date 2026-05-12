import { useState, useEffect } from "react";
import { Button, CopyToClipboard, ChevronDownIcon, ChevronUpIcon, DownloadIcon } from "@multiverse-io/stardust-react";
import { type ShaderParams, type Stage, type Wing, getPreset, getShaderCode } from "./shaders";
import wingEmerald from "@/assets/wing-emerald.png";
import wingPlumage from "@/assets/wing-plumage.png";
import wingCopper from "@/assets/wing-copper.png";
import wingMonarch from "@/assets/wing-monarch.png";

type ViewMode = "fullscreen" | "framed";

interface ShaderControlsProps {
  params: ShaderParams;
  stage: Stage;
  wing: Wing;
  onStageChange: (stage: Stage) => void;
  onWingChange: (wing: Wing) => void;
  onParamsChange: (params: ShaderParams) => void;
  onDownloadPng: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSetCollapsed: (collapsed: boolean) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

function rgbToHex(rgb: [number, number, number]): string {
  return "#" + rgb.map(c => Math.round(c * 255).toString(16).padStart(2, "0")).join("");
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

function SliderControl({ label, value, min, max, step, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col" style={{ gap: "4px" }}>
      <div className="flex justify-between items-center">
        <label className="text-xs text-white/70">{label}</label>
        <span className="text-xs text-white/50 font-mono">{value.toFixed(step >= 1 ? 0 : 2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-white/80 h-[2px] bg-white/20 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[12px] [&::-webkit-slider-thumb]:h-[12px]
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:shadow-[0_0_4px_rgba(255,255,255,0.3)]"
      />
    </div>
  );
}

function ColorPicker({ label, value, onChange }: {
  label: string;
  value: [number, number, number];
  onChange: (v: [number, number, number]) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-xs text-white/70">{label}</label>
      <div className="flex items-center" style={{ gap: "8px" }}>
        <span className="text-xs text-white/40 font-mono">{rgbToHex(value)}</span>
        <input
          type="color"
          value={rgbToHex(value)}
          onChange={(e) => onChange(hexToRgb(e.target.value))}
          className="w-[28px] h-[28px] rounded-md border border-white/20 cursor-pointer bg-transparent
            [&::-webkit-color-swatch-wrapper]:p-[2px] [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-none"
        />
      </div>
    </div>
  );
}

const STAGE_LABELS: Record<Stage, { label: string; description: string }> = {
  subtle: { label: "Subtle", description: "Soft textures, gentle tones" },
  activated: { label: "Activated", description: "Saturated shades, moderate depth" },
  expressive: { label: "Expressive", description: "Vivid gradients, bold contrast" },
};

const WING_OPTIONS: { id: Wing; label: string; image: string | null }[] = [
  { id: "default", label: "Default", image: null },
  { id: "emerald", label: "Emerald Wing", image: wingEmerald },
  { id: "plumage", label: "Plumage", image: wingPlumage },
  { id: "copper", label: "Copper Veil", image: wingCopper },
  { id: "monarch", label: "Monarch", image: wingMonarch },
];

const SM_BREAKPOINT = 640;

export default function ShaderControls({
  params,
  stage,
  wing,
  onStageChange,
  onWingChange,
  onParamsChange,
  onDownloadPng,
  isCollapsed,
  onToggleCollapse,
  onSetCollapsed,
  viewMode,
  onViewModeChange,
}: ShaderControlsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < SM_BREAKPOINT) {
        onSetCollapsed(true);
      } else {
        onSetCollapsed(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [onSetCollapsed]);

  const updateParam = <K extends keyof ShaderParams>(key: K, value: ShaderParams[K]) => {
    onParamsChange({ ...params, [key]: value });
  };

  const wingThumbnails = WING_OPTIONS.filter(w => w.image !== null) as { id: Wing; label: string; image: string }[];

  return (
    <div
      className="flex flex-col bg-black/60 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden transition-all duration-300"
      data-testid="shader-controls"
    >
      <button
        onClick={onToggleCollapse}
        className="flex items-center justify-between w-full text-left cursor-pointer bg-transparent border-none"
        style={{ padding: "12px 16px" }}
        data-testid="controls-toggle"
      >
        <span className="text-s font-medium text-white">Controls</span>
        {isCollapsed ? (
          <ChevronDownIcon size="small" className="text-white/60" />
        ) : (
          <ChevronUpIcon size="small" className="text-white/60" />
        )}
      </button>

      <div
        className="overflow-hidden transition-all duration-300"
        style={{
          maxHeight: isCollapsed ? "0px" : "1200px",
          opacity: isCollapsed ? 0 : 1,
        }}
      >
        <div className="flex flex-col overflow-y-auto" style={{ padding: "0 16px 16px", gap: "16px", maxHeight: "70vh" }}>
          <div className="flex flex-col" style={{ gap: "8px" }}>
            <div className="flex items-center justify-between">
              <label className="text-xs text-white/70 font-medium">Wing Inspiration</label>
              {wing !== "default" && (
                <button
                  onClick={() => onWingChange("default")}
                  className="text-[10px] text-white/50 hover:text-white/80 transition-colors cursor-pointer bg-white/10 hover:bg-white/20 rounded px-2 py-0.5"
                  data-testid="wing-default"
                >
                  Reset to Default
                </button>
              )}
            </div>
            <div className="grid grid-cols-2" style={{ gap: "6px" }}>
              {wingThumbnails.map(({ id, label, image }) => (
                <button
                  key={id}
                  onClick={() => onWingChange(id)}
                  className={`relative overflow-hidden rounded-md border cursor-pointer transition-all duration-200 ${
                    wing === id
                      ? "border-white ring-1 ring-white/50"
                      : "border-white/10 hover:border-white/30"
                  }`}
                  style={{ height: "64px" }}
                  data-testid={`wing-${id}`}
                >
                  <img
                    src={image}
                    alt={label}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span className="absolute bottom-0 left-0 right-0 text-[10px] font-medium text-white/90 text-center" style={{ padding: "4px" }}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10" />

          <div className="flex flex-col" style={{ gap: "8px" }}>
            <label className="text-xs text-white/70 font-medium">Stage</label>
            <div className="flex" style={{ gap: "6px" }}>
              {(["subtle", "activated", "expressive"] as Stage[]).map((s) => (
                <button
                  key={s}
                  onClick={() => onStageChange(s)}
                  className={`flex-1 rounded-md text-xs font-medium transition-all duration-200 border cursor-pointer ${
                    stage === s
                      ? "bg-white text-black border-white"
                      : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                  style={{ padding: "6px 8px" }}
                  data-testid={`stage-${s}`}
                >
                  {STAGE_LABELS[s].label}
                </button>
              ))}
            </div>
            <p className="text-xs text-white/40">{STAGE_LABELS[stage].description}</p>
          </div>

          <div className="border-t border-white/10" />

          <div className="flex flex-col" style={{ gap: "8px" }}>
            <label className="text-xs text-white/70 font-medium">View</label>
            <div className="flex" style={{ gap: "6px" }}>
              {(["fullscreen", "framed"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onViewModeChange(mode)}
                  className={`flex-1 rounded-md text-xs font-medium transition-all duration-200 border cursor-pointer ${
                    viewMode === mode
                      ? "bg-white text-black border-white"
                      : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                  style={{ padding: "6px 8px" }}
                >
                  {mode === "fullscreen" ? "Fullscreen" : "Framed"}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10" />

          <div className="flex flex-col" style={{ gap: "8px" }}>
            <div className="flex items-center justify-between">
              <label className="text-xs text-white/70 font-medium">Colors ({params.colorCount})</label>
              <div className="flex items-center" style={{ gap: "4px" }}>
                <button
                  onClick={() => {
                    const randColor = (): [number, number, number] => [Math.random(), Math.random(), Math.random()];
                    const newColors = params.colors.map(() => randColor());
                    onParamsChange({ ...params, colors: newColors });
                  }}
                  className="text-xs text-white/50 hover:text-white/90 transition-colors cursor-pointer bg-white/10 hover:bg-white/20 rounded px-2 py-0.5"
                >
                  Randomise
                </button>
              </div>
            </div>
            <div className="flex flex-col" style={{ gap: "6px" }}>
              {params.colors.slice(0, params.colorCount).map((color, i) => (
                <div key={i} className="flex items-center" style={{ gap: "4px" }}>
                  <div className="flex-1">
                    <ColorPicker
                      label={`Color ${i + 1}`}
                      value={color}
                      onChange={(v) => {
                        const newColors = [...params.colors];
                        newColors[i] = v;
                        onParamsChange({ ...params, colors: newColors });
                      }}
                    />
                  </div>
                  {params.colorCount > 2 && (
                    <button
                      onClick={() => {
                        const newColors = params.colors.filter((_, idx) => idx !== i);
                        onParamsChange({ ...params, colorCount: params.colorCount - 1, colors: newColors });
                      }}
                      className="text-white/30 hover:text-white/80 transition-colors cursor-pointer text-xs w-[20px] h-[20px] flex items-center justify-center rounded bg-white/5 hover:bg-white/15"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {params.colorCount < 8 && (
                <button
                  onClick={() => {
                    const newColors = [...params.colors, [Math.random(), Math.random(), Math.random()] as [number, number, number]];
                    onParamsChange({ ...params, colorCount: params.colorCount + 1, colors: newColors });
                  }}
                  className="text-xs text-white/50 hover:text-white/80 transition-colors cursor-pointer border border-dashed border-white/20 hover:border-white/40 rounded py-1 text-center"
                >
                  + Add Color
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-white/10" />

          <div className="flex flex-col" style={{ gap: "8px" }}>
            <label className="text-xs text-white/70 font-medium">Animation</label>
            <div className="flex items-center justify-between">
              <label className="text-xs text-white/70">Animate</label>
              <button
                onClick={() => updateParam("animate", !params.animate)}
                className={`w-[36px] h-[20px] rounded-full transition-colors duration-200 cursor-pointer border-none relative ${
                  params.animate ? "bg-white" : "bg-white/20"
                }`}
              >
                <span
                  className={`absolute top-[2px] w-[16px] h-[16px] rounded-full transition-all duration-200 ${
                    params.animate ? "left-[18px] bg-black" : "left-[2px] bg-white/60"
                  }`}
                />
              </button>
            </div>
            <SliderControl label="Speed" value={params.noiseSpeed} min={1} max={200} step={1} onChange={(v) => updateParam("noiseSpeed", v)} />
          </div>

          <div className="border-t border-white/10" />

          <div className="flex flex-col" style={{ gap: "8px" }}>
            <label className="text-xs text-white/70 font-medium">Flow</label>
            <SliderControl label="Flow Angle" value={params.flowAngle} min={0} max={360} step={1} onChange={(v) => updateParam("flowAngle", v)} />
            <SliderControl label="Noise Scale" value={params.noiseScale} min={0.5} max={10} step={0.1} onChange={(v) => updateParam("noiseScale", v)} />
            <SliderControl label="Intensity" value={params.intensity} min={0} max={1} step={0.01} onChange={(v) => updateParam("intensity", v)} />
            <SliderControl label="Curve Distortion" value={params.curveDistortion} min={0} max={1} step={0.01} onChange={(v) => updateParam("curveDistortion", v)} />
          </div>

          <div className="border-t border-white/10" />

          <div className="flex flex-col" style={{ gap: "8px" }}>
            <label className="text-xs text-white/70 font-medium">Depth & Light</label>
            <SliderControl label="Depth" value={params.depthIntensity} min={0} max={1} step={0.01} onChange={(v) => updateParam("depthIntensity", v)} />
            <SliderControl label="Highlights" value={params.highlightStrength} min={0} max={1} step={0.01} onChange={(v) => updateParam("highlightStrength", v)} />
            <SliderControl label="Fold Scale" value={params.foldScale} min={0.1} max={1} step={0.01} onChange={(v) => updateParam("foldScale", v)} />
            <SliderControl label="Grain" value={params.grainAmount} min={0} max={1} step={0.01} onChange={(v) => updateParam("grainAmount", v)} />
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-xs text-white/50 hover:text-white/70 transition-colors bg-transparent border-none cursor-pointer"
            style={{ gap: "4px", padding: "0" }}
          >
            {showAdvanced ? <ChevronUpIcon size="small" /> : <ChevronDownIcon size="small" />}
            Symmetry
          </button>

          {showAdvanced && (
            <div className="flex flex-col" style={{ gap: "12px" }}>
              <SliderControl label="Symmetry" value={params.symmetry} min={0} max={1} step={0.01} onChange={(v) => updateParam("symmetry", v)} />
            </div>
          )}

          <div className="border-t border-white/10" />

          <div className="flex flex-col" style={{ gap: "8px" }}>
            <button
              onClick={onDownloadPng}
              className="flex items-center justify-center w-full rounded-md text-xs font-medium bg-white/10 text-white border border-white/10 hover:bg-white/15 transition-colors cursor-pointer"
              style={{ padding: "8px", gap: "6px" }}
              data-testid="download-png"
            >
              <DownloadIcon size="small" />
              Download PNG
            </button>
            <div className="[&_div]:bg-transparent [&_input]:bg-white/5 [&_input]:border-white/10 [&_input]:text-white/60 [&_input]:text-xs [&_label]:text-white/70 [&_label]:text-xs [&_button]:bg-white/10 [&_button]:border-white/10 [&_button]:text-white/70 [&_button]:text-xs">
              <CopyToClipboard
                id="shader-code"
                value={getShaderCode()}
                label="Shader Code"
                hideLabel
                buttonText="Copy GLSL"
              />
            </div>
            <Button
              variant="outline"
              size="small"
              onClick={() => onParamsChange({ ...getPreset(wing, stage) })}
              className="w-full text-xs"
            >
              Reset to Preset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
