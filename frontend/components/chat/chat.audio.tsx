import { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Audio, type AVPlaybackStatus } from 'expo-av'
import { Ionicons } from '@expo/vector-icons'

interface AudioComponentProps {
  uri: string
}

const AudioComponent = ({ uri }: AudioComponentProps) => {
  const [sound, setSound] = useState<Audio.Sound>()
  const [status, setStatus] = useState<AVPlaybackStatus>()

  const isPlaying = status?.isLoaded ? status.isPlaying : false
  const position = status?.isLoaded ? status.positionMillis : 0
  const duration = status?.isLoaded ? status.durationMillis : 1
  // @ts-ignore
  const progress = position / duration

  useEffect(() => {
    loadSound()
  }, [uri])

  useEffect(() => {
    return sound
      ? () => {
          // console.log('Unloading Sound')
          sound.unloadAsync()
        }
      : undefined
  }, [sound])

  const playSound = async () => {
    if (!sound) {
      return
    }
    if (status?.isLoaded && status.isPlaying) {
      await sound.pauseAsync()
    } else {
      await sound.replayAsync()
    }
  }

  const loadSound = async () => {
    // console.log('Loading Sound')
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { progressUpdateIntervalMillis: 1000 / 60 },
      onPlaybackStatusUpdate
    )
    setSound(sound)
  }

  const onPlaybackStatusUpdate = useCallback(
    async (status: AVPlaybackStatus) => {
      setStatus(status)

      if (!status.isLoaded || !sound) {
        return
      }

      if (status.didJustFinish) {
        await sound?.setPositionAsync(0)
      }
    },
    [sound]
  )

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60000)
    const seconds = ((duration % 60000) / 1000).toFixed(0)
    return `${minutes}:${+seconds < 10 ? '0' : ''}${seconds}`
  }

  return (
    <View style={styles.audioContainer}>
      <TouchableOpacity onPress={playSound} activeOpacity={0.7}>
        <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color="grey" />
      </TouchableOpacity>

      <View style={styles.playbackContainer}>
        <View style={styles.playbackBackground} />
        <View style={[styles.playbackIndicator, { left: `${progress * 95}%` }]} />
        <Text style={{ position: 'absolute', right: 0, top: 8, color: 'grey', fontSize: 12 }}>
          {formatDuration(position)}/{formatDuration(duration as number)}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  audioContainer: {
    backgroundColor: '#fff',
    width: 250,
    height: 54,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 10,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3
  },
  playbackContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  playbackBackground: {
    height: 3,
    backgroundColor: 'gainsboro',
    borderRadius: 6
  },
  playbackIndicator: {
    width: 10,
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: 'royalblue',
    position: 'absolute'
  }
})

export default AudioComponent
