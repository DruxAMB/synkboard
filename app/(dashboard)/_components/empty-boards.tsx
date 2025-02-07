"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useOrganization } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { title } from "process";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const EmptyBoards = () => {
  const router = useRouter();
  const { organization } = useOrganization();
  const { mutate, pending } = useApiMutation(api.board.create);
  const onClick = () => {
    if (!organization) return;
    mutate({
      orgId: organization.id,
      title: "Untitled",
    })
      .then((id) => {
        // TODO: Redirect to board/{id}
        toast.success("Board created");
        router.push(`/board/${id}`)
      })
      .catch((error) => {
        toast.error("Error creating board")
        console.error(error)
      })
  }
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <Image
        alt=""
        src={"/note.svg"}
        height={110}
        width={110} /><h2 className="text-2xl font-semibold mt-6">Create your first board</h2>
      <p className="text-sm mt-2 text-muted-foreground"> Start by creating a board for your organization</p>
      <div className="mt-6">
        <Button disabled={pending} size={"lg"} onClick={onClick}>Create board</Button>
      </div>
    </div>
  )
}