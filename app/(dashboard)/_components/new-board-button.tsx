"use client";
import { useRouter } from "next/navigation";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface NewBoardButtonProps {
  disabled?: boolean;
  orgId: string;
};

const MAX_BOARDS_WITHIN_ORG = 5;

export const NewBoardButton = ({
  orgId,
  disabled,
}: NewBoardButtonProps) => {
  const router = useRouter();
  const { mutate, pending } = useApiMutation(api.board.create);
  const data = useQuery(api.board.getTotalBoardCountOfOrg, {
    orgId,
  });


  const onClick = () => {
    if (data && data >= MAX_BOARDS_WITHIN_ORG) {
      toast.error(`Only ${MAX_BOARDS_WITHIN_ORG} boards within an organization`);
      return;
    }

    mutate({
      orgId,
      title: "Untitled",
    })
      .then((id) => {
        toast.success("Board created");
        router.push(`/board/${id}`)
      })
      .catch(() => toast.error("Failed to create board"));
  }
  return (
    <button
      disabled={pending || disabled}
      onClick={onClick}
      className={cn(
        "col-span-1 aspect-[100/127] bg-blue-600 rounded-lg hover:bg-blue-800 flex flex-col items-center justify-center py-6",
        (pending || disabled) && "cursor-not-allowed opacity-75 hover:bg-blue-600"
      )}
    >
      <Plus className="h-12 text-white w-12 stroke-1" />
      <p className="text-sm pt-4 text-white font-light">New Board</p>
    </button>
  )
};