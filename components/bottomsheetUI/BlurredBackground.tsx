import { StyleSheet, View } from 'react-native'
import { BlurView } from 'expo-blur'

const BlurredBackground = () => {
  return (
    <View style={styles.container}>
      <BlurView
        tint="systemChromeMaterial"
        // blurReductionFactor={1}
        experimentalBlurMethod="dimezisBlurView"
        intensity={80}
        style={styles.blurView}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden'
  },
  blurView: {
    ...StyleSheet.absoluteFillObject
  }
})

export default BlurredBackground
