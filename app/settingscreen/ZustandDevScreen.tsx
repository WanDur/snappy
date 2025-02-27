import React, { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { useLocalSearchParams } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import JSONTree from 'react-native-json-tree'

import { Themed } from '@/components'

const ZustandDevScreen = () => {
  const { _key } = useLocalSearchParams()
  const [data, setData] = useState<{ key: string; value: any }[]>([])
  const storageKey = _key?.toString() || ''

  useEffect(() => {
    const fetchStorage = async () => {
      try {
        const storedItem = await AsyncStorage.getItem(storageKey)
        if (!storedItem) return

        const parsedData = JSON.parse(storedItem)

        // Turn the object into an array of { key, value }
        const arrayData = Object.entries(parsedData).map(([k, v]) => ({
          key: k,
          value: v
        }))
        setData(arrayData)
      } catch (error) {
        console.warn('Error reading async storage:', error)
      }
    }

    fetchStorage()
  }, [storageKey])

  return (
    <Themed.ScrollView style={{ flex: 1 }}>
      <Stack.Screen options={{ headerTitle: storageKey }} />
      <JSONTree
        data={data[0]}
        hideRoot
        shouldExpandNode={(_keyName, _data, level) => {
          return level === 1
          console.log(_keyName, _data, level)
        }}
      />
      <Themed.Text style={{ margin: 10 }}>
        Zustand saves 2 keys by default (state & version), where all data are in state. So the above json view will only
        render the state key.
        {'\n'}If you want to see all, use the following code in ZustandDevScreen: {`<JSONTree data={data} />`}
      </Themed.Text>
    </Themed.ScrollView>
  )
}

export default ZustandDevScreen
