import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { FlashList } from '@shopify/flash-list'

import { Themed } from '../../components'

const ImagesModal = () => {
  const { _uri } = useLocalSearchParams()
  const uris: string[] = JSON.parse(_uri as string)
  const router = useRouter()

  const handlePress = (item: string) => {
    // @ts-ignore
    router.push({ pathname: '/(modal)/[imageURL]', params: { url: item } })
  }

  return (
    <Themed.ScrollView style={{ flex: 1, padding: 16 }}>
      <Stack.Screen options={{ headerTitle: `${uris.length} sent` }} />
      <FlashList
        data={uris}
        keyExtractor={(index) => index.toString()}
        numColumns={2}
        renderItem={({ item }) => (
          <Themed.TouchableOpacity onPress={() => handlePress(item)} style={{ backgroundColor: 'transparent' }}>
            <Image
              source={{ uri: item }}
              style={{ width: 150, height: 150, margin: 10, marginHorizontal: 14, borderRadius: 12 }}
            />
          </Themed.TouchableOpacity>
        )}
        estimatedItemSize={100}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      <StatusBar style="light" animated />
    </Themed.ScrollView>
  )
}

export default ImagesModal
