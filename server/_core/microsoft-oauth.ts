export async function exchangeMicrosoftCodeForToken(code: string) {
  return { access_token: "" };
}

export async function getMicrosoftUserProfile(accessToken: string) {
  return { id: "", userPrincipalName: "", displayName: "" };
}

export async function getMicrosoftAuthUrl() {
  return "";
}
