export async function exchangeFacebookCodeForToken(code: string) {
  return { access_token: "" };
}

export async function getFacebookUserProfile(accessToken: string) {
  return { id: "", email: "", name: "" };
}

export async function getFacebookAuthUrl() {
  return "";
}
