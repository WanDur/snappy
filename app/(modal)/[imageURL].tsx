/**
 * This screen displays an image by its URL.
 * It receives the image url via the "url" query parameter  while navigating to this screen.
 * For example router.push({ pathname: '/(modal)/[imageURL]', params: { url: imageURL } })
 *
 * It also receives the optional "from" query which is to indicate where the navigation is from.
 * It determines the render of the action buttons at the bottom of the screen.
 * The default will be screenActionButtons.default with 4 buttons.
 *
 * If you are navigating from a different screen and need different actions, you can add a new key to screenActionButtons.
 * Make sure to navigate to this screen by passing the exact key to the "from" query.
 * For example, I opened this screen from the blog screen, so I passed the "from" query as "blog".
 * params: { url: uri, from: 'blog' }
 * And it will render screenActionButtons.blog, which has only one button.
 */
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ImageZoom } from '@likashefqet/react-native-image-zoom'
import { useLocalSearchParams, Stack, useRouter } from 'expo-router'
import { Ionicons, Octicons, MaterialIcons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { StatusBar } from 'expo-status-bar'

interface ScreenActionButtonProps {
  icon: string
  iconPack: any
  text: string
  onPress: (() => void) | string
}

const screenActionButtons: Record<string, ScreenActionButtonProps[]> = {
  default: [
    { icon: 'text', iconPack: Ionicons, text: 'Text', onPress: () => {} },
    { icon: 'chatbubble-outline', iconPack: Ionicons, text: 'Prompt', onPress: () => {} },
    { icon: 'download', iconPack: Octicons, text: 'Save', onPress: () => {} },
    { icon: 'exit-to-app', iconPack: MaterialIcons, text: 'Back', onPress: 'goBack' }
  ],
  blog: [{ icon: 'exit-to-app', iconPack: MaterialIcons, text: 'Back', onPress: 'goBack' }]
}

const ImageScreen = () => {
  const { url, from } = useLocalSearchParams()
  const { bottom } = useSafeAreaInsets()
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  // @ts-ignore
  const buttons: ScreenActionButtonProps[] = screenActionButtons[from ?? 'default']

  const handlePress = (button: ScreenActionButtonProps) => {
    if (button.onPress === 'goBack') {
      router.back()
    } else if (typeof button.onPress === 'function') {
      button.onPress()
    }
  }

  if (!url || typeof url !== 'string') {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'white', fontSize: 20 }}>Invalid image URL</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <>
              {router.canGoBack() && (
                <TouchableOpacity
                  onPress={() => {
                    router.back()
                  }}
                  style={{ borderRadius: 20, padding: 4 }}
                >
                  <Ionicons name="close-outline" size={28} color="#fff" />
                </TouchableOpacity>
              )}
            </>
          ),
          headerShadowVisible: false,
          headerBlurEffect: 'dark',
          headerTransparent: true,
          headerStyle: { backgroundColor: 'rgba(0,0,0,0.4)' }
        }}
      />

      <ImageZoom
        uri={url as string}
        style={styles.image}
        minScale={0.5}
        maxScale={5}
        doubleTapScale={2}
        isSingleTapEnabled
        isDoubleTapEnabled
        resizeMode="contain"
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />

      {loading && <ActivityIndicator style={styles.image} size="large" />}

      <BlurView intensity={90} tint="dark" style={[styles.blurview, { paddingBottom: bottom }]}>
        <View style={styles.row}>
          {buttons.map((button, index) => {
            const IconPack = button.iconPack
            return (
              <TouchableOpacity
                key={index}
                style={{ alignItems: 'center' }}
                activeOpacity={0.6}
                onPress={() => handlePress(button)}
              >
                <IconPack name={button.icon as any} size={24} color="white" />
                <Text style={styles.btnText}>{button.text}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </BlurView>

      <StatusBar animated style="light" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black'
  },
  image: {
    width: '100%',
    height: '100%',
    top: 40
  },
  blurview: {
    width: '100%',
    bottom: 0
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: 20,
    paddingHorizontal: 32,
    paddingVertical: 16
  },
  btnText: {
    color: 'white',
    fontSize: 12,
    paddingTop: 6
  }
})

export default ImageScreen
