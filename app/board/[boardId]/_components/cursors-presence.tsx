"use client";

import { colorToCSS } from "@/lib/utils";
import { shallow } from "@liveblocks/client";
import { useOthersConnectionIds, useOthersMapped } from "@/liveblocks.config";
import { Path } from "./path";
import { Cursor } from "./cursor";

const Cursors = () => {
  const ids = useOthersConnectionIds();
  return (
    <>
      {ids.map((connectionId) => (
        <Cursor
          key={connectionId}
          connectionId={connectionId}
        />
      ))}
    </>
  )
};

const Drafts = () => {
  const others = useOthersMapped(
    (other) => ({
      pencilDraft: other.presence.pencilDraft,
      penColor: other.presence.penColor,
    }),
    shallow,
  );

  return (
    <>
      {others.map(([key, other]) => {
        if (other.pencilDraft) {
          return (
            <Path
              key={key}
              x={0}
              y={0}
              points={other.pencilDraft}
              fill={other.penColor ? colorToCSS(other.penColor) : "#000"}
            />
          );
        }

        return null;
      })}
    </>
  );
};

export const CursorsPresence = () => {
  return (
    <>
      <Cursors />
    </>
  );
}

CursorsPresence.displayName = "CursorsPresence"