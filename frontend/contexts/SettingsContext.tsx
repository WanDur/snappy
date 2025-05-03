/**
 * Settings context
 * All you need to do if you want to add a new setting is to add a new key to `SettingsProps`, then update DEFAULT_SETTINGS
 */
import { createContext, useState, useEffect, useContext, type ReactNode } from 'react'

import { useStorage } from '@/hooks'

/**
 * Interface for all settings
 *
 * Define additional settings if needed
 */
export interface SettingsProps {
  isTabBarVisible: boolean
  isFirstLaunch: boolean
  language: string
}

/**
 * Define default settings here
 * And that's it! You can now use `useSettings` to access and update settings.
 */
const DEFAULT_SETTINGS: SettingsProps = {
  isTabBarVisible: true,
  isFirstLaunch: true,
  language: ''
}

// NO need to change this
interface SettingsContextValue {
  /**
   * get setting value, use as `settings.<some setting>`
   */
  settings: SettingsProps

  /**
   * use as `setSetting(<some setting>, value)`
   * @param key which setting to set, should be one of the keys in SettingsProps
   * @param value new value for the setting
   */
  setSetting: <K extends keyof SettingsProps>(key: K, value: SettingsProps[K]) => void
}

// NO need to change this
interface SettingsProviderProps {
  children: ReactNode
}

/**
 * Create settings context and provider
 * NO need to change this
 */
const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  setSetting: () => {}
})

export const useSettings = () => useContext(SettingsContext)

// NO need to change this
export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const { getSettings, saveSettings } = useStorage()
  const [settings, setSettings] = useState<SettingsProps>(DEFAULT_SETTINGS)

  useEffect(() => {
    const loadSettings = async () => {
      const storedSettings = await getSettings()
      if (storedSettings) {
        setSettings(storedSettings)
      }
    }

    loadSettings()
  }, [])

  // update setting and save it to Storage
  const setSetting = <K extends keyof SettingsProps>(key: K, value: SettingsProps[K]) => {
    setSettings((prevSettings) => {
      const newSettings = { ...prevSettings, [key]: value }
      saveSettings(newSettings)
      return newSettings
    })
  }

  return <SettingsContext.Provider value={{ settings, setSetting }}>{children}</SettingsContext.Provider>
}
