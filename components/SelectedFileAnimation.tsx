import { View, Text, Image, StyleSheet } from 'react-native'
import React, { useState, useRef } from 'react'
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated'
import { BlurView } from 'expo-blur'

import { Constants } from '@/constants'
import { Attachment } from '@/types/chats.type'
import { FontAwesome6, Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/hooks'

type Data = { key: string; attachment: Attachment; _length?: number }

interface Props {
  data: Data[]
  isLoading: boolean
}

const _borderRadius = 8
const _itemSize = 60

const Item = ({ item, index }: { item: Data; index: number }) => {
  const { colors } = useTheme()

  const rotationMapRef = useRef<Record<string, number>>({})

  const getStableRotationForKey = (key: string) => {
    if (!(key in rotationMapRef.current)) {
      rotationMapRef.current[key] = (Math.random() > 0.5 ? -1 : 1) * Math.random() * 15
    }
    return rotationMapRef.current[key]
  }
  const rotationValue = getStableRotationForKey(item.key)

  const getFileIcon = (type: string) => {
    const [fileType, fileSubtype] = type.split('/')
    if (fileType === 'image') {
      return 'file-image'
    } else if (fileType === 'audio') {
      return 'file-audio'
    } else if (fileType === 'video') {
      return 'file-video'
    } else if (type === 'application/pdf') {
      return 'file-pdf'
    } else {
      return 'file'
    }
  }

  const getImage = () => {
    // return <Image source={{ uri: item.attachment.url }} style={{ flex: 1, borderRadius: _borderRaius }} />
    if (item.attachment.type.startsWith('image')) {
      return <Image source={{ uri: item.attachment.url }} style={{ flex: 1, borderRadius: _borderRadius }} />
    } else {
      return <View style={{ flex: 1, borderRadius: _borderRadius, justifyContent: 'center', alignItems: 'center' }}>
        <FontAwesome6 name={getFileIcon(item.attachment.type)} color={colors.gray} size={35}/>
      </View>
    }
  }

  return (
    <View
      style={{
        width: _itemSize,
        aspectRatio: 1,
        borderRadius: _borderRadius,
        padding: 2,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 7,
        elevation: 5,
        marginLeft: index !== 0 ? -_itemSize / 2 : 0,
        transform: [{ rotate: `${rotationValue}deg` }]
      }}
    >
      {item.key === '-1' ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          {getImage()}
          <BlurView
            style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderRadius: _borderRadius }]}
            tint="light"
            intensity={10}
          />
          <Text
            style={{ position: 'absolute', alignSelf: 'center', color: 'white', fontWeight: '800', fontSize: 16 }}
          >{`+${item._length! - 4}`}</Text>
        </View>
      ) : (
        getImage()
      )}
    </View>
  )
}

const SelectedFileAnimation = ({ data: data, isLoading }: Props) => {
  const [width, setWidth] = useState(30)

  if (data.length > 5) {
    data[4]._length = data.length
    data[4].key = '-1'
    data = data.slice(0, 5)
  }

  return (
    <View
      style={{ left: Constants.screenWidth / 2 - width / 2 }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', minHeight: _itemSize }}>
        {!isLoading &&
          data.map((item, index) => (
            <Animated.View
              style={{ zIndex: index }}
              key={index}
              entering={ZoomIn.springify()
                .stiffness(200)
                .damping(80)
                .delay(index * 75)}
              exiting={ZoomOut.springify()
                .stiffness(200)
                .damping(80)
                .delay(index * 75)}
            >
              <Item item={item} index={index} />
            </Animated.View>
          ))}
      </View>
    </View>
  )
}

export default SelectedFileAnimation
