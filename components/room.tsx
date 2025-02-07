"use client"

import { ReactNode } from "react"
import { ClientSideSuspense } from "@liveblocks/react"

import { RoomProvider } from "@/liveblocks.config"
import { LiveMap, LiveObject, LiveList } from "@liveblocks/client"
import { Layer } from "@/types/canvas"

interface RoomProps {
  roomId: string
  children: ReactNode
  fallback?: NonNullable<ReactNode> | null;
}

export const Room = ({ children, roomId, fallback }: RoomProps) => {
  return (
    <RoomProvider
      id={roomId}
      initialPresence={{
        cursor: null,
        selection: [],
        penColor: null,
        pencilDraft: null,
      }}
      initialStorage={{
        layers: new LiveMap<string, LiveObject<Layer>>(),
        layerIds: new LiveList([]),
      }}>
      <ClientSideSuspense fallback={fallback}>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  )
}