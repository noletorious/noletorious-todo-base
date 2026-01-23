import { useState, useEffect } from "react"
import { User } from "lucide-react"
import Modal from "./Modal"
import { useAuthStore } from "../../store/authStore"
import { supabase } from "../../lib/supabase"

interface UserSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UserSettingsModal({ isOpen, onClose }: UserSettingsModalProps) {
  const { user, setSession } = useAuthStore()
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setEmail(user.email || "")
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    setSaveMessage("")

    try {
      // Validate password if attempting to change it
      if (newPassword || confirmPassword) {
        if (newPassword !== confirmPassword) {
          setSaveMessage("Passwords do not match!")
          setIsSaving(false)
          return
        }
        if (newPassword.length < 6) {
          setSaveMessage("Password must be at least 6 characters!")
          setIsSaving(false)
          return
        }
      }

      // Update user metadata and/or password in Supabase Auth
      const updateData: {
        data: { name: string }
        password?: string
      } = {
        data: {
          name: name,
        },
      }

      if (newPassword) {
        updateData.password = newPassword
      }

      const { data: authData, error: authError } =
        await supabase.auth.updateUser(updateData)

      if (authError) throw authError

      // Update User table in Supabase/Prisma database
      const { error: dbError } = await supabase
        .from("User")
        .update({
          name: name,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (dbError) {
        console.error("Error updating User table:", dbError)
        // Don't throw here - auth metadata is primary source
      }

      // Update session in store to reflect changes immediately
      if (authData.user) {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session) {
          setSession(session)
        }
      }

      // Clear password fields
      setNewPassword("")
      setConfirmPassword("")
      setShowPasswordSection(false)

      setSaveMessage(
        newPassword
          ? "Settings and password updated successfully!"
          : "Settings saved successfully!"
      )
      setTimeout(() => setSaveMessage(""), 3000)
    } catch (error) {
      console.error("Error updating user settings:", error)
      setSaveMessage("Error saving settings. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const getPlanName = () => {
    if (user?.isPremium || user?.isPaid) {
      return "Premium"
    }
    return "Free"
  }

  const getPlanBadgeColor = () => {
    if (user?.isPremium || user?.isPaid) {
      return "bg-gradient-to-r from-primary to-secondary text-white"
    }
    return "bg-muted text-muted-foreground"
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Settings" size="md">
      <div className="space-y-6 p-4">
        {/* Current Plan */}
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Current Plan
              </h3>
              <p className="mt-1 text-2xl font-bold">{getPlanName()}</p>
            </div>
            <div
              className={`rounded-lg px-4 py-2 font-bold ${getPlanBadgeColor()}`}
            >
              {getPlanName().toUpperCase()}
            </div>
          </div>
          {!user?.isPaid && (
            <p className="mt-3 text-sm text-muted-foreground">
              Upgrade to Premium to unlock advanced features
            </p>
          )}
        </div>

        {/* User Information */}
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-border bg-muted px-3 py-2 text-muted-foreground"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Email changes require verification
            </p>
          </div>

          {/* Password Change Section */}
          <div className="border-t border-border pt-2">
            {!showPasswordSection ? (
              <button
                onClick={() => setShowPasswordSection(true)}
                className="text-sm text-primary hover:underline"
              >
                Change Password
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Change Password</h3>
                  <button
                    onClick={() => {
                      setShowPasswordSection(false)
                      setNewPassword("")
                      setConfirmPassword("")
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Account ID</label>
            <input
              type="text"
              value={user?.id || ""}
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-border bg-muted px-3 py-2 font-mono text-xs text-muted-foreground"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Member Since
            </label>
            <input
              type="text"
              value={
                user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "N/A"
              }
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-border bg-muted px-3 py-2 text-muted-foreground"
            />
          </div>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div
            className={`rounded-lg p-3 text-center text-sm ${
              saveMessage.includes("Error") ||
              saveMessage.includes("match") ||
              saveMessage.includes("characters")
                ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                : "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
            }`}
          >
            {saveMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 border-t border-border pt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 font-medium transition-colors hover:bg-muted"
          >
            Cancel
          </button>
        </div>

        {/* Support Link - Saved but commented */}
        {/* <div className="pt-4 border-t border-border">
          <a
            href="https://buymeacoffee.com/noletorious"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ☕️ Support the creators
          </a>
        </div> */}
      </div>
    </Modal>
  )
}

export function UserSettingsButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
        title="User Settings"
      >
        <User size={16} />
      </button>
      <UserSettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
