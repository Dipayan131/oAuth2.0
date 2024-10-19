import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    // Retrieve the stored state from cookies
    const cookies = request.cookies;
    const storedState = cookies.get('oauth_state')?.value;
    
    if (!code || !state || state !== storedState) {
        return NextResponse.redirect('/');
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
        return NextResponse.redirect('/');
    }

    // Use the access token to fetch user data
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const userData = await userResponse.json();
    console.log(userData);

    // Here you can create a session or store the user data in a cookie
    const redirectUrl = process.env.REDIRECT_URL;
const response = NextResponse.redirect(redirectUrl);
response.cookies.set('userdata', JSON.stringify(userData), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
});


    // Remove the oauth_state cookie
    response.cookies.delete('oauth_state');

    return response;
}
