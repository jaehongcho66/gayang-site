"use client";

import { useState } from "react";
import OnboardingFlow from "../components/OnboardingFlow";
import BuilderSplitView from "../components/BuilderSplitView";

export default function Home() {
  const [site, setSite] = useState(null);

  if (!site) {
    return (
      <div style={{ padding: "60px 20px" }}>
        <OnboardingFlow onComplete={(s) => setSite(s)} />
      </div>
    );
  }

  return <BuilderSplitView siteId={site.siteId} subdomain={site.subdomain} />;
}