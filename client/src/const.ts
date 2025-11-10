export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "App";

export const APP_LOGO =
  import.meta.env.VITE_APP_LOGO ||
  "/logo-icon.png";

// Generate login URL - uses OTP authentication instead of OAuth
export const getLoginUrl = () => {
  return "/login";
};