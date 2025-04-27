/**
 * This is the development panel for showing some info that is not visible to the user
 */
import React, { useEffect, useState } from 'react'
import { Platform, Alert } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import * as Device from 'expo-device'
import i18next from 'i18next'
import Storage from 'expo-sqlite/kv-store'

import { SettingsGroup, Themed } from '@/components'
import { useSettings } from '@/contexts'
import { Constants } from '@/constants'
import { useChatStore } from '@/hooks'

const DevScreen = () => {
  const router = useRouter()
  const { settings, setSetting } = useSettings()
  const [zustandKey, setZustandKey] = useState<string[]>([])
  const cs = useChatStore()

  const deleteAllRecords = async () => {
    try {
      const keys = await Storage.getAllKeys()
      await Storage.multiRemove(keys)
    } catch (error) {
      console.error('Error clearing record:', error)
    }

    router.back()
  }

  const toggleAppFirstLaunch = () => {
    setSetting('isFirstLaunch', !settings.isFirstLaunch)
    router.dismissAll()
    Alert.alert('Press r', '`settings.isFirstLaunch` is set to true.\nReload the app to see the landing screen')
  }

  useEffect(() => {
    const fetchStorage = async () => {
      const keys = await Storage.getAllKeys()
      setZustandKey(keys.filter((key) => key.startsWith('zustand')))
    }
    fetchStorage()
  }, [])

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Dev dashboard' }} />
      <Themed.ScrollView style={{ flex: 1, padding: 16 }}>
        <SettingsGroup title="">
          <SettingsGroup.Button title="Return" titleStyle={{ color: 'blue' }} onPress={() => router.back()} isLast />
        </SettingsGroup>
        <SettingsGroup title="Language">
          <SettingsGroup.InfoDisplay title="App using language" type="string" stateValue={i18next.language} />
          <SettingsGroup.InfoDisplay title="Device language" type="string" stateValue={Constants.deviceLng} isLast />
        </SettingsGroup>

        <SettingsGroup title="Local storage">
          <SettingsGroup.Button
            title="View all"
            showArrow
            onPress={() => {
              router.push('/settingscreen/Dev_localstorage')
            }}
          />
          {zustandKey.length > 0 &&
            zustandKey.map((key, index) => (
              <SettingsGroup.Button
                key={index}
                title={key}
                onPress={() => router.push({ pathname: '/settingscreen/ZustandDevScreen', params: { _key: key } })}
                showArrow
              />
            ))}

          <SettingsGroup.Button
            title="Delete chat last fetch time"
            onPress={() => {
              cs.clearLastFetchTime()
              Alert.alert('Chat last fetch time is deleted')
            }}
            titleStyle={{ color: 'red' }}
          />

          <SettingsGroup.Button
            title="Delete all chat data"
            onPress={() => {
              cs.allChatID.forEach((id) => cs.deleteChat(id))
              Alert.alert('Deleted all chat data')
            }}
            titleStyle={{ color: 'red' }}
          />

          <SettingsGroup.Button
            title="Delete all local storages"
            onPress={deleteAllRecords}
            titleStyle={{ color: 'red' }}
            isLast
          />
        </SettingsGroup>

        <SettingsGroup title="Misc">
          <SettingsGroup.Button title="See landing screen" onPress={toggleAppFirstLaunch} />
          <SettingsGroup.InfoDisplay
            title="Device"
            type="string"
            stateValue={`${Device.modelName} • ${Platform.OS}${Device.osVersion}`}
          />
          <SettingsGroup.InfoDisplay
            title="OS buildID"
            type="string"
            stateValue={Device.osBuildId ? Device.osBuildId : 'on web'}
            isLast
          />
        </SettingsGroup>
      </Themed.ScrollView>
    </>
  )
}

export default DevScreen
