// TODO: should this be in (tabs)/album
import { View, Text } from 'react-native'
import { useLocalSearchParams } from 'expo-router'

import { Themed } from '@/components'

const AlbumScreen = () => {
  const { albumId } = useLocalSearchParams<{ albumId: string }>()

  return (
    <View style={{ flex: 1 }}>
      <Themed.ScrollView>
        <Themed.Text>{albumId}</Themed.Text>
      </Themed.ScrollView>
    </View>
  )
}

export default AlbumScreen
