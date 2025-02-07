"use client";

import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { nanoid } from "nanoid";
import { LiveObject } from "@liveblocks/client";
import {
  useCanRedo,
  useCanUndo,
  useHistory,
  useMutation,
  useOthersMapped,
  useSelf,
  useStorage,
} from "@/liveblocks.config";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toPng } from "html-to-image";

import {
  CanvasMode,
  LayerType,
  type Camera,
  type CanvasState,
  type Color,
  type Point, Side, XYWH,
} from "@/types/canvas";
import {
  colorToCSS,
  connectionIdToColor,
  findIntersectingLayersWithRectangle,
  penPointsToPathLayer, pointerEventToCanvasPoint, resizeBounds
} from "@/lib/utils";

import { CursorsPresence } from "./cursors-presence";
import { Info } from "./info";
import { LayerPreview } from "./layer-preview";
import { Participants } from "./participants";
import { Toolbar } from "./toolbar";
import { SelectionBox } from "./selection-box";
import { SelectionTools } from "./selection-tools";
import { Path } from "./path";
import { ResetCamera } from "./reset-camera";
import LaserPointer from "./laser";

import { useDisableScrollBounce } from "@/hooks/use-disable-scroll-bounce";
import { useDeleteLayers } from "@/hooks/use-delete-layers";

const MAX_LAYERS = 100;
const MULTISELECTION_THRESHOLD = 5;
const MOVE_OFFSET = 5;

type CanvasProps = {
  boardId: string;
};

