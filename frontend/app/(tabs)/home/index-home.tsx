import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions, ListRenderItem, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useHeaderHeight } from '@react-navigation/elements'

import { useTheme, useUserStore, useFriendStore } from '@/hooks'
import { Themed } from '@/components'
import { Stack } from '@/components/router-form'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { Constants } from '@/constants'
import { bypassLogin, isAuthenticated, parsePublicUrl, useSession } from '@/contexts/auth'
import { useRouter } from 'expo-router'
import { useSync } from '@/hooks/useSync'

import * as ImagePicker from 'expo-image-picker'
import * as MediaLibrary from 'expo-media-library'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

interface DayTile {
  id: string
  label: string
  date: Date
  hasMedia: boolean
  thumbnail?: string
  isAdd?: boolean
}

interface FeedItem {
  id: string
  user: string
  avatar: string
  mediaUri: string
  seen: boolean
}

interface WeekBundle {
  weekNum: number
  key: string
  days: DayTile[]
  feed: FeedItem[]
}

/**************** Helpers ****************/
/** Local YYYY-MM-DD (no TZ offset) */
const ymd = (d: Date): string => {
  const y = d.getFullYear()
  const m = `0${d.getMonth() + 1}`.slice(-2)
  const day = `0${d.getDate()}`.slice(-2)
  return `${y}-${m}-${day}`
}

/**************** ISO-week helpers ****************/
const getISOWeek = (d: Date = new Date()): number => {
  const copy = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNr = copy.getUTCDay() || 7 // Mon=1 … Sun=7
  copy.setUTCDate(copy.getUTCDate() + 4 - dayNr)
  const yearStart = new Date(Date.UTC(copy.getUTCFullYear(), 0, 1))
  return Math.ceil(((copy.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}
const mondayOfISOWeek = (d: Date): Date => {
  const copy = new Date(d)
  const day = copy.getDay() || 7 // Sun => 7
  copy.setDate(copy.getDate() - day + 1) // back to Monday
  copy.setHours(0, 0, 0, 0)
  return copy
}
const addDays = (d: Date, n: number) => {
  const dupe = new Date(d)
  dupe.setDate(dupe.getDate() + n)
  return dupe
}

/**************** Mock generators (for feed demo only) ****************/
const randomThumb = () => `https://picsum.photos/seed/${Math.floor(Math.random() * 10000)}/800`

const buildDays = (weekOffset: number): DayTile[] => {
  // Monday of the target week
  const today = new Date()
  const currentMon = mondayOfISOWeek(today)
  const mon = addDays(currentMon, -weekOffset * 7)

  const tiles: DayTile[] = []
  for (let i = 0; i < 7; i++) {
    const date = addDays(mon, i)
    const id = date.toISOString().split('T')[0]
    const hasMedia = false // will be patched later based on uploads
    const label = `${date.toLocaleString('en', { month: 'short' })} ${date.getDate()}\n${date.toLocaleString('en', {
      weekday: 'short'
    })}`
    tiles.push({ id, label, date, hasMedia })
  }
  // Insert the “+” tile after Monday (index 1)
  tiles.unshift({ id: `add-${weekOffset}`, label: '+', hasMedia: false, isAdd: true, date: mon })

  return tiles
}

const buildFeed = (weekOffset: number): FeedItem[] =>
  Array.from({ length: 5 }).map((_, idx) => ({
    id: `f-${weekOffset}-${idx}`,
    user: ['johndoe', 'catmeow', 'hello', 'wandur'][idx % 4],
    avatar: `https://randomuser.me/api/portraits/${idx % 2 ? 'men' : 'women'}/${30 + idx}.jpg`,
    mediaUri: randomThumb(),
    seen: Math.random() < 0.5
  }))

const buildWeeks = (count = 4): WeekBundle[] => {
  const currentWeek = getISOWeek()
  return Array.from({ length: count }).map((_, offset) => ({
    weekNum: currentWeek - offset,
    key: `week-${currentWeek - offset}`,
    days: buildDays(offset),
    feed: buildFeed(offset)
  }))
}

/**************** Components ****************/
const DayCell = ({ day, onAdd }: { day: DayTile; onAdd: () => void }) => {
  const { colors } = useTheme()
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        day.isAdd ? onAdd() : null
      }}
      style={[
        styles.dayCell,
        {
          backgroundColor: colors.secondaryBg,
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.2,
          shadowRadius: 1,
          elevation: 2
        }
      ]}
    >
      {day.hasMedia ? (
        <Image source={{ uri: day.thumbnail! }} style={styles.dayThumb} contentFit="cover" />
      ) : (
        <View style={styles.dayPlaceholder} />
      )}
      <View style={styles.dayLabelWrap}>
        <Text style={[styles.dayLabel, day.isAdd && styles.dayAdd]}>{day.label}</Text>
      </View>
    </TouchableOpacity>
  )
}

