import { WhopServerSdk } from "@whop/api";
import { NextResponse } from "next/server";

const whopApi = WhopServerSdk({
  appApiKey: process.env.WHOP_API_KEY!,
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID!,
});

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");

  if (!code) {
    // redirect to error page
    return NextResponse.redirect(new URL("/oauth/error?error=missing_code", requestUrl.origin));
  }

  if (!state) {
    // redirect to error page
    return NextResponse.redirect(new URL("/oauth/error?error=missing_state", requestUrl.origin));
  }

  const stateCookie = request.headers
    .get("Cookie")
    ?.split(";")
    .find((cookie) => cookie.trim().startsWith(`oauth-state.${state}=`));

  if (!stateCookie) {
    // redirect to error page
    return NextResponse.redirect(new URL("/oauth/error?error=invalid_state", requestUrl.origin));
  }

  // exchange the code for a token
  const authResponse = await whopApi.oauth.exchangeCode({
    code,
    redirectUri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/oauth/callback`,
  });

  if (!authResponse.ok) {
    return NextResponse.redirect(new URL("/oauth/error?error=code_exchange_failed", requestUrl.origin));
  }

  const { access_token } = authResponse.tokens;

  // Restore the `next` parameter from the state cookie set in the previous step.
  const next = decodeURIComponent(stateCookie.split("=")[1]);
  const nextUrl = new URL(next, `${process.env.NEXT_PUBLIC_SITE_URL}`);

  const response = NextResponse.redirect(nextUrl.toString());

  const cookieOptions = [
    `whop_access_token=${access_token}`,
    "Path=/",
    // "HttpOnly",
    "SameSite=None",
    "Max-Age=31536000"
  ];

  // Add secure settings for production
  if (process.env.NODE_ENV === "production") {
    cookieOptions.push("Secure");
    cookieOptions.push("Domain=.rwaka.rw");
  }

  response.headers.set("Set-Cookie", cookieOptions.join("; "));
  return response;
}
