import { UpgradeScreen } from "../components/ui/UpgradeScreen"

export default function Dashboard() {
  const handleUpgrade = () => {
    alert("Stripe integration coming soon!")
  }

  return <UpgradeScreen variant="upgrade" onUpgrade={handleUpgrade} />
}
