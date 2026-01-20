import { Rocket, Zap } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

interface UpgradeScreenProps {
  variant?: "dashboard" | "upgrade";
  onUpgrade?: () => void;
}

export function UpgradeScreen({
  variant = "dashboard",
  onUpgrade,
}: UpgradeScreenProps) {
  const { user } = useAuthStore();
  const [teamPlanEmail, setTeamPlanEmail] = useState(user?.email || "");
  const [teamPlanSubmitted, setTeamPlanSubmitted] = useState(false);
  const [isSubmittingTeamPlan, setIsSubmittingTeamPlan] = useState(false);
  const isUpgradeVariant = variant === "upgrade";

  const handleTeamPlanSubmit = async () => {
    if (!teamPlanEmail.trim()) return;

    setIsSubmittingTeamPlan(true);

    try {
      const { error } = await supabase.from("TEAMS_EMAILS_INTEREST").insert({
        email: teamPlanEmail.trim(),
        submitted_at: new Date().toISOString(),
        user_id: user?.id || null,
      });

      if (error) {
        console.error("Error submitting team plan interest:", error);
        throw error;
      }

      setTeamPlanSubmitted(true);
      console.log("Team plan interest submitted successfully:", teamPlanEmail);
    } catch (error) {
      console.error("Failed to submit team plan interest:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmittingTeamPlan(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
      <div
        className={`p-6 ${
          isUpgradeVariant
            ? "bg-secondary/20 border border-secondary/30"
            : "bg-primary/20 border border-primary/30"
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
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Create and run sprints
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Dashboard features: advanced analytics & reports
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Archive done tasks for better organization
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

      {/* Team Plan Interest Section */}
      {isUpgradeVariant && (
        <div className="mt-12 pt-8 border-t border-border max-w-md w-full">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-muted-foreground">
              Interested in a Team Plan?
            </h3>
            <p className="text-sm text-muted-foreground">
              Get notified when team features become available
            </p>

            {teamPlanSubmitted ? (
              <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-700 dark:text-green-300 font-medium">
                  ✓ Thanks! We'll notify you about team plan availability.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="email"
                  value={teamPlanEmail}
                  onChange={(e) => setTeamPlanEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  onClick={handleTeamPlanSubmit}
                  disabled={!teamPlanEmail || isSubmittingTeamPlan}
                  className="w-full px-4 py-2 bg-muted hover:bg-muted/80 disabled:opacity-50 text-foreground border border-border rounded-lg transition-colors"
                >
                  {isSubmittingTeamPlan ? "Adding..." : "Add me to the list"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
