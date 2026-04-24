import { Loader2, Move, RefreshCcw, ScanSearch, Sparkles } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type BrandAssetKind = "logo" | "icon";

type CropOffset = {
  x: number;
  y: number;
};

type BrandAssetEditorProps = {
  file: File;
  kind: BrandAssetKind;
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: (file: File) => void;
};

type BrandAssetPreset = {
  aspectRatio: number;
  previewWidth: number;
  previewHeight: number;
  outputWidth: number;
  outputHeight: number;
  title: string;
  description: string;
  recommendedSize: string;
};

const PRESETS: Record<BrandAssetKind, BrandAssetPreset> = {
  logo: {
    aspectRatio: 3,
    previewWidth: 360,
    previewHeight: 120,
    outputWidth: 1200,
    outputHeight: 400,
    title: "Editor de logo",
    description:
      "Centra el isotipo o la palabra principal dentro del marco horizontal para que se vea bien en sidebar y cabeceras.",
    recommendedSize: "1200 x 400 px, idealmente PNG transparente o SVG.",
  },
  icon: {
    aspectRatio: 1,
    previewWidth: 240,
    previewHeight: 240,
    outputWidth: 512,
    outputHeight: 512,
    title: "Editor de icono",
    description:
      "Ajusta la marca dentro del cuadro para favicon, avatar de tenant y navegacion compacta.",
    recommendedSize: "512 x 512 px, idealmente PNG transparente o SVG.",
  },
};

