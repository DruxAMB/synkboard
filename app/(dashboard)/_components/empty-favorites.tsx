import Image from "next/image";

export const EmptyFavorites = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <Image
        alt=""
        src={"/empty-favorites.svg"}
        height={140}
        width={140} /><h2 className="text-2xl font-semibold mt-6">No favorites!</h2>
      <p className="text-sm mt-2 text-muted-foreground"> Try favoriting a board</p>
    </div>
  )
}