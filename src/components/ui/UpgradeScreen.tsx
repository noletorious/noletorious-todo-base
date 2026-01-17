import React from "react";
import { Rocket, Zap } from "lucide-react";

interface UpgradeScreenProps {
  variant?: "dashboard" | "upgrade";
  onUpgrade?: () => void;
}

export function UpgradeScreen({
  variant = "dashboard",
  onUpgrade,
}: UpgradeScreenProps) {
  const isUpgradeVariant = variant === "upgrade";

  return (
    <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
      <div
        className={`p-6 ${
          isUpgradeVariant ? "bg-secondary/10" : "bg-primary/10"
        } rounded-full ${
          isUpgradeVariant ? "text-secondary" : "text-primary"
        } mb-4`}
      >
        {isUpgradeVariant ? <Rocket size={48} /> : <Zap size={48} />}
      </div>

      <div className="space-y-4 max-w-md">
        <h1 className="text-4xl font-heading font-bold">
          {isUpgradeVariant ? "Let's go pro" : "Unlock Dashboard"}
        </h1>

        <div className="space-y-3 text-muted-foreground">
          {isUpgradeVariant ? (
            <div className="space-y-2 text-left">
              <p className="text-lg mb-4">
                Take your productivity to the next level with these powerful
                features:
              </p>
              <div className="space-y-1">
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Make up to 50 projects
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-secondary rounded-full"></span>
                  Create and run sprints
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full"></span>
                  Have Dashboard features
                </p>
              </div>
            </div>
          ) : (
            <p className="text-lg">
              Get premium access to advanced dashboard features, analytics, and
              more.
            </p>
          )}
        </div>
      </div>

      <button
        onClick={onUpgrade}
        className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all transform"
      >
        Upgrade to Pro - $5/month
      </button>

      <p className="text-sm text-muted-foreground">
        Join thousands of professionals organizing their work with AGILE
        methodology
      </p>
    </div>
  );
}
