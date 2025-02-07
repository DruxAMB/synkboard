"use client";

import { useSelectionBounds } from "@/hooks/use-selection-bounds";
import { useMutation, useSelf } from "@/liveblocks.config";
import { Camera, Color } from "@/types/canvas";
import { memo } from "react";
import { ColorPicker } from "./color-picker";
import { useDeleteLayers } from "@/hooks/use-delete-layers";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import { BringToFront, SendToBack, Trash2, Copy } from "lucide-react";
import { Noto_Sans_Indic_Siyaq_Numbers } from "next/font/google";

interface SelectionToolsProps {
  camera: Camera;
  setLastUsedColor: (color: Color) => void
  onDuplicate: () => void;
  lastUsedColor: Color;
}

export const SelectionTools = memo(
  ({ camera, setLastUsedColor, onDuplicate, lastUsedColor }: SelectionToolsProps) => {
    const selection = useSelf((me) => me.presence.selection);
    const selectionBounds = useSelectionBounds();
    const deleteLayers = useDeleteLayers();

    const moveToFront = useMutation(
      ({ storage }) => {
        const liveLayerIds = storage.get("layerIds");
        const indices: number[] = [];
        const arr = liveLayerIds.toImmutable();
        for (let i = 0; i < arr.length; i++)
          if (selection.includes(arr[i])) { indices.push(i); }

        for (let i = indices.length - 1; i >= 0; i--) {
          liveLayerIds.move(
            indices[i],
            arr.length - 1 - (indices.length - 1 - i),
          );
        }
      },
      [selection],
    );

    const moveToBack = useMutation(({ storage }) => {
      const liveLayersIds = storage.get("layerIds");
      const indices: number[] = [];
      const arr = liveLayersIds.toImmutable();
      for (let i = 0; i < arr.length; i++) {
        if (selection.includes(arr[i])) {
          indices.push(i);
        }
      }

      for (let i = 0; i < indices.length; i++) {
        liveLayersIds.move(indices[i], i);
      }
    }, [selection])

    const setFill = useMutation(
      ({ storage }, fill: Color) => {
        const liveLayers = storage.get("layers");
        setLastUsedColor(fill);

        selection.forEach((id) => {
          liveLayers.get(id)?.set("fill", fill);
        });
      },
      [selection, setLastUsedColor],
    );

    if (!selectionBounds) return null;

    const x = selectionBounds.width / 2 + selectionBounds.x + camera.x;
    const y = selectionBounds.y + camera.y;

    return (
      <div
        className="absolute p-3 rounded-xl bg-white shadow-sm border flex select-none"
        style={{
          transform: `translate(
          calc(${x}px - 50%),
          calc(${y - 16}px - 100%)
        )`
        }}>
        <ColorPicker onChange={setFill} lastUsedColor={lastUsedColor} />
        <div className="flex flex-col gap-y-0.5">
          <Hint label="Bring to front">
            <Button variant="board" size="icon" onClick={moveToFront}><BringToFront /></Button>
          </Hint>
          <Hint label="Send to back">
            <Button variant="board" size="icon" onClick={moveToBack}><SendToBack /></Button>
          </Hint>
        </div>
        <div className="flex flex-col items-center pl-2 ml-2 border-l border-neutral-200">
          <Hint label={<div className="flex items-center">Duplicate<kbd className="text-center font-mono px-2 py-1 rounded ml-2 font-semibold inline-block bg-neutral-600/60 !text-xs opacity-80">CTRL + D</kbd></div>}>
            <Button
              onClick={onDuplicate}
              variant="board"
              size="icon"
            >
              <Copy />
            </Button>
          </Hint>
          <Hint label="Delete" side="bottom">
            <Button
              variant="boardDestructive"
              size="icon"
              onClick={deleteLayers}
            >
              <Trash2 />
            </Button>
          </Hint>
        </div>
      </div>
    )
  })

SelectionTools.displayName = "SelectionTools"