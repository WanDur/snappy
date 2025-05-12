import { useState, useMemo, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable
} from 'react-native'
import { router, useLocalSearchParams, useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons, Feather } from '@expo/vector-icons'

/* ---------- hooks & stores ---------------------------- */
import { useUserStore, usePhotoStore, useFriendStore, useTheme } from '@/hooks'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { Photo } from '@/types'
import { useSession, bypassLogin, isAuthenticated } from '@/contexts/auth'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

/**
 * Screen Params expected from the router
 *  - photoId: string   (id in PhotoStore)
 *  - index:  string     (0‑based position in current week)
 *  - total:  string     (total number of photos in current week)
 */
export default function ViewPhotoModal() {
  const router = useRouter()
  const session = useSession()

  const {
    photoIds: photoIdsString,
    index = '0',
  } = useLocalSearchParams<{ photoIds: string; index?: string }>()

  const photoIds = photoIdsString.split(',')
  const { getPhoto, toggleLike } = usePhotoStore()

  const [currentIndex, setCurrentIndex] = useState(parseInt(index))
  const photo = getPhoto(photoIds[currentIndex])
  const currentUser = useUserStore((s) => s.user)
  const owner = useFriendStore((s) => s.friends.find((f) => f.id === (photo?.userId ?? currentUser.id)))

  const { colors } = useTheme()
  const insets = useSafeAreaInsets()

  useEffect(() => {
    if (!isAuthenticated(session)) {
      router.dismissAll()
      router.replace('/login')
    }
  }, [])

  /* fallback if photo not found */
  if (!photo) {
    return (
      <View style={[styles.center, { flex: 1, backgroundColor: '#000' }]}>
        <Text style={{ color: '#fff' }}>Photo not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: '#fff', textDecorationLine: 'underline' }}>Go back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  /* ------------ derived ------------- */
  const weekLabel = useMemo(() => {
    const d = new Date(photo.timestamp)
    const jan1 = new Date(Date.UTC(d.getFullYear(), 0, 1))
    const dayNr = (d.getUTCDay() || 7) - 1 // Mon=0
    const weekNo = Math.ceil(((d as any) - (jan1 as any) + ((jan1.getUTCDay() + 6) % 7) * 86400000) / 604800000)
    return `Week ${weekNo}`
  }, [photo.timestamp])

  const captureDateStr = useMemo(() => {
    const d = new Date(photo.timestamp)
    const opts: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    }
    return d.toLocaleDateString('en-US', opts)
  }, [photo.timestamp])

  const [liked, setLiked] = useState(photo.likes.includes(currentUser.id))
  
  const handleToggleLike = () => {
    const newLikedState = !liked
    const action = newLikedState ? 'like' : 'unlike'
    setLiked(newLikedState)
    toggleLike(photo.userId, photoIds[currentIndex], currentUser.id)
    session.apiWithToken.post(`/photo/${photoIds[currentIndex]}/${action}`)
      .catch((err) => {
        Alert.alert('Error', `Failed to ${action} photo`)
        setLiked(liked)
        toggleLike(photo.userId, photoIds[currentIndex], currentUser.id)
        console.error(err)
      })
  }

  /* ---------- navigation helpers --------- */
  const goTo = (nextIndex: number) => {
    router.replace({
      pathname: '/(modal)/ViewPhotoModal', // adjust if path differs
      params: {
        photoIds: photoIds,
        index: nextIndex.toString(),
      }
    })
  }

  /* ---------- index navigation (no re‑navigation) ---------- */
  const handleNext = () => {
    if (currentIndex < photoIds.length - 1) setCurrentIndex(currentIndex + 1)
  }
  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
  }

  return (
    <View style={styles.container}>
      {/* ---------- HEADER ---------- */}
      <BlurView intensity={40} tint="dark" style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerLeft}>
          <Image source={{ uri: owner?.avatar ?? currentUser.iconUrl }} style={styles.avatar} />
          <View>
            <Text style={styles.username}>{owner?.username ?? currentUser.username}</Text>
            <Text style={styles.weekLabel}>{weekLabel}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.counterBubble}>
            <Text style={styles.counterText}>
              {currentIndex + 1} of {photoIds.length}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <IconSymbol name="xmark.circle" color="#fff" size={26} />
          </TouchableOpacity>
        </View>
      </BlurView>

      {/* ---------- IMAGE WITH TAP ZONES ---------- */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: photo.url }} style={styles.image} contentFit="contain" />
        {/* tap zones */}
        <Pressable style={styles.touchLeft} onPress={handlePrev} />
        <Pressable style={styles.touchRight} onPress={handleNext} />
      </View>

      {/* ---------- INFO ROW ---------- */}
      <View style={[styles.infoRow, { paddingBottom: 6 }]}>
        <View>
          {photo.location && <Text style={styles.location}>{photo.location}</Text>}
          <Text style={styles.date}>{captureDateStr}</Text>
        </View>
        <TouchableOpacity onPress={handleToggleLike} hitSlop={10}>
          {liked ? (
            <Ionicons name="heart" size={28} color="#e63946" />
          ) : (
            <Ionicons name="heart-outline" size={28} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* ---------- CAPTION INPUT ---------- */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom + 64 : 0}
        style={{ paddingBottom: insets.bottom + 8 }}
      >
        <View style={styles.captionBar}>
          <Image source={{ uri: currentUser.iconUrl }} style={styles.captionAvatar} />
          <TextInput placeholder="Add a caption…" placeholderTextColor="#999" style={styles.captionInput} multiline />
          <Feather name="send" size={20} color="#fff" style={{ marginHorizontal: 6 }} />
          <Feather name="more-horizontal" size={20} color="#fff" />
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

/* ==================== STYLES ==================== */
const grey = '#9EA0A6'
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  /* header */
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 10
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 8
  },
  username: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700'
  },
  weekLabel: {
    color: grey,
    fontSize: 12,
    fontWeight: '500'
  },
  counterBubble: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 12
  },
  counterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  /* image wrapper & tap zones */
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.65,
    marginTop: 80
  },
  image: {
    width: '100%',
    height: '100%'
  },
  touchLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '45%',
    height: '100%'
  },
  touchRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '45%',
    height: '100%'
  },
  /* info row */
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8
  },
  location: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  date: {
    color: grey,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2
  },
  /* caption bar */
  captionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    paddingHorizontal: 12,
    minHeight: 46
  },
  captionAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8
  },
  captionInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    paddingVertical: 6
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center'
  }
})
