"use client";

import type { LucideIcon } from "lucide-react";

import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";

type ToolButtonProps = {
  label: React.ReactNode;
  icon: LucideIcon;
  onClick: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
};

export const ToolButton = ({
  label,
  icon: Icon,
  onClick,
  isActive,
  isDisabled,
}: ToolButtonProps) => {
  return (
    <Hint label={label} side="right" sideOffset={14}>
      <Button
        disabled={isDisabled}
        aria-disabled={isDisabled}
        onClick={onClick}
        size="icon"
        variant={isActive ? "boardActive" : "board"}
      >
        <Icon />
      </Button>
    </Hint>
  );
};

export const ToolButtonSkeleton = () => {
  return (
    <div
      className="flex flex-col gap-y-4 bg-[#f1f2f5] w-10 aspect-square rounded-full"
      style={{ background: 'radial-gradient(circle, #f1f2f5 50%, transparent 50%)' }}
      aria-hidden
    />
  );
}