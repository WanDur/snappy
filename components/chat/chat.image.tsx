import { Pressable, StyleSheet, ViewStyle } from 'react-native'
import { useRouter } from 'expo-router'
import { Image } from 'expo-image'

export interface ImageComponentProps {
  uri: string
  containerStyle?: ViewStyle
  position?: 'left' | 'right'
}

const ImageComponent = ({ uri, containerStyle }: ImageComponentProps) => {
  const router = useRouter()

  return (
    <Pressable
      style={[containerStyle]}
      onPress={() => {
        // @ts-ignore
        router.push({ pathname: '/(modal)/[imageURL]', params: { url: uri } })
      }}
    >
      <Image source={{ uri: uri }} style={styles.image} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  image: {
    width: 250,
    height: 250,
    borderRadius: 12,
    margin: 4
  },
  text: {
    padding: 4,
    fontSize: 16,
    flexWrap: 'wrap',
    flex: 1
  }
})

export default ImageComponent
