import { connection } from "next/server";
import { deleteEntry, tokensMatch } from "../guestbook-server";

export async function DELETE(request: Request, ctx: RouteContext<"/api/guestbook/[id]">) {
  await connection();
  const admin = process.env.GUESTBOOK_ADMIN_TOKEN;
  if (!admin) return new Response(null, { status: 404 });

  const auth = request.headers.get("authorization") ?? "";
  const given = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!given || !tokensMatch(given, admin)) return new Response(null, { status: 401 });

  const { id } = await ctx.params;
  const removed = await deleteEntry(id);
  return new Response(null, { status: removed ? 204 : 404 });
}