export function BrandAssetEditor({
  file,
  kind,
  isPending = false,
  onCancel,
  onConfirm,
}: BrandAssetEditorProps) {
  const preset = PRESETS[kind];
  const previewUrl = useMemo(() => URL.createObjectURL(file), [file]);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    originX: number;
    originY: number;
    startOffset: CropOffset;
  } | null>(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<CropOffset>({ x: 0, y: 0 });
  const isSvg = file.type === "image/svg+xml";

  useEffect(() => () => URL.revokeObjectURL(previewUrl), [previewUrl]);

  const baseScale = useMemo(() => {
    if (!naturalSize.width || !naturalSize.height) return 1;
    return Math.max(
      preset.previewWidth / naturalSize.width,
      preset.previewHeight / naturalSize.height,
    );
  }, [naturalSize.height, naturalSize.width, preset.previewHeight, preset.previewWidth]);

  const scaledSize = useMemo(() => {
    const width = naturalSize.width * baseScale * zoom;
    const height = naturalSize.height * baseScale * zoom;
    return { width, height };
  }, [baseScale, naturalSize.height, naturalSize.width, zoom]);

  const maxOffset = useMemo(
    () => ({
      x: Math.max(0, (scaledSize.width - preset.previewWidth) / 2),
      y: Math.max(0, (scaledSize.height - preset.previewHeight) / 2),
    }),
    [preset.previewHeight, preset.previewWidth, scaledSize.height, scaledSize.width],
  );

  const clampOffset = (nextOffset: CropOffset): CropOffset => ({
    x: clamp(nextOffset.x, -maxOffset.x, maxOffset.x),
    y: clamp(nextOffset.y, -maxOffset.y, maxOffset.y),
  });
  const safeOffset = clampOffset(offset);

  const transformStyle = {
    width: scaledSize.width,
    height: scaledSize.height,
    transform: `translate(${safeOffset.x}px, ${safeOffset.y}px)`,
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragRef.current = {
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY,
      startOffset: offset,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragRef.current.originX;
    const deltaY = event.clientY - dragRef.current.originY;

    setOffset(
      clampOffset({
        x: dragRef.current.startOffset.x + deltaX,
        y: dragRef.current.startOffset.y + deltaY,
      }),
    );
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleConfirm = async (mode: "crop" | "original") => {
    if (mode === "original") {
      onConfirm(file);
      return;
    }

    const image = imageRef.current;
    if (!image || !naturalSize.width || !naturalSize.height) return;

    const canvas = document.createElement("canvas");
    canvas.width = preset.outputWidth;
    canvas.height = preset.outputHeight;

    const context = canvas.getContext("2d");
    if (!context) return;

    const scaleFactor = preset.outputWidth / preset.previewWidth;
    const drawWidth = scaledSize.width * scaleFactor;
    const drawHeight = scaledSize.height * scaleFactor;
    const drawX =
      ((preset.previewWidth - scaledSize.width) / 2 + safeOffset.x) * scaleFactor;
    const drawY =
      ((preset.previewHeight - scaledSize.height) / 2 + safeOffset.y) * scaleFactor;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, drawX, drawY, drawWidth, drawHeight);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png", 0.96),
    );

    if (!blob) return;

    const baseName = file.name.replace(/\.[^.]+$/, "");
    onConfirm(
      new File([blob], `${baseName}-${kind}.png`, {
        type: "image/png",
      }),
    );
  };

  return (
    <div className="rounded-[1.75rem] border bg-[linear-gradient(180deg,_rgba(255,255,255,0.92),_rgba(248,250,252,0.82))] p-5 shadow-sm">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
            Ajuste visual
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">
            {preset.title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">{preset.description}</p>
        </div>

        <div className="rounded-2xl border bg-background/80 px-4 py-3 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Medida recomendada</p>
          <p className="mt-1">{preset.recommendedSize}</p>
          <p className="mt-1">
            Archivo actual: {naturalSize.width || "?"} x {naturalSize.height || "?"} px
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[1.5rem] border bg-muted/30 p-5">
          <div
            className="relative mx-auto overflow-hidden rounded-[1.5rem] border border-dashed border-primary/30 bg-[radial-gradient(circle_at_center,_rgba(79,143,131,0.16),_rgba(255,255,255,0.95)_58%)] shadow-inner touch-none"
            style={{
              width: preset.previewWidth,
              height: preset.previewHeight,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <img
              ref={imageRef}
              src={previewUrl}
              alt={`Vista previa de ${kind}`}
              className="absolute left-1/2 top-1/2 select-none object-contain"
              style={{
                ...transformStyle,
                marginLeft: -scaledSize.width / 2,
                marginTop: -scaledSize.height / 2,
              }}
              draggable={false}
              onLoad={(event) => {
                const target = event.currentTarget;
                setNaturalSize({
                  width: target.naturalWidth,
                  height: target.naturalHeight,
                });
              }}
            />

            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-primary/20" />
              <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-primary/20" />
              <div className="absolute inset-3 rounded-[1.15rem] border border-white/70" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Move className="size-4" />
            Arrastra para centrar la imagen dentro del marco.
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[1.5rem] border bg-white/75 p-4">
            <Label htmlFor={`${kind}-zoom`} className="text-sm font-semibold">
              Zoom
            </Label>
            <Input
              id={`${kind}-zoom`}
              type="range"
              min="1"
              max="3"
              step="0.05"
              className="mt-3 h-10 rounded-2xl bg-white/80 px-0"
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
            />
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Contenido ajustado</span>
              <span>{zoom.toFixed(2)}x</span>
            </div>
          </div>

          <div className="rounded-[1.5rem] border bg-white/75 p-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <ScanSearch className="size-4 text-primary" />
              Recomendaciones
            </div>
            <ul className="mt-3 grid gap-2">
              <li>Deja aire alrededor del logo para que respire en la interfaz.</li>
              <li>Para icono, procura que el elemento principal quede cerca del centro.</li>
              <li>Si subes SVG y necesitas recorte, esta herramienta lo exportara como PNG.</li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={handleReset}
              disabled={isPending}
            >
              <RefreshCcw className="size-4" />
              Recentrar
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="rounded-full"
              onClick={onCancel}
              disabled={isPending}
            >
              Cancelar
            </Button>
          </div>

          <div className="grid gap-2">
            {isSvg && (
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => handleConfirm("original")}
                disabled={isPending}
              >
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                Usar SVG original
              </Button>
            )}

            <Button
              type="button"
              className={cn("rounded-full", isSvg && "bg-foreground text-background hover:bg-foreground/90")}
              onClick={() => handleConfirm("crop")}
              disabled={isPending}
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {isSvg ? "Recortar y exportar PNG" : "Guardar imagen ajustada"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
