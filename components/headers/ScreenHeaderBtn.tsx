/**
 * this component render a header button on the top left of the screen
 * you can change the component in line 56 to change the custom icon
 * or else it will render an icon or a text
 */
import { TouchableOpacity, StyleSheet } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Svg, { Circle } from 'react-native-svg'

import { ThemedText } from '../themed/ThemedText'
import { ThemedView } from '../themed/ThemedView'
import { Colors } from '@/constants'

interface ScreenHeaderBtnProps {
  iconName?: string
  headerName?: string
  extraIcon?: string
  color?: string
  handlePress?: () => void
}

// @ts-ignore
const CircleIcon = ({ name, size = 44, iconColor = '#555', circleColor = '#ddd' }) => {
  const iconSize = size * 0.65
  return (
    <ThemedView
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        width: size,
        height: size
      }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={circleColor} />
      </Svg>
      <MaterialIcons
        name={name || 'person'}
        size={iconSize}
        color={iconColor}
        style={{
          position: 'absolute'
        }}
      />
    </ThemedView>
  )
}

const ScreenHeaderBtn = ({ iconName, headerName, handlePress, extraIcon, color }: ScreenHeaderBtnProps) => {
  return (
    <TouchableOpacity style={styles.btnContainer} onPress={handlePress} activeOpacity={0.7}>
      {extraIcon ? (
        <CircleIcon name={extraIcon} />
      ) : iconName ? (
        // @ts-ignore
        <MaterialIcons name={iconName} size={26} color={color ?? styles.headerIcon.color} />
      ) : (
        <ThemedText style={styles.headerText}>{headerName}</ThemedText>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  btnContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerIcon: {
    color: Colors.light.text
  },
  headerText: {
    fontSize: 17
  }
})

export default ScreenHeaderBtn
