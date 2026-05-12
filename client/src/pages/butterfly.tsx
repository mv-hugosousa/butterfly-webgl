import { useState, useRef, useCallback } from "react";
import { Link } from "wouter";
import multiverseLogo from "@/assets/multiverse-logo.svg";
import multiverseLarge from "@assets/Multiverse-large_1774570381313.png";
import multiverseWhite from "@assets/Multiverse-white_1774570490879.png";
import ShaderCanvas from "@/components/butterfly/ShaderCanvas";
import ShaderControls from "@/components/butterfly/ShaderControls";
import { type ShaderParams, type Stage, type Wing, getPreset } from "@/components/butterfly/shaders";

type ViewMode = "fullscreen" | "framed";

export default function ButterflyPage() {
  const [stage, setStage] = useState<Stage>("subtle");
  const [wing, setWing] = useState<Wing>("default");
  const [params, setParams] = useState<ShaderParams>(getPreset("default", "subtle"));
  const [controlsCollapsed, setControlsCollapsed] = useState(() => window.innerWidth < 640);
  const [shaderError, setShaderError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("fullscreen");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleStageChange = useCallback((newStage: Stage) => {
    setStage(newStage);
    setParams(getPreset(wing, newStage));
  }, [wing]);

  const handleWingChange = useCallback((newWing: Wing) => {
    setWing(newWing);
    setParams(getPreset(newWing, stage));
  }, [stage]);

  const handleSetCollapsed = useCallback((collapsed: boolean) => {
    setControlsCollapsed(collapsed);
  }, []);

  const handleDownloadPng = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `butterfly-${wing}-${stage}-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [wing, stage]);

  const isFramed = viewMode === "framed";

  return (
    <div
      className={`fixed inset-0 overflow-hidden transition-colors duration-500 ${isFramed ? "bg-[#F0EDE8]" : "bg-black"}`}
      data-testid="butterfly-page"
    >
      <header
        className="absolute top-0 left-0 right-0 flex items-center justify-between z-10"
        style={{ padding: "16px" }}
      >
        <Link href="/" className="flex items-center">
          <img
            src={isFramed ? multiverseLarge : multiverseWhite}
            alt="Multiverse"
            className="h-[24px] w-auto opacity-80 hover:opacity-100 transition-opacity duration-500"
          />
        </Link>
        <span className={`text-xs font-medium tracking-wider uppercase transition-colors duration-500 ${isFramed ? "text-black/40" : "text-white/40"}`}>
          Butterfly
        </span>
      </header>

      {isFramed ? (
        <div className="absolute inset-0 flex items-center justify-center" style={{ padding: "80px 16px 16px" }}>
          <div
            className="relative w-full h-full flex flex-col items-center justify-center"
            style={{ maxWidth: "900px", maxHeight: "700px" }}
          >
            <div
              className="relative w-full overflow-hidden bg-white"
              style={{
                borderRadius: "12px",
                aspectRatio: "4 / 3",
              }}
            >
              <ShaderCanvas
                params={params}
                canvasRef={canvasRef}
                onError={setShaderError}
              />
            </div>
            <div
              className="w-full flex items-end justify-between"
              style={{ padding: "16px 4px 0" }}
            >
              <span className="text-[10px] text-black/40 font-medium tracking-widest uppercase">Multiverse.io</span>
              <span className="text-[10px] text-black/40 font-medium tracking-widest uppercase">AI Adoption OS</span>
            </div>
            <div className="w-full" style={{ marginTop: "4px" }}>
              <img
                src={multiverseLarge}
                alt="Multiverse"
                className="w-full"
              />
            </div>
          </div>
        </div>
      ) : (
        <ShaderCanvas
          params={params}
          canvasRef={canvasRef}
          onError={setShaderError}
        />
      )}

      {shaderError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
          <div className="flex flex-col items-center text-center" style={{ gap: "12px", maxWidth: "400px", padding: "24px" }}>
            <span className="text-m font-medium text-white">Shader Error</span>
            <p className="text-s text-white/60">{shaderError}</p>
            <p className="text-xs text-white/40">Your browser may not support WebGL2. Try a different browser or device.</p>
          </div>
        </div>
      )}

      <div
        className="absolute bottom-0 right-0 z-10 w-full sm:w-[320px]"
        style={{ padding: "16px" }}
      >
        <ShaderControls
          params={params}
          stage={stage}
          wing={wing}
          onStageChange={handleStageChange}
          onWingChange={handleWingChange}
          onParamsChange={setParams}
          onDownloadPng={handleDownloadPng}
          isCollapsed={controlsCollapsed}
          onToggleCollapse={() => setControlsCollapsed(prev => !prev)}
          onSetCollapsed={handleSetCollapsed}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>
    </div>
  );
}
