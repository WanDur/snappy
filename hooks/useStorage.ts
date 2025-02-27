import AsyncStorage from '@react-native-async-storage/async-storage'

import type { SettingsProps } from '../contexts/SettingsContext'

/**
 * A hook that provides utilities for retrieving and saving
 * both app-wide settings and other data to AsyncStorage.
 *
 * @param _key
 * when _key is provided, it will be used as the default key.
 *
 * if both _key and key in individual function are provided, the function param overrides the default.
 * @example
 * const { getSettings, deleteItemFromStorage } = useStorage('some-key')
 */
export const useStorage = (_key?: string) => {
  /**
   * This function warns of a potential naming override
   * when both a default and a function-specific key are provided.
   */
  const warnKeyOverride = (funcName: string, key?: string) => {
    if (_key && key) {
      console.info(
        `[INFO][useStorage][${funcName}] Both key and key in function are provided. Function param overrides the default.`
      )
    }
  }
  /**
   * Retrieves settings from local storage.
   * @returns Promise that resolves to the settings object or null if not found
   */
  const getSettings = async (): Promise<SettingsProps | null> => {
    try {
      const settings = await AsyncStorage.getItem('settings')
      return settings == null ? null : JSON.parse(settings)
    } catch (e) {
      console.error('Failed to load settings:', e)
      return null
    }
  }

  /**
   * Saves settings to local storage.
   * @param settings The settings object to be saved.
   */
  const saveSettings = async (settings: SettingsProps): Promise<void> => {
    try {
      await AsyncStorage.setItem('settings', JSON.stringify(settings))
    } catch (e) {
      console.error('Failed to save settings:', e)
    }
  }

  const getItemFromStorage = async <T>(key?: string): Promise<T | null> => {
    const finalKey = key ?? _key
    warnKeyOverride('getItemFromStorage', key)
    if (!finalKey) {
      console.warn('No key was provided for getItemFromStorage')
      return null
    }

    try {
      const value = await AsyncStorage.getItem(finalKey)
      if (!value) {
        return null
      }
      return JSON.parse(value) as T
    } catch (error) {
      console.error('Error getting data:', error)
      return null
    }
  }

  const saveItemToStorage = async (value: string | object, key?: string) => {
    const finalKey = key ?? _key
    warnKeyOverride('saveItemToStorage', key)
    if (!finalKey) {
      console.warn('No key was provided for saveItemToStorage')
      return
    }

    // if (finalKey.startsWith('chat-')) {
    //   console.log('Saving chat with saveItemToStorage()')
    //   const chatData: ChatProps = JSON.parse(value as string)
    //   if (chatData.messages.length == 0) {
    //     console.warn('No messages found in chat data')
    //   }
    // }

    try {
      if (typeof value !== 'string') {
        await AsyncStorage.setItem(finalKey, JSON.stringify(value))
      } else {
        await AsyncStorage.setItem(finalKey, value)
      }
    } catch (error) {
      console.error('Error saving data:', error)
    }
  }

  const deleteItemFromStorage = async (key?: string) => {
    const finalKey = key ?? _key
    warnKeyOverride('deleteItemFromStorage', key)
    if (!finalKey) {
      console.warn('No key was provided for deleteItemFromStorage')
      return
    }
    try {
      await AsyncStorage.removeItem(finalKey)
    } catch (error) {
      console.error('Error deleting data:', error)
    }
  }

  return {
    // settings
    getSettings,
    saveSettings,

    // Generic storage
    getItemFromStorage,
    saveItemToStorage,
    deleteItemFromStorage
  }
}
