import React from "react";
import { UpgradeScreen } from "../components/ui/UpgradeScreen";

export default function Upgrade() {
  const handleUpgrade = () => {
    alert("Stripe integration coming soon!");
  };

  return <UpgradeScreen variant="upgrade" onUpgrade={handleUpgrade} />;
}
