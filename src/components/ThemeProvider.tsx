import { createContext, useContext, useEffect, useState } from "react"
import { BrowserGuideraClient } from "../lib/guidera-browser-client"

type Theme = "light" | "dark" | "system" | "light-high-contrast" | "dark-high-contrast" | "soft-dark"

type FontSize = "small" | "medium" | "large"

type DisplaySettings = {
  fontSize: FontSize
  compactMode: boolean
  reducedMotion: boolean
  highContrast: boolean
}

type UserProfile = {
  name: string
  username: string
  email: string
  company: string
  timezone: string
  avatarStyle: string
  avatarSeed: string
}

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  displaySettings: DisplaySettings
  userProfile: UserProfile
  setTheme: (theme: Theme) => void
  setDisplaySettings: (settings: Partial<DisplaySettings>) => void
  updateDisplaySetting: (key: keyof DisplaySettings, value: boolean | FontSize) => void
  updateUserProfile: (profile: Partial<UserProfile>) => void
}

const initialDisplaySettings: DisplaySettings = {
  fontSize: "medium",
  compactMode: false,
  reducedMotion: false,
  highContrast: false,
}

// Generate a random avatar seed and style for new users
const generateRandomAvatar = (): { style: string; seed: string } => {
  const styles = ["adventurer", "big-smile", "bottts", "fun-emoji", "icons", "identicon", "initials", "lorelei", "micah", "miniavs", "open-peeps", "personas", "pixel-art", "shapes"];
  const randomStyle = styles[Math.floor(Math.random() * styles.length)];
  const randomSeed = Math.random().toString(36).substring(2, 10);
  return { style: randomStyle, seed: randomSeed };
}

const randomAvatar = generateRandomAvatar();

const initialUserProfile: UserProfile = {
  name: "Loading...",
  username: "",
  email: "",
  company: "",
  timezone: "EST",
  avatarStyle: randomAvatar.style,
  avatarSeed: randomAvatar.seed,
}

const initialState: ThemeProviderState = {
  theme: "system",
  displaySettings: initialDisplaySettings,
  userProfile: initialUserProfile,
  setTheme: () => null,
  setDisplaySettings: () => null,
  updateDisplaySetting: () => null,
  updateUserProfile: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "chatbot-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(() => {
    const stored = localStorage.getItem(`${storageKey}-display`)
    return stored ? JSON.parse(stored) : initialDisplaySettings
  })

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const stored = localStorage.getItem(`${storageKey}-profile`)
    return stored ? JSON.parse(stored) : initialUserProfile
  })

  useEffect(() => {
    const root = window.document.documentElement

    // Remove all theme classes
    root.classList.remove("light", "dark", "light-high-contrast", "dark-high-contrast", "soft-dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  useEffect(() => {
    const root = window.document.documentElement

    // Apply font size
    root.classList.remove("font-small", "font-medium", "font-large")
    root.classList.add(`font-${displaySettings.fontSize}`)

    // Apply compact mode
    if (displaySettings.compactMode) {
      root.classList.add("compact-mode")
    } else {
      root.classList.remove("compact-mode")
    }

    // Apply reduced motion
    if (displaySettings.reducedMotion) {
      root.classList.add("reduce-motion")
    } else {
      root.classList.remove("reduce-motion")
    }

    // Save to localStorage
    localStorage.setItem(`${storageKey}-display`, JSON.stringify(displaySettings))
  }, [displaySettings, storageKey])

  useEffect(() => {
    // Save user profile to localStorage
    localStorage.setItem(`${storageKey}-profile`, JSON.stringify(userProfile))
  }, [userProfile, storageKey])

  useEffect(() => {
    const fetchUser = async () => {
      // Basic check if token exists to avoid unnecessary 401s on login screen
      if (!localStorage.getItem("guidera_jwt")) return;

      try {
        const client = new BrowserGuideraClient();
        const userData = await client.getSingleUser();
        updateUserProfile({
          name: userData.full_name,
          username: userData.username,
          email: userData.email,
          company: userData.company,
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUser();
  }, [])

  const updateDisplaySetting = (key: keyof DisplaySettings, value: boolean | FontSize) => {
    setDisplaySettings(prev => ({ ...prev, [key]: value }))
  }

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...profile }))
  }

  const value = {
    theme,
    displaySettings,
    userProfile,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    setDisplaySettings: (settings: Partial<DisplaySettings>) => {
      setDisplaySettings(prev => ({ ...prev, ...settings }))
    },
    updateDisplaySetting,
    updateUserProfile,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}