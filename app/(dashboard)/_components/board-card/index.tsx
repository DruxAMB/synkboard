"use client"
import Image from "next/image";
import Link from "next/link"
import { MoreHorizontal } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { formatDistanceToNow } from "date-fns";

import { Overlay } from "./overlay";
import { Footer } from "./footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Actions } from "@/components/actions";
import { toast } from "sonner";

interface BoardCardProps {
  id: string;
  title: string;
  imageUrl: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  orgId: string;
  isFavorite: boolean;
}

export const BoardCard = ({
  id,
  title,
  authorId,
  authorName,
  createdAt,
  imageUrl,
  orgId,
  isFavorite
}: BoardCardProps) => {
  const { userId } = useAuth() ?? {};
  const createdAtLabel = createdAt ? formatDistanceToNow(createdAt, { addSuffix: true }) : "";
  const authorLabel = authorId ? (userId === authorId ? "You" : authorName) : "";

  const {
    mutate: onFavorite,
    pending: pendingFavorite
  } = useApiMutation(api.board.favorite)
  const {
    mutate: onUnfavorite,
    pending: pendingUnfavorite
  } = useApiMutation(api.board.unfavorite);

  const toggleFavorite = () => {
    if (isFavorite && id) onUnfavorite({ id }).catch(() => toast.error("Failed to unfavourite."));
    else if (id && orgId) onFavorite({ id, orgId }).catch(() => toast.error("Failed to favourite."),);
  }

  return (
    <Link href={`/board/${id}`}>
      <div className="group aspect-[100/127] border rounded-lg flex flex-col justify-center overflow-hidden">
        <div className="relative flex-1 bg-amber-50">
          {imageUrl && <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-fill" />}
          <Overlay />
          <Actions
            id={id}
            title={title}
            side="right"
          >
            <button className="absolute opacity-0 group-hover:opacity-100 px-3 py-2 outline-none top-1 right-1">
              <MoreHorizontal className="text-white opacity-75 hover:opacity-100 transition-opacity" />
            </button>
          </Actions>
        </div>
        <Footer
          isFavourite={isFavorite}
          title={title}
          authorLabel={authorLabel}
          createdAtLabel={createdAtLabel}
          onClick={toggleFavorite}
          disabled={pendingFavorite || pendingUnfavorite}
        />
      </div>
    </Link>
  );
};

BoardCard.Skeleton = function BoardCardSkeleton() {
  return (
    <div className="aspect-[100/127] rounded-lg justify-center overflow-hidden">
      <Skeleton className="h-full w-full" />
    </div>
  )
}