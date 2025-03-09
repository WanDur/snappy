import { View, Text } from 'react-native'
import { useState } from 'react'
import { Stack } from 'expo-router'

import { Themed } from '@/components'

const FriendScreen = () => {
  const [query, setQuery] = useState('')

  const onSearch = () => {}

  return (
    <Themed.ScrollView style={{ padding: 16 }}>
      <Stack.Screen
        options={{
          headerSearchBarOptions: {
            placeholder: 'Search',
            autoFocus: true,
            hideWhenScrolling: false,
            onChangeText: (e) => {
              setQuery(e.nativeEvent.text)
            },
            onSearchButtonPress: () => {
              onSearch()
            }
          }
        }}
      />
      <Text>FriendScreen</Text>
    </Themed.ScrollView>
  )
}

export default FriendScreen
