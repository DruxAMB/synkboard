import Image from "next/image"
import { CreateOrganization } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog"

export const EmptyOrg = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <Image
        src="/elements.svg"
        alt="Empty"
        width={200}
        height={200} />
      <h2 className="text-2xl mt-6 font-semibold">Welcome to Miro</h2>
      <p className="text-sm mt-2 text-muted-foreground">Create an organization to get started</p>
      <div className="mt-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button size={"lg"}>
              Create
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0 bg-transparent border-none max-w-[480px]">
            <CreateOrganization />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}