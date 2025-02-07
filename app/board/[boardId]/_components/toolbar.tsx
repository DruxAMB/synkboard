"use client";

import { useEffect, useState } from "react";
import { useSelf } from "@/liveblocks.config";
import {
  Circle,
  LucideScanEye,
  MousePointer2,
  Pencil,
  Redo2,
  Square,
  StickyNote,
  Type,
  Undo2,
} from "lucide-react";
import { CanvasMode, LayerType, type CanvasState } from "@/types/canvas";
import { ToolButton, ToolButtonSkeleton } from "./tool-button";

type ToolbarProps = {
  canvasState: CanvasState;
  setCanvasState: (newState: CanvasState) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

export const Toolbar = ({
  canvasState,
  setCanvasState,
  undo,
  redo,
  canRedo,
  canUndo,
}: ToolbarProps) => {
  const selection = useSelf((me) => me.presence.selection);
  const [isAltSPressed, setIsAltSPressed] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (selection?.length > 0) return;

      switch (e.key) {
        // Handle Alt + S
        case "s":
          if (e.altKey) {
            e.preventDefault();
            setIsAltSPressed(true);
            console.log("Alt + S pressed.");
          }
          break;

        case "1":
          if (isAltSPressed) {
            e.preventDefault();
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Rectangle,
            });
            console.log("Alt + S + 1 pressed: Rectangle tool activated.");
            setIsAltSPressed(false);
          }
          break;

        case "2":
          if (isAltSPressed) {
            e.preventDefault();
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Ellipse,
            });
            console.log("Alt + S + 2 pressed: Ellipse tool activated.");
            setIsAltSPressed(false);
          }
          break;

        case "3":
          if (isAltSPressed) {
            e.preventDefault();
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Text,
            });
            console.log("Alt + S + 3 pressed: Text tool activated.");
            setIsAltSPressed(false);
          }
          break;

        case "4":
          if (isAltSPressed) {
            e.preventDefault();
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Note,
            });
            console.log("Alt + S + 4 pressed: Sticky Note tool activated.");
            setIsAltSPressed(false);
          }
          break;

        case "v":
          if (e.altKey) {
            e.preventDefault();
            setCanvasState({ mode: CanvasMode.None });
            console.log("Alt + V pressed: Select tool activated.");
          }
          break;

        case "p":
          e.preventDefault();
          setCanvasState({ mode: CanvasMode.Pencil });
          console.log("P pressed: Pencil tool activated.");
          break;

        case "l":
          e.preventDefault();
          setCanvasState({ origin: { x: 0, y: 0 }, mode: CanvasMode.LaserPointer });
          console.log("L pressed: Laser Pointer tool activated.");
          break;

        case "z":
          if (e.ctrlKey) {
            e.preventDefault();
            undo();
            console.log("Ctrl + Z pressed: Undo action.");
          }
          break;

        case "Z":
          if (e.ctrlKey && e.altKey) {
            e.preventDefault();
            redo();
            console.log("Ctrl + Alt + Z pressed: Redo action.");
          }
          break;

        default:
          setIsAltSPressed(false);
          break;
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [selection, setCanvasState, undo, redo, isAltSPressed]);
  return (
    <div className="absolute top-[50%] -translate-y-[50%] left-2 flex flex-col gap-y-4">
      <div className="bg-white rounded-md p-1.5 flex gap-y-2 flex-col items-center shadow-md">
        <ToolButton
          label={<div className="flex items-center">Select<kbd className="text-center font-mono px-2 py-1 rounded ml-2 font-semibold inline-block bg-neutral-600/60 !text-xs opacity-80">ALT + V</kbd></div>}
          icon={MousePointer2}
          onClick={() => setCanvasState({ mode: CanvasMode.None })}
          isActive={
            canvasState.mode === CanvasMode.None ||
            canvasState.mode === CanvasMode.Translating ||
            canvasState.mode === CanvasMode.SelectionNet ||
            canvasState.mode === CanvasMode.Pressing ||
            canvasState.mode === CanvasMode.Resizing
          }
        />

        <ToolButton
          label={<div className="flex items-center">Text<kbd className="text-center font-mono px-2 py-1 rounded ml-2 font-semibold inline-block bg-neutral-600/60 !text-xs opacity-80">ALT + S 3</kbd></div>}
          icon={Type}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Text,
            })
          }
          isActive={
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Text
          }
        />

        <ToolButton
          label={<div className="flex items-center">Sticky Note<kbd className="text-center font-mono px-2 py-1 rounded ml-2 font-semibold inline-block bg-neutral-600/60 !text-xs opacity-80">ALT + S 4</kbd></div>}
          icon={StickyNote}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Note,
            })
          }
          isActive={
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Note
          }
        />

        <ToolButton
          label={<div className="flex items-center">Rectangle<kbd className="text-center font-mono px-2 py-1 rounded ml-2 font-semibold inline-block bg-neutral-600/60 !text-xs opacity-80">ALT + S 1</kbd></div>}
          icon={Square}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Rectangle,
            })
          }
          isActive={
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Rectangle
          }
        />

        <ToolButton
          label={<div className="flex items-center">Ellipse<kbd className="text-center font-mono px-2 py-1 rounded ml-2 font-semibold inline-block bg-neutral-600/60 !text-xs opacity-80">ALT + S 2</kbd></div>}
          icon={Circle}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Ellipse,
            })
          }
          isActive={
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Ellipse
          }
        />
        <ToolButton
          label={<div className="flex items-center">Laser Pointer<kbd className="text-center font-mono px-2 py-1 rounded ml-2 font-semibold inline-block bg-neutral-600/60 !text-xs opacity-80">L</kbd></div>}
          icon={LucideScanEye}
          onClick={() => setCanvasState({ origin: { x: 0, y: 0 }, mode: CanvasMode.LaserPointer })}
          isActive={canvasState.mode === CanvasMode.LaserPointer}
        />

        <ToolButton
          label={<div className="flex items-center">Pen<kbd className="text-center font-mono px-2 py-1 rounded ml-2 font-semibold inline-block bg-neutral-600/60 !text-xs opacity-80">P</kbd></div>}
          icon={Pencil}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Pencil,
            })
          }
          isActive={canvasState.mode === CanvasMode.Pencil}
        />
      </div>

      <div className="bg-white rounded-md p-1.5 flex flex-col items-center shadow-md">
        <ToolButton
          label={<div className="flex items-center">Undo<kbd className="text-center font-mono px-2 py-1 rounded ml-2 font-semibold inline-block bg-neutral-600/60 !text-xs opacity-80">CTRL + Z</kbd></div>}
          icon={Undo2}
          onClick={undo}
          isDisabled={!canUndo}
        />
        <ToolButton
          label={<div className="flex items-center">Redo<kbd className="text-center font-mono px-2 py-1 rounded ml-2 font-semibold inline-block bg-neutral-600/60 !text-xs opacity-80">CTRL + ALT + Z</kbd></div>}
          icon={Redo2}
          onClick={redo}
          isDisabled={!canRedo}
        />
      </div>
    </div>
  );
};

export const ToolbarSkeleton = () => {
  return (
    <div className="absolute top-[50%] -translate-y-[50%] left-2 flex flex-col gap-y-4">
      <div
        className="bg-white rounded-md p-1.5 flex gap-y-2 flex-col items-center justify-center shadow-md"
        aria-hidden
      >
        <ToolButtonSkeleton />
        <ToolButtonSkeleton />
        <ToolButtonSkeleton />
        <ToolButtonSkeleton />
        <ToolButtonSkeleton />
        <ToolButtonSkeleton />
        <ToolButtonSkeleton />
      </div>
      <div className="bg-white rounded-md p-1.5 flex gap-y-2 flex-col items-center justify-center shadow-md">
        <ToolButtonSkeleton />
        <ToolButtonSkeleton />
      </div>
    </div>
  );
};