export const Canvas = ({ boardId }: CanvasProps) => {
  const layerIds = useStorage((root) => root.layerIds);

  const pencilDraft = useSelf((me) => me.presence.pencilDraft);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });
  const resetCamera = useCallback(() => {
    setCamera({ x: 0, y: 0 });
  }, []);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const data = useQuery(api.board.get, { id: boardId as Id<"boards"> });

  const [pendingLayerType, setPendingLayerType] = useState<
    LayerType.Ellipse
    | LayerType.Rectangle
    | LayerType.Text
    | LayerType.Note | null>(null);
  const [lastUsedColor, setLastUsedColor] = useState<Color>({
    r: 0,
    g: 0,
    b: 0,
  });

  const [laserPointer, setLaserPointer] = useState<{ points: number[][]; visible: boolean }>({
    points: [],
    visible: true,
  });

  useDisableScrollBounce();
  const history = useHistory();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const layerIdsRef = useStorage((root) => root.layerIds);
  const liveLayersRef = useStorage((root) => root.layers);

  const insertLayer = useMutation(
    (
      { storage, setMyPresence },
      layerType:
        | LayerType.Rectangle
        | LayerType.Ellipse
        | LayerType.Text
        | LayerType.Note,
      position: Point
    ) => {
      const liveLayers = storage.get("layers");
      if (liveLayers.size >= MAX_LAYERS) return;
      const liveLayerIds = storage.get("layerIds");
      const layerId = nanoid();
      const layer = new LiveObject({
        type: layerType,
        x: position.x,
        y: position.y,
        height: 100,
        width: 100,
        fill: lastUsedColor,
      });

      liveLayerIds.push(layerId);
      liveLayers.set(layerId, layer);
      setMyPresence({ selection: [layerId] }, { addToHistory: true });
      setCanvasState({ mode: CanvasMode.None });
      console.log(layerType)
    },
    [lastUsedColor]
  );

  const translateSelectedLayers = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Translating) return;

      const offset = {
        x: point.x - canvasState.current.x,
        y: point.y - canvasState.current.y,
      };

      const liveLayers = storage.get("layers");

      for (const id of self.presence.selection) {
        const layer = liveLayers.get(id);

        if (layer)
          layer.update({
            x: layer.get("x") + offset.x,
            y: layer.get("y") + offset.y,
          });
      }

      setCanvasState({ mode: CanvasMode.Translating, current: point });
    },
    [canvasState],
  );

  const unselectLayers = useMutation(({ self, setMyPresence }) => {
    if (self.presence.selection.length > 0) {
      setMyPresence({ selection: [] }, { addToHistory: true });
    }
  }, []);

  const updateSelection = useMutation((
    { storage, setMyPresence },
    current: Point, origin: Point) => {
    const layers = storage.get("layers").toImmutable();
    setCanvasState({ mode: CanvasMode.SelectionNet, origin, current });
    const ids = findIntersectingLayersWithRectangle(
      layerIds,
      layers,
      origin,
      current,
    );

    setMyPresence({ selection: ids });
  }, [layerIds]);

  const startMultiSelection = useCallback((current: Point, origin: Point) => {
    if (
      Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) >
      MULTISELECTION_THRESHOLD
    ) {
      setCanvasState({
        mode: CanvasMode.SelectionNet,
        origin,
        current,
      });
    }
  }, []);

  const exportAsPng = () => {
    if (svgRef.current) {
      const bbox = svgRef.current.getBBox();
      const svgClone = svgRef.current.cloneNode(true) as SVGSVGElement;

      svgClone.setAttribute("width", bbox.width.toString());
      svgClone.setAttribute("height", bbox.height.toString());
      svgClone.setAttribute(
        "viewBox",
        `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`
      );

      document.body.appendChild(svgClone);

      toPng(svgClone as unknown as HTMLElement)
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = `${data?.title || "download"}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          document.body.removeChild(svgClone);
        })
        .catch((error) => {
          console.error("Error exporting SVG to PNG", error);
          document.body.removeChild(svgClone);
        });
    }
  };

  const continueDrawing = useMutation(
    ({ self, setMyPresence }, point: Point, event: React.PointerEvent) => {
      const { pencilDraft } = self.presence;

      if (
        canvasState.mode !== CanvasMode.Pencil ||
        event.buttons !== 1 ||
        !pencilDraft
      )
        return;

      setMyPresence({
        cursor: point,
        pencilDraft:
          pencilDraft.length === 1 &&
            pencilDraft[0][0] === point.x &&
            pencilDraft[0][1] === point.y
            ? pencilDraft
            : [...pencilDraft, [point.x, point.y, event.pressure]],
      });
    },
    [canvasState.mode]
  );

  const insertPath = useMutation(
    ({ storage, self, setMyPresence }) => {
      const liveLayers = storage.get("layers");
      const { pencilDraft } = self.presence;

      if (
        !pencilDraft ||
        pencilDraft.length < 2 ||
        liveLayers.size >= MAX_LAYERS
      ) {
        setMyPresence({ pencilDraft: null });
        return;
      }

      const id = nanoid();
      liveLayers.set(
        id,
        new LiveObject(penPointsToPathLayer(pencilDraft, lastUsedColor))
      );

      const liveLayerIds = storage.get("layerIds");
      liveLayerIds.push(id);
      setMyPresence({ pencilDraft: null });
      setCanvasState({
        mode: CanvasMode.Pencil,
      });
    },
    [lastUsedColor]
  );

  const startDrawing = useMutation(
    ({ setMyPresence }, point: Point, pressure: number) => {
      setMyPresence({
        pencilDraft: [[point.x, point.y, pressure]],
        penColor: lastUsedColor,
      });
    },
    [lastUsedColor]
  );

  const resizeSelectedLayer = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Resizing) return;

      const bounds = resizeBounds(
        canvasState.initialBounds,
        canvasState.corner,
        point,
      );

      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(self.presence.selection[0]);

      if (layer) layer.update(bounds);
    },
    [canvasState],
  );

  const onResizeHandlePointerDown = useCallback(
    (corner: Side, initialBounds: XYWH) => {
      history.pause();

      setCanvasState({
        mode: CanvasMode.Resizing,
        initialBounds,
        corner,
      });
    },
    [history],
  );

  const onWheel = useCallback((e: React.WheelEvent) => {
    setCamera((camera) => ({
      x: camera.x - e.deltaX,
      y: camera.y - e.deltaY,
    }));
  }, []);
  const prevLaserTimeout = useRef<NodeJS.Timeout | null>(null);

  const onPointerMove = useMutation(
    ({ setMyPresence }, e: React.PointerEvent) => {
      e.preventDefault();
      const current = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode === CanvasMode.LaserPointer) {
        setLaserPointer((prev) => ({
          points: [...prev.points, [current.x, current.y]],
          visible: true,
        }));

        // Clear previous timeout to avoid multiple timers
        if (prevLaserTimeout.current) {
          clearTimeout(prevLaserTimeout.current);
        }

        prevLaserTimeout.current = setTimeout(() => {
          setLaserPointer((prev) => ({ ...prev, visible: false }));
        }, 1000);
      } else if (canvasState.mode === CanvasMode.Pressing) {
        startMultiSelection(current, canvasState.origin);
      } else if (canvasState.mode === CanvasMode.SelectionNet) {
        updateSelection(current, canvasState.origin);
      } else if (canvasState.mode === CanvasMode.Translating) {
        translateSelectedLayers(current);
      } else if (canvasState.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(current);
      } else if (canvasState.mode === CanvasMode.Pencil) {
        continueDrawing(current, e);
      }

      setMyPresence({ cursor: current });
    },
    [
      canvasState,
      resizeSelectedLayer,
      camera,
      translateSelectedLayers,
      startMultiSelection,
      continueDrawing,
      updateSelection,
      setLaserPointer,
    ]
  );

  const onPointerLeave = useMutation(({ setMyPresence }) => {
    setMyPresence({
      cursor: null,
    });
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera);
      if (canvasState.mode === CanvasMode.Inserting) return;
      if (canvasState.mode === CanvasMode.Pencil) {
        startDrawing(point, e.pressure)
        return;
      }
      if (canvasState.mode == CanvasMode.LaserPointer) {
        setCanvasState({ origin: point, mode: CanvasMode.LaserPointer });
        setLaserPointer({ points: [[point.x, point.y]], visible: true }); // Initialize points
      } else {
        setCanvasState({ origin: point, mode: CanvasMode.Pressing });
      }
    },
    [camera, canvasState.mode, setCanvasState, startDrawing],
  );


  useEffect(() => {
    return () => {
      if (prevLaserTimeout.current) {
        clearTimeout(prevLaserTimeout.current);
      }
    };
  }, []);
  const onPointerUp = useMutation(
    ({ }, e) => {
      const point = pointerEventToCanvasPoint(e, camera);
      if (canvasState.mode === CanvasMode.LaserPointer) {
        setLaserPointer({ points: [], visible: false });
      }

      if (
        canvasState.mode === CanvasMode.None ||
        canvasState.mode === CanvasMode.Pressing
      ) {
        unselectLayers();
        setCanvasState({
          mode: CanvasMode.None,
        });
      } else if (canvasState.mode === CanvasMode.Pencil) {
        insertPath();
      } else if (canvasState.mode === CanvasMode.Inserting) {
        if (pendingLayerType) {
          insertLayer(pendingLayerType, point);
          console.log(pendingLayerType, point);
          setPendingLayerType(null); // Clear the pending type after insertion
        } else
          insertLayer(canvasState.layerType, point);
      } else {
        setCanvasState({
          mode: CanvasMode.None,
        });
      }

      history.resume();
    },
    [camera,
      setCanvasState,
      canvasState,
      unselectLayers,
      history,
      insertLayer,
      insertPath]
  );

  const selections = useOthersMapped((other) => other.presence.selection)

  const onLayerPointerDown = useMutation(
    ({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
      if (
        canvasState.mode === CanvasMode.Pencil ||
        canvasState.mode === CanvasMode.Inserting
      ) return;
      history.pause();
      e.stopPropagation();
      const point = pointerEventToCanvasPoint(e, camera);
      if (!self.presence.selection.includes(layerId))
        setMyPresence({ selection: [layerId] }, { addToHistory: true });
      setCanvasState({ mode: CanvasMode.Translating, current: point });
    },
    [setCanvasState, camera, history, canvasState.mode]
  );

  const layerIdsToColorSelection = useMemo(() => {
    const layerIdsToColorSelection: Record<string, string> = {};
    for (const user of selections) {
      const [connectionId, selection] = user;
      for (const layerId of selection) {
        layerIdsToColorSelection[layerId] = connectionIdToColor(connectionId)
      }
    }
    return layerIdsToColorSelection;
  }, [selections])


  const duplicateLayers = useMutation(({ storage, self, setMyPresence }) => {
    const liveLayers = storage.get("layers");
    const liveLayerIds = storage.get("layerIds");
    const newLayerIds: string[] = [];
    const layersIdsToCopy = self.presence.selection;
    layersIdsToCopy.forEach((layerId) => {
      const newLayerId = nanoid();
      const layer = liveLayers.get(layerId);
      if (layer) {
        const newLayer = layer.clone();
        newLayer.set("x", newLayer.get("x") + 10);
        newLayer.set("y", newLayer.get("y") + 10);
        liveLayerIds.push(newLayerId);
        liveLayers.set(newLayerId, newLayer);
        newLayerIds.push(newLayerId);
      }
    });
    setMyPresence({ selection: [...newLayerIds] }, { addToHistory: true });
    setCanvasState({ mode: CanvasMode.None });
  }, []);

  const moveSelectedLayers = useMutation(
    ({ storage, self, setMyPresence }, offset: Point) => {
      const liveLayers = storage.get("layers");
      const selection = self.presence.selection;
      if (selection.length === 0) {
        return;
      }

      for (const id of selection) {
        const layer = liveLayers.get(id);
        if (layer) {
          layer.update({
            x: layer.get("x") + offset.x,
            y: layer.get("y") + offset.y,
          });
        }
      }

      setMyPresence({ selection }, { addToHistory: true });
    },
    [canvasState, history]
  );

  const deleteLayers = useDeleteLayers();
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      let offset: Point = { x: 0, y: 0 };
      switch (e.key) {
        case "z":
          if (e.ctrlKey || e.metaKey) {
            if (e.shiftKey || e.altKey) history.redo();
            else history.undo();

            break;
          }

        case "d": {
          e.preventDefault();
          if (e.ctrlKey && canvasState.mode === CanvasMode.None) duplicateLayers();
          break;
        }

        case "ArrowUp":
          offset = { x: 0, y: -MOVE_OFFSET };
          moveSelectedLayers(offset);
          break;
        case "ArrowDown":
          offset = { x: 0, y: MOVE_OFFSET };
          moveSelectedLayers(offset);
          break;
        case "ArrowLeft":
          offset = { x: -MOVE_OFFSET, y: 0 };
          moveSelectedLayers(offset);
          break;
        case "ArrowRight":
          offset = { x: MOVE_OFFSET, y: 0 };
          moveSelectedLayers(offset);
          break;

        default: break;
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [history,
    canvasState.mode,
    layerIds,
    setCanvasState,
    liveLayersRef,
    insertLayer,
    duplicateLayers,
    moveSelectedLayers]);

  return (
    <main
      className="h-full w-full relative bg-[#f2f2f2] touch-none">
      <Info boardId={boardId} exportAsPng={exportAsPng} />
      <Participants />
      <Toolbar
        canvasState={canvasState}
        setCanvasState={setCanvasState}
        canRedo={canRedo}
        canUndo={canUndo}
        undo={history.undo}
        redo={history.redo}
      />
      {camera.x != 0 && camera.y != 0 && <ResetCamera resetCamera={resetCamera} />}
      <SelectionTools
        onDuplicate={duplicateLayers}
        camera={camera}
        setLastUsedColor={setLastUsedColor}
        lastUsedColor={lastUsedColor}
      />

      <svg
        ref={svgRef}
        className="h-[100vh] w-[100vw]"
        onWheel={onWheel}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerUp={onPointerUp}
        onPointerDown={onPointerDown}
      >
        <g
          style={{
            transform: `translate(${camera.x}px, ${camera.y}px)`,
          }}
        >
          {layerIds.map((layerId) => (
            <LayerPreview
              key={layerId}
              id={layerId}
              onLayerPointerDown={onLayerPointerDown}
              selectionColor={layerIdsToColorSelection[layerId]}
            />
          ))}
          <SelectionBox onResizeHandlePointerDown={onResizeHandlePointerDown} />
          <LaserPointer points={laserPointer.points} visible={laserPointer.visible} />
          {canvasState.mode === CanvasMode.SelectionNet &&
            canvasState.current != null && (
              <rect
                className="fill-blue-500/5 stroke-blue-500 stroke-1"
                x={Math.min(canvasState.origin.x, canvasState.current.x)}
                y={Math.min(canvasState.origin.y, canvasState.current.y)}
                width={Math.abs(canvasState.origin.x - canvasState.current.x)}
                height={Math.abs(canvasState.origin.y - canvasState.current.y)}
              />
            )}
          <CursorsPresence />
          {pencilDraft != null && pencilDraft.length > 0 && (
            <Path
              points={pencilDraft}
              fill={colorToCSS(lastUsedColor)}
              x={0}
              y={0}
            />
          )}
        </g>
      </svg>
    </main>
  );
};

