"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

import { ImageDown, Menu } from "lucide-react";
import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

import { Actions } from "@/components/actions";
import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRenameModal } from "@/store/use-rename-modal";
import { ToolButtonSkeleton } from "./tool-button";

const TabSeparator = () => <div className="text-neutral-300 px-1.5">|</div>;
const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

type InfoProps = {
  boardId: string;
  exportAsPng?: () => void;
};
export const Info = ({ boardId, exportAsPng }: InfoProps) => {
  const { onOpen } = useRenameModal();
  const data = useQuery(api.board.get, { id: boardId as Id<"boards">, });

  if (!data) return <InfoSkeleton />;

  return (
    <div className="absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md">
      <Hint label="Go to boards" side="bottom" sideOffset={10}>
        <Button variant="board" className="px-2" asChild>
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="Miro Clone Logo"
              height={36}
              width={36}
            />
            <span
              className={cn(
                "font-semibold text-xl ml-2 text-black",
                font.className,
              )}
            >
              Miro
            </span>
          </Link>
        </Button>
      </Hint>

      <TabSeparator />

      <Hint label="Edit title" side="bottom" sideOffset={10}>
        <Button
          onClick={() => onOpen(data._id, data.title)}
          variant="board"
          className="text-base font-normal px-2"
        >
          {data.title}
        </Button>
      </Hint>

      <TabSeparator />
      <Hint label="Export as PNG" side="bottom" sideOffset={10}>
        <Button size="icon" variant="board" onClick={exportAsPng}>
          <ImageDown />
        </Button>
      </Hint>
      {/* <TabSeparator /> */}

      <Actions id={data._id} title={data.title} side="bottom" sideOffset={10}>
        <div className="">
          <Hint label="Main menu" side="bottom" sideOffset={10}>
            <Button size="icon" variant="board">
              <Menu />
            </Button>
          </Hint>
        </div>
      </Actions>
    </div>
  );
};

export const InfoSkeleton = () => {
  return (
    <div
      className="w-[300px] absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md"
      aria-hidden
    >
      <Hint label="Go to boards" side="bottom" sideOffset={10}>
        <Button variant="board" className="px-2" asChild>
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="Miro Clone Logo"
              height={36}
              width={36}
              className="brightness-50 opacity-50"
            />
            <span
              className={cn(
                "font-semibold text-xl ml-2 text-neutral-300",
                font.className,
              )}
            >
              Miro
            </span>
          </Link>
        </Button>
      </Hint>
      <TabSeparator />

      <LineSkeleton width="[100px]" />

      <TabSeparator />
      <ToolButtonSkeleton />
      <ToolButtonSkeleton />
    </div>
  );
};

const LineSkeleton = ({ width }: { width: string }) => {
  return (
    <div
      className={`flex flex-col gap-y-4 bg-[#f1f2f5] w-[100px] h-[1.75rem] rounded-lg`}
      aria-hidden
    />
  );
}