const FeedCard = ({ item, onSeen }: { item: FeedItem; onSeen: () => void }) => (
  <TouchableOpacity activeOpacity={0.9} style={[styles.feedCard, { width: SCREEN_WIDTH * 0.75 }]} onPress={onSeen}>
    <View style={styles.feedHeader}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <Themed.Text style={styles.feedUser}>{item.user}</Themed.Text>
    </View>
    <Image source={{ uri: item.mediaUri }} style={styles.feedImage} contentFit="cover" />
    {item.seen && (
      <View style={styles.seenTag}>
        <Text style={styles.seenText}>Seen</Text>
      </View>
    )}
  </TouchableOpacity>
)

const WeekPage = ({
  bundle,
  markSeen,
  addMedia
}: {
  bundle: WeekBundle
  markSeen: (id: string) => void
  addMedia: () => void
}) => {
  const headerHeight = useHeaderHeight()
  const tabHeight = useBottomTabBarHeight()

  const ADAPTIVE_HEIGHT = Constants.isIOS ? SCREEN_HEIGHT : SCREEN_HEIGHT - headerHeight - tabHeight
  const ADAPTIVE_MARGIN = Constants.isIOS ? 0 : headerHeight
  const ADAPTIVE_PADDING = Constants.isIOS ? headerHeight : 0

  const renderDay: ListRenderItem<DayTile> = ({ item }) => <DayCell day={item} onAdd={addMedia} />
  const renderFeed: ListRenderItem<FeedItem> = ({ item }) => <FeedCard item={item} onSeen={() => markSeen(item.id)} />
  return (
    <View
      style={{
        width: SCREEN_WIDTH,
        height: ADAPTIVE_HEIGHT,
        marginTop: ADAPTIVE_MARGIN,
        paddingTop: ADAPTIVE_PADDING
      }}
    >
      <View style={{ height: 16 }} />
      <FlatList
        horizontal
        data={bundle.days}
        keyExtractor={(d) => d.id}
        renderItem={renderDay}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daysRow}
      />
      <FlatList
        style={{ marginTop: -100 }}
        horizontal
        data={bundle.feed}
        keyExtractor={(f) => f.id}
        renderItem={renderFeed}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.feedRow}
      />
    </View>
  )
}

/**************** Helper – Extract capture date from picker asset ****************/
const getCaptureDate = async (asset: ImagePicker.ImagePickerAsset): Promise<Date> => {
  // 1 ▸ Try EXIF first (works on iOS, some Android devices)
  const exifDate = (asset.exif as any)?.DateTimeOriginal || (asset.exif as any)?.DateTime
  if (exifDate && typeof exifDate === 'string') {
    // EXIF datetime format "YYYY:MM:DD HH:MM:SS"
    const parsed = exifDate.replace(/:/g, '-').replace(' ', 'T')
    const d = new Date(parsed)
    if (!isNaN(d.getTime())) return d
  }

  // 2 ▸ MediaLibrary (works reliably on Android & iOS)
  if (asset.assetId) {
    try {
      const info = await MediaLibrary.getAssetInfoAsync(asset.assetId)
      if (info && typeof info.creationTime === 'number') {
        return new Date(info.creationTime)
      }
    } catch (e) {
      console.warn('Failed to fetch MediaLibrary info', e)
    }
  }

  // 3 ▸ Fallback to file modification time (Android legacy)
  // Omitted because 'modificationTime' is not part of 'ImagePickerAsset'.

  // 4 ▸ Last resort – now
  return new Date()
}

