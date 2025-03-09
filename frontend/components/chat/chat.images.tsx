import { View, Text, Pressable, StyleSheet } from 'react-native'
import { BlurView } from 'expo-blur'
import { useRouter } from 'expo-router'
import { Image } from 'expo-image'

import { type ImageComponentProps } from './chat.image'

const ImagesComponent = ({ uri, containerStyle }: ImageComponentProps) => {
  const router = useRouter()
  const uris: string[] = JSON.parse(uri)

  const handlePress = (index: number) => {
    // @ts-ignore
    router.push({ pathname: '/(modal)/[imageURL]', params: { url: uris[index] } })
  }

  const handleMultiImagePress = () => {
    router.push({ pathname: '/(modal)/ImagesModal', params: { _uri: uri } })
  }

  const imagesStyle = StyleSheet.create({
    block: {
      width: '49%',
      height: '49%',
      position: 'relative',
      padding: 1
    },
    blockImage: {
      width: '100%',
      height: '100%',
      borderRadius: 12
    },
    blurView: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
      overflow: 'hidden'
    },
    overlayText: {
      color: 'white',
      fontSize: 32,
      fontWeight: '800'
    }
  })

  if (uris.length < 4) {
    return (
      <View style={[containerStyle, { flexDirection: 'column', gap: 10 }]}>
        {uris.map((uri, index) => (
          <Pressable
            key={index}
            onPress={() => {
              handlePress(index)
            }}
          >
            <Image source={{ uri }} style={styles.image} />
          </Pressable>
        ))}
      </View>
    )
  } else if (uris.length === 4) {
    return (
      <View style={styles.multiImageContainer}>
        {uris.slice(0, 4).map((uri, index) => (
          <Pressable key={index} style={imagesStyle.block} onPress={() => handlePress(index)}>
            <Image source={{ uri }} style={imagesStyle.blockImage} />
          </Pressable>
        ))}
      </View>
    )
  } else {
    return (
      <Pressable onPress={handleMultiImagePress} style={[containerStyle]}>
        <View style={styles.multiImageContainer}>
          {uris.slice(0, 4).map((uri, index) => (
            <View key={index} style={imagesStyle.block}>
              <Image source={{ uri }} style={imagesStyle.blockImage} />
              {index === 3 && uris.length > 4 && (
                <BlurView intensity={20} style={imagesStyle.blurView}>
                  <Text style={imagesStyle.overlayText}>+{uris.length - 3}</Text>
                </BlurView>
              )}
            </View>
          ))}
        </View>
      </Pressable>
    )
  }
}

const styles = StyleSheet.create({
  image: {
    width: 250,
    height: 250,
    borderRadius: 12
  },
  text: {
    padding: 4,
    fontSize: 16,
    flexWrap: 'wrap',
    flex: 1
  },
  multiImageContainer: {
    width: 260,
    height: 260,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    top: 4,
    borderRadius: 12
  }
})

export default ImagesComponent
