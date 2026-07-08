export const SITE_CONFIG = {
  country: "Tanzania",
  countryCode: "TZ",
  domain: process.env.NEXT_PUBLIC_SITE_URL ?? "https://mkulima.co.tz",
  phonePrefix: "+255",
} as const;
