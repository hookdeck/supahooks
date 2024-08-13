import { type NextRequest } from "next/server";

export function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  return Response.redirect(url);
}
