"use client";

import { useEffect } from "react";
import { trackClient } from "@/components/track-client";

export function TrackPageView() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    trackClient("page_view", {
      path: window.location.pathname,
    }, {
      referral: params.get("ref"),
      utmSource: params.get("utm_source"),
      utmMedium: params.get("utm_medium"),
      utmCampaign: params.get("utm_campaign"),
    });
  }, []);

  return null;
}
