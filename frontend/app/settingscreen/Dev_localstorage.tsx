import { Alert } from 'react-native'
import { Stack } from 'expo-router'
import React, { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { SettingsGroup, Themed } from '../../components'

const LocalStorageVisualizer = ({ query = '' }) => {
  const [storageData, setStorageData] = useState([])

  const clearRecordByKey = async (key: string) => {
    try {
      await AsyncStorage.removeItem(key)
      // @ts-ignore
      setStorageData((prevData) => prevData.filter((item) => item.key !== key))
    } catch (error) {
      console.error('Error clearing record:', error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const keys = await AsyncStorage.getAllKeys()
      const data = await Promise.all(
        keys.map(async (key) => {
          const value = await AsyncStorage.getItem(key)
          if (value) {
            const parsedValue = JSON.parse(value)

            // Truncate long messages
            if (parsedValue?.state?.profile?.user?.avatar) {
              parsedValue.state.profile.user.avatar = `AVATAR_URL_LENGTH: ${parsedValue.state.profile.user.avatar.length}`
            }
            if (parsedValue?.state?.profile?.resume?.uri) {
              parsedValue.state.profile.resume.uri = parsedValue?.state?.profile?.resume?.uri.slice(0, 100) + '. . .'
            }

            if (Array.isArray(parsedValue?.messages)) {
              parsedValue.messages = parsedValue.messages.map((msg: any) => {
                if (msg?.content?.length > 100) {
                  return { ...msg, content: msg.content.slice(0, 100) + '. . .' }
                }
                return msg
              })
            }
            return { key, value: parsedValue }
          }
        })
      )
      setStorageData(data as [])
    }

    fetchData()
  }, [])

  const formatValue = (value: any) => {
    const strValue = typeof value === 'object' ? JSON.stringify(value) : value.toString()

    if (strValue.length > 25) {
      return strValue.slice(0, 25) + '...'
    }
    return strValue
  }

  // @ts-ignore
  const filteredData = storageData.filter(({ key }) => key.toLowerCase().includes(query.toLowerCase()))

  if (filteredData.length === 0) {
    return (
      <SettingsGroup
        title="Local storage - empty"
        footer="This section is generated according to the data stored in local storage"
      >
        <SettingsGroup.InfoDisplay
          title={query ? `No key with '${query}'` : 'No keys found'}
          type="string"
          stateValue=""
        />
      </SettingsGroup>
    )
  }

  return (
    <>
      {filteredData.map(({ key, value }) => (
        <SettingsGroup
          key={key}
          title={`Local storage - key:${key as string}`}
          footer="This section is generated according to the data stored in local storage"
        >
          {/* @ts-ignore */}
          {key.startsWith('zustand') && (
            <SettingsGroup.InfoDisplay
              title="Note"
              titleStyle={{ color: '#FF9800' }}
              type="string"
              stateValue={`This is a persisted state managed by Zustand.${'\n'}You can view it with key '${key}' in the dashboard.`}
            />
          )}
          {Object.entries(value).map(([subKey, subValue]) => (
            <SettingsGroup.Button
              key={subKey}
              title={subKey}
              hintText={formatValue(subValue)}
              onPress={() => {
                Alert.alert(subKey, JSON.stringify(subValue))
              }}
            />
          ))}
          <SettingsGroup.Button
            title="Delete this key"
            onPress={() => {
              clearRecordByKey(key)
            }}
            titleStyle={{ color: 'red' }}
            isLast
          />
        </SettingsGroup>
      ))}
    </>
  )
}

const DevLocalStorage = () => {
  const [query, setQuery] = useState('')

  return (
    <>
      <Stack.Screen
        options={{
          title: 'View all',
          headerSearchBarOptions: {
            placeholder: 'Search key',
            hideWhenScrolling: false,
            onChangeText: (e) => {
              setQuery(e.nativeEvent.text)
            },
            autoCapitalize: 'none'
          }
        }}
      />
      <Themed.ScrollView style={{ flex: 1, padding: 16 }}>
        <LocalStorageVisualizer query={query} />
      </Themed.ScrollView>
    </>
  )
}

export default DevLocalStorage
