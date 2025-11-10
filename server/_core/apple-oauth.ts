export async function exchangeAppleCodeForToken(code: string) {
  return { access_token: "" };
}

export async function decodeAppleIdToken(idToken: string) {
  return { sub: "", email: "" };
}

export async function getAppleAuthUrl() {
  return "";
}
