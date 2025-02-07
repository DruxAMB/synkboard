import { auth, currentUser } from "@clerk/nextjs";
import { Liveblocks } from "@liveblocks/node";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse, type NextRequest } from "next/server";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const liveblocks = new Liveblocks({
  secret: process.env.NEXT_PUBLIC_LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(req: NextRequest) {
  const authorization = auth();
  const user = await currentUser();
  // console.log("AUTH_INFO", { authorization, user, })
  if (!authorization || !user)
    return new NextResponse("Unauthorized.", { status: 403 });

  const { room } = await req.json();
  const board = await convex.query(api.board.get, { id: room });
  // console.log("AUTH_INFO", { room, board, boardOrgId: board?.orgId, userOrgId: authorization.orgId })
  if (board?.orgId !== authorization.orgId)
    return new NextResponse("Unauthorized.", { status: 403 });

  const userInfo = {
    name: user.firstName || "Teammate",
    picture: user.imageUrl,
  };

  // console.log({ userInfo })
  const session = liveblocks.prepareSession(user.id, { userInfo, });
  if (room) {
    session.allow(room, session.FULL_ACCESS);
    const { status, body } = await session.authorize();
    // console.log({status, body}, "ALLOWED")
    return new Response(body, { status });
  }
}