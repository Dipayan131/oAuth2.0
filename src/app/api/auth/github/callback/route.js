import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // Retrieve the stored state from cookies
  const cookies = request.cookies;
  const storedState = cookies.get("oauth_state")?.value;

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect("/");
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    }
  );

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    return NextResponse.redirect("/");
  }

  // Use the access token to fetch user data
  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const userData = await userResponse.json();

  const emailsResponse = await fetch('https://api.github.com/user/emails', {
    headers: {
        Authorization: `Bearer ${accessToken}`,
    },
});

const emails = await emailsResponse.json();
const primaryEmail = emails.find(email => email.primary)?.email || '';

// Add primary email to userData
userData.email = primaryEmail;
console.log(userData);

  // Here you can create a session or store the user data in a cookie
  const redirectUrl =
    process.env.NEXT_PUBLIC_REDIRECT_URL || "http://localhost:3000";
  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set("userdata", JSON.stringify(userData), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  // Remove the oauth_state cookie
  response.cookies.delete("oauth_state");

  return response;
}
