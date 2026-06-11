import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Código de autorização ausente." }, { status: 400 });
  }

  const clientId = process.env.MELHOR_ENVIO_CLIENT_ID;
  const clientSecret = process.env.MELHOR_ENVIO_CLIENT_SECRET;
  const redirectUri = process.env.MELHOR_ENVIO_REDIRECT_URI;
  const oauthBase = process.env.MELHOR_ENVIO_OAUTH_BASE ?? "https://sandbox.melhorenvio.com.br";
  const userAgent = process.env.MELHOR_ENVIO_USER_AGENT ?? "Facheiro Store (suporte@facheiro.com.br)";

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: "MELHOR_ENVIO_CLIENT_ID, MELHOR_ENVIO_CLIENT_SECRET ou MELHOR_ENVIO_REDIRECT_URI não configurados." }, { status: 500 });
  }

  const response = await fetch(`${oauthBase}/oauth/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": userAgent
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code
    })
  });

  const payload = await response.json();
  if (!response.ok) {
    return NextResponse.json({ error: payload.error_description ?? payload.error ?? "Falha ao trocar token." , details: payload }, { status: response.status });
  }

  return NextResponse.json(payload);
}
