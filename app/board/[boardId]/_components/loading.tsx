import { Loader } from "lucide-react";
import { InfoSkeleton } from "./info";
import { ParticipantsSkeleton } from "./participants";
import { ToolbarSkeleton } from "./toolbar";
import { ResetCameraSkeleton } from "./reset-camera";

export const Loading = () => {
  return (
    <main className="h-[100svh] w-full relative bg-neutral-100 touch-none flex justify-center items-center">
      <Loader className="h-7 w-7 text-muted-foreground animate-spin" />
      <InfoSkeleton />
      <ParticipantsSkeleton />
      <ToolbarSkeleton />
      <ResetCameraSkeleton />
    </main>
  );
}