/**************** HomeScreen ****************/
const HomeScreen = () => {
  const session = useSession()
  const router = useRouter()
  const userStore = useUserStore()
  const { syncUserData, syncFriends } = useSync()

  const { colors } = useTheme()
  const { friends, addFriend, clearFriends } = useFriendStore()

  const [weeks, setWeeks] = useState<WeekBundle[]>(buildWeeks())
  const [weekListIndex, setWeekListIndex] = useState(0)
  const listRef = useRef<FlatList>(null)

  type PhotoInfo = { uri: string }
  const [mediaByDate, setMediaByDate] = useState<Record<string, PhotoInfo>>({})

  /** Ensure user logged in */
  useEffect(() => {
    if (bypassLogin()) {
      return
    }

    if (!isAuthenticated(session)) {
      console.log('User is not authenticated, redirecting to login')
      router.replace('/(auth)/LoginScreen')
      return
    }
    if (session.session) {
      syncUserData(session)
      syncFriends(session)
    } else {
      console.log('Session is null')
    }
  }, [])

  const markSeen = useCallback((id: string) => {
    setWeeks((prev) =>
      prev.map((w) => ({
        ...w,
        feed: w.feed.map((f) => (f.id === id ? { ...f, seen: true } : f))
      }))
    )
  }, [])

  const getItemLayout = (_: any, index: number) => ({ length: SCREEN_HEIGHT, offset: SCREEN_HEIGHT * index, index })

  /* -------- Combine Zustand data & local uploads to week bundles -------- */
  const enrichedWeeks = useMemo(() => {
    if (weeks.length === 0) return weeks

    // Build feed from friend list (placeholder: use their first photo or blank)
    const localFeed: FeedItem[] = friends.map((f, i) => {
      const first = f.albumList.flatMap((al) => al.images ?? [])[0]?.uri
      return {
        id: `local-${f.id}-${i}`,
        user: f.username ?? f.name,
        avatar: f.avatar ?? 'https://placehold.co/400x400/CCCCCC/000000?text=No+Avatar',
        mediaUri: first ?? 'https://placehold.co/600x600/EEEEEE/AAAAAA?text=No+Photo',
        seen: false
      }
    })

    // Patch every week bundle with user-uploaded photos stored in mediaByDate
    return weeks.map((w) => {
      const patchedDays = w.days.map((d) => {
        const iso = d.date.toISOString().split('T')[0]
        if (mediaByDate[iso]) {
          return { ...d, hasMedia: true, thumbnail: mediaByDate[iso].uri }
        }
        return d
      })
      return {
        ...w,
        days: patchedDays,
        feed: localFeed // replace demo feed
      }
    })
  }, [weeks, friends, mediaByDate])

  /**
   * Handle picking a photo → place onto the correct day tile based on capture date.
   */
  const handleAddMedia = useCallback(async () => {
    /* 1 ▸ Ask for library permission (iOS/Android) */
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') return

    /* 2 ▸ Open the gallery – photos only */
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.8,
      exif: true
    })
    if (res.canceled) return

    const asset = res.assets[0]

    /* 3 ▸ Determine the photo's original capture date */
    const captureDate = await getCaptureDate(asset)
    captureDate.setHours(0, 0, 0, 0) // normalise to 00:00 for keying
    const iso = captureDate.toISOString().split('T')[0]

    /* 4 ▸ If user already has a photo for that day, do nothing */
    if (mediaByDate[iso]) {
      console.log('Photo already exists', 'You have already selected/uploaded a photo for this date.')
      console.log('captureDate', captureDate)
      return
    }

    /* 5 ▸ Register in local state */
    setMediaByDate((prev) => ({ ...prev, [iso]: { uri: asset.uri } }))

    /* 6 ▸ Make sure the corresponding week exists in state */
    setWeeks((prevWeeks) => {
      const captureWeekNum = getISOWeek(captureDate)
      const currentWeekNum = getISOWeek()
      let newWeeks = [...prevWeeks]

      // If the capture week isn't loaded yet, build it and insert at proper offset (older weeks at the end)
      if (!newWeeks.some((w) => w.weekNum === captureWeekNum)) {
        const offset = currentWeekNum - captureWeekNum
        const newBundle: WeekBundle = {
          weekNum: captureWeekNum,
          key: `week-${captureWeekNum}`,
          days: buildDays(offset).map((d) => {
            const dIso = d.date.toISOString().split('T')[0]
            if (dIso === iso) {
              return { ...d, hasMedia: true, thumbnail: asset.uri }
            }
            return d
          }),
          feed: []
        }
        newWeeks.splice(offset, 0, newBundle) // place by offset so list remains in order
      } else {
        newWeeks = newWeeks.map((w) => {
          if (w.weekNum !== captureWeekNum) return w
          return {
            ...w,
            days: w.days.map((d) => {
              const dIso = d.date.toISOString().split('T')[0]
              if (dIso === iso) {
                return { ...d, hasMedia: true, thumbnail: asset.uri }
              }
              return d
            })
          }
        })
      }

      return newWeeks
    })

    /* 7 ▸ OPTIONAL: upload to backend */
    // await PhotoService.upload(asset, session.session?.accessToken, captureDate)
  }, [mediaByDate, session])

  return (
    <Themed.View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: `Week ${enrichedWeeks[weekListIndex]?.weekNum ?? ''}`,
          headerRight: () => (
            <TouchableOpacity activeOpacity={0.7}>
              <IconSymbol name="bell" color={colors.text} size={26} />
            </TouchableOpacity>
          ),
          headerTransparent: true,
          ...(!Constants.isIOS && { headerStyle: { backgroundColor: colors.background } })
        }}
      />

      <FlatList
        ref={listRef}
        data={enrichedWeeks}
        pagingEnabled
        keyExtractor={(w) => w.key}
        renderItem={({ item }) => <WeekPage bundle={item} markSeen={markSeen} addMedia={handleAddMedia} />}
        getItemLayout={getItemLayout}
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const pageNum = Math.min(
            Math.max(Math.floor(e.nativeEvent.contentOffset.y / SCREEN_HEIGHT + 0.5), 0),
            enrichedWeeks.length
          )
          setWeekListIndex(pageNum)
        }}
      />
    </Themed.View>
  )
}

/**************** Styles ****************/
const tileWidth = 100
const tileHeight = 120

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  daysRow: {
    paddingLeft: 16,
    margin: 4,
    marginBottom: 20
  },
  dayCell: {
    width: tileWidth,
    height: tileHeight,
    borderRadius: 16,
    marginRight: 12
  },
  dayThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 16
  },
  dayPlaceholder: {
    flex: 1
  },
  dayLabelWrap: {
    position: 'absolute',
    bottom: 8,
    left: 8
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff'
  },
  dayAdd: {
    fontSize: 40,
    fontWeight: '300',
    color: '#000'
  },
  feedRow: {
    paddingLeft: 16
  },
  feedCard: {
    marginRight: 16
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8
  },
  feedUser: {
    fontSize: 14,
    fontWeight: '600'
  },
  feedImage: {
    width: '100%',
    height: SCREEN_WIDTH * 0.75,
    borderRadius: 20,
    backgroundColor: '#ccc'
  },
  seenText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  seenTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#000',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12
  }
})

export default HomeScreen
