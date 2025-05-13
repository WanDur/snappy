import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ListRenderItem,
  Alert,
  Modal,
  RefreshControl
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useHeaderHeight } from '@react-navigation/elements'

import { useTheme, useUserStore, useFriendStore, usePhotoStore } from '@/hooks'
import { Themed } from '@/components'
import { Stack } from '@/components/router-form'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { Constants } from '@/constants'
import { bypassLogin, isAuthenticated, parsePublicUrl, useSession } from '@/contexts/auth'
import { useRouter } from 'expo-router'
import { useSync } from '@/hooks/useSync'

import * as ImagePicker from 'expo-image-picker'
import * as MediaLibrary from 'expo-media-library'
import * as FileSystem from 'expo-file-system'

import { id as makeId, getDateString } from '@/utils/utils'
import mime from 'mime'

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
  userId: string
  photoId: string
  user: string
  avatar: string
  mediaUri: string
  seen: boolean
}

interface WeekBundle {
  year: number
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

/***************building day tiles and feed logics */
const buildDays = (weekOffset: number): DayTile[] => {
  // Monday of the target week
  const today = new Date()
  const currentMon = mondayOfISOWeek(today)
  const mon = addDays(currentMon, -weekOffset * 7)

  const tiles: DayTile[] = []
  for (let i = 0; i < 7; i++) {
    const date = addDays(mon, i)
    const id = getDateString(date)
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

const buildWeeks = (count = 4): WeekBundle[] => {
  const currentWeek = getISOWeek()
  return Array.from({ length: count }).map((_, offset) => ({
    year: new Date().getFullYear(),
    weekNum: currentWeek - offset,
    key: `week-${currentWeek - offset}`,
    days: buildDays(offset),
    feed: []
  }))
}

/**************** Components ****************/
const DayCell = ({ day, onAdd, onOpenPhoto }: { day: DayTile; onAdd: () => void; onOpenPhoto: () => void }) => {
  const { colors } = useTheme()
  const isAdd = !!day.isAdd
  const isPhoto = day.hasMedia

  /** helpers for the empty-day label */
  const month = format(day.date, 'LLL') // Jul
  const dateNum = format(day.date, 'd') // 10
  const weekday = format(day.date, 'EEE') // Mon

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={isAdd ? onAdd : isPhoto ? onOpenPhoto : undefined}
      style={[
        styles.dayCell,
        { backgroundColor: colors.secondaryBg },
        isAdd && styles.center // centre the “+”
      ]}
    >
      {/* 1️  PLUS TILE  */}
      {isAdd && <Themed.Text style={styles.plus}>＋</Themed.Text>}

      {/* 2️⃣ PHOTO TILE – image + centered weekday at bottom */}
      {!isAdd && isPhoto && (
        <View style={styles.thumbContainer}>
          <Image source={{ uri: day.thumbnail! }} style={styles.thumb} contentFit="cover" />
          <View style={styles.weekdayOverlay}>
            <Text style={styles.weekdayText}>{weekday}</Text>
          </View>
        </View>
      )}

      {/* 3️  EMPTY TILE  */}
      {!isAdd && !isPhoto && (
        <View style={styles.emptyLabelWrap}>
          <Text style={styles.month}>{month}</Text>
          <Text style={styles.dateNum}>{dateNum}</Text>
          <Text style={styles.weekday}>{weekday}</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

interface FeedItem {
  id: string
  userId: string
  photoId: string
  user: string
  avatar: string
  mediaUri: string
  seen: boolean
}

interface FeedCardProps {
  item: FeedItem
  onPressPhoto: () => void
  onPressUser: () => void
}

const FeedCard = ({ item, onPressPhoto, onPressUser }: FeedCardProps) => (
  <View style={[styles.feedCard, { width: SCREEN_WIDTH * 0.75 }]}>
    {/* header: avatar + username, tappable */}
    <View style={styles.feedHeader}>
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center' }}
        activeOpacity={0.7}
        onPress={onPressUser}
      >
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <Themed.Text style={styles.feedUser}>{item.user}</Themed.Text>
      </TouchableOpacity>
    </View>
    {/* photo: opens carousel */}
    <TouchableOpacity activeOpacity={0.9} onPress={onPressPhoto}>
      <Image source={{ uri: item.mediaUri }} style={styles.feedImage} contentFit="cover" />
      {item.seen && (
        <View style={styles.seenTag}>
          <Text style={styles.seenText}>Seen</Text>
        </View>
      )}
    </TouchableOpacity>
  </View>
)

/**************** Image‑grid picker (filtered by week) ****************/
const AssetTile = ({ asset, onSelect }: { asset: MediaLibrary.Asset; onSelect: (a: MediaLibrary.Asset) => void }) => (
  <TouchableOpacity style={styles.assetTile} activeOpacity={0.8} onPress={() => onSelect(asset)}>
    <Image source={{ uri: asset.uri }} style={styles.assetImg} contentFit="cover" />
  </TouchableOpacity>
)

const WeekPage = ({
  bundle,
  markSeen,
  addMedia,
  openPhotoModal,
  openFeedPhoto,
  openFriendProfile
}: {
  bundle: WeekBundle
  markSeen: (id: string) => void
  addMedia: () => void
  openPhotoModal: (week: WeekBundle, day: DayTile) => void
  openFeedPhoto: (week: WeekBundle, feed: FeedItem) => void
  openFriendProfile: (feed: FeedItem) => void
}) => {
  const headerHeight = useHeaderHeight()
  const tabHeight = useBottomTabBarHeight()

  const ADAPTIVE_HEIGHT = Constants.isIOS ? SCREEN_HEIGHT : SCREEN_HEIGHT - headerHeight - tabHeight
  const ADAPTIVE_MARGIN = Constants.isIOS ? 0 : headerHeight
  const ADAPTIVE_PADDING = Constants.isIOS ? headerHeight : 0

  const renderDay: ListRenderItem<DayTile> = ({ item }) => (
    <DayCell day={item} onAdd={addMedia} onOpenPhoto={() => openPhotoModal(bundle, item)} />
  )
  const renderFeed: ListRenderItem<FeedItem> = ({ item }) => (
    <FeedCard
      item={item}
      onPressPhoto={() => openFeedPhoto(bundle, item)}
      onPressUser={() => openFriendProfile(item)}
    />
  )
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

// region HomeScreen
/**************** HomeScreen ****************/
const HomeScreen = () => {
  const session = useSession()
  const router = useRouter()
  const { user } = useUserStore()
  const { initialSync, syncPhotos, syncFriendPhotos } = useSync()

  const { colors } = useTheme()
  const { getAcceptedFriends } = useFriendStore()
  const { addPhoto, getUserPhotos, lastUpdate } = usePhotoStore()

  const [weeks, setWeeks] = useState<WeekBundle[]>(buildWeeks())
  const [weekListIndex, setWeekListIndex] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const listRef = useRef<FlatList>(null)

  //type PhotoInfo = { uri: string }
  //const [mediaByDate, setMediaByDate] = useState<Record<string, PhotoInfo>>({})

  /* === PHOTO STORE ====================================== */
  const currentUserId = useUserStore((s) => s.user.id)
  const myPhotos = getUserPhotos(currentUserId)

  const mediaByDate = useMemo(() => {
    const map: Record<string, { uri: string }> = {}
    ;[...myPhotos]
      .sort((a, b) => {
        const ta = (a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp)).getTime()
        const tb = (b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp)).getTime()
        return ta - tb // oldest-first
      })
      .forEach((p) => {
        const iso = getDateString(p.timestamp instanceof Date ? p.timestamp : new Date(p.timestamp))
        if (!map[iso]) map[iso] = { uri: p.url }
      })
    return map
  }, [myPhotos])

  /** picker modal state */
  const [pickerAssets, setPickerAssets] = useState<MediaLibrary.Asset[]>([])
  const [pickerVisible, setPickerVisible] = useState(false)
  const pickerWeekRef = useRef<WeekBundle | null>(null)

  /** Ensure user logged in */
  useEffect(() => {
    // router.replace('/settingscreen/SettingScreen')
    if (bypassLogin()) {
      return
    }

    if (!isAuthenticated(session)) {
      console.log('User is not authenticated, redirecting to login')
      router.replace('/(auth)/LoginScreen')
      return
    }
    if (session.session) {
      initialSync(session)
    } else {
      console.log('Session is null')
    }
  }, [])

  const onResfresh = async () => {
    setRefreshing(true)
    await syncPhotos(session, user.id)
    await syncFriendPhotos(session)
    setRefreshing(false)
  }

  const markSeen = useCallback((id: string) => {
    setWeeks((prev) =>
      prev.map((w) => ({
        ...w,
        feed: w.feed.map((f) => (f.id === id ? { ...f, seen: true } : f))
      }))
    )
  }, [])

  const getItemLayout = (_: any, index: number) => ({ length: SCREEN_HEIGHT, offset: SCREEN_HEIGHT * index, index })

  /** HANDLING OPEN PHOTO MODEL */
  // open the photo modal
  const openPhotoModal = useCallback(
    (week: WeekBundle, day: DayTile) => {
      const isoClicked = getDateString(day.date)

      /*   all photos YOU posted in this ISO week  */
      const weekPhotos = myPhotos
        .filter((p) => p.year === week.year && p.week === week.weekNum)
        .sort((a, b) => {
          const ta = (a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp)).getTime()
          const tb = (b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp)).getTime()
          return ta - tb // oldest → newest
        })

      if (!weekPhotos.length) return // shouldn’t happen

      /*  where should the carousel start? → first photo whose date == clicked cell  */
      const startIndex = weekPhotos.findIndex(
        (p) => getDateString(p.timestamp instanceof Date ? p.timestamp : new Date(p.timestamp)) === isoClicked
      )

      router.push({
        pathname: '/(modal)/ViewPhotoModal',
        params: {
          photoIds: weekPhotos.map((p) => p.id).join(','), // e.g. "a1,b2,c3,d4"
          index: Math.max(startIndex, 0).toString() // default to 0 if not found
        }
      })
    },
    [myPhotos, router]
  )

  /** Navigate to a friend’s profile sheet */
  const openFriendProfile = useCallback(
    (feed: FeedItem) => {
      router.push({
        pathname: '/(modal)/FriendProfileModal',
        params: { friendID: feed.userId }
      })
    },
    [router]
  )

  const openFeedPhoto = useCallback(
    (week: WeekBundle, feed: FeedItem) => {
      // no photo – nothing to open
      if (!feed.photoId) return

      // collect ALL that friend’s photos for this week
      const friendWeekPhotos = getUserPhotos(feed.userId).filter((p) => p.year === week.year && p.week === week.weekNum)

      if (!friendWeekPhotos.length) return

      const startIndex = Math.max(
        friendWeekPhotos.findIndex((p) => p.id === feed.photoId),
        0
      )

      // mark as seen
      markSeen(feed.id)

      router.push({
        pathname: '/(modal)/ViewPhotoModal',
        params: {
          photoIds: friendWeekPhotos.map((p) => p.id).join(','),
          index: startIndex.toString()
        }
      })
    },
    [getUserPhotos, markSeen, router]
  )

  /* -------- Combine Zustand data & local uploads to week bundles -------- */
  const enrichedWeeks = useMemo(() => {
    if (weeks.length === 0) return weeks

    // Patch every week bundle with user-uploaded photos stored in mediaByDate
    return weeks.map((w) => {
      // Build feed from friend list (placeholder: use their first photo or blank)
      const localFeed: FeedItem[] = getAcceptedFriends()
        .map((f, i) => {
          const photos = getUserPhotos(f.id).filter((p) => p.year == w.year && p.week === w.weekNum)
          return {
            id: `local-${f.id}-${i}`,
            userId: f.id,
            photoId: photos[0]?.id ?? '', // empty if no upload yet
            user: f.username ?? f.name,
            avatar: f.avatar ?? 'https://placehold.co/400x400/CCCCCC/000000?text=No+Avatar',
            mediaUri: photos[0]?.url ?? 'https://placehold.co/600x600/EEEEEE/AAAAAA?text=No+Photo',
            seen: false
          }
        })
        .sort((a, b) => {
          if (a.mediaUri === b.mediaUri && b.mediaUri === 'https://placehold.co/600x600/EEEEEE/AAAAAA?text=No+Photo') {
            return 0
          } else if (a.mediaUri === 'https://placehold.co/600x600/EEEEEE/AAAAAA?text=No+Photo') {
            return 1
          } else if (b.mediaUri === 'https://placehold.co/600x600/EEEEEE/AAAAAA?text=No+Photo') {
            return -1
          }
          return 0
        })

      const patchedDays = w.days.map((d) => {
        if (d.isAdd) return d // skip the “+” tile
        const iso = getDateString(d.date)
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
  }, [weeks, getAcceptedFriends(), mediaByDate, lastUpdate])

  const openPicker = useCallback(async (week: WeekBundle) => {
    const { status } = await MediaLibrary.requestPermissionsAsync()
    if (status !== 'granted') return

    // Monday → Sunday boundaries
    const mon = week.days.find((d) => !d.isAdd)?.date as Date
    const sun = addDays(mon, 6)
    const createdAfter = mon.getTime()
    const createdBefore = sun.getTime() + 86400000 // end of Sunday

    const assetsRes = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.photo,
      sortBy: MediaLibrary.SortBy.creationTime,
      first: 500,
      createdAfter,
      createdBefore
    })

    if (assetsRes.totalCount === 0) {
      Alert.alert('No photos', 'There are no photos captured in this week.')
      return
    }

    pickerWeekRef.current = week
    setPickerAssets(assetsRes.assets)
    setPickerVisible(true)
  }, [])

  // region handle asset select
  /** when an asset is selected from modal */
  const handleAssetSelect = useCallback(
    async (asset: MediaLibrary.Asset) => {
      if (!pickerWeekRef.current) return
      setPickerVisible(false)

      /* 0 figure out the capture date */
      const captureDate = new Date(asset.creationTime)
      captureDate.setHours(0, 0, 0, 0)
      const iso = getDateString(captureDate)
      console.log('captureDate', captureDate.toISOString())
      console.log('iso', iso)

      // 1.duplicate check
      // Is this the first photo of the day?  (needed for UI patching only)
      const isFirstOfDay = !mediaByDate[iso]

      const formData = new FormData()
      const assetInfo = await MediaLibrary.getAssetInfoAsync(asset)
      formData.append('file', {
        uri: assetInfo.localUri,
        name: assetInfo.filename,
        type: mime.getType(assetInfo.filename) ?? 'image/jpeg'
      } as any)
      formData.append('timestamp', captureDate.toISOString())
      session.apiWithToken
        .post('/photo/upload', formData)
        .then(async (res) => {
          const { photoId } = res.data

          /* 2 file system */
          const dir = FileSystem.documentDirectory!
          await FileSystem.makeDirectoryAsync(dir, { intermediates: true })

          const filename = `${photoId}.jpg` // reuse the store’s id helper
          const dest = dir + filename
          await FileSystem.copyAsync({ from: asset.uri, to: dest })

          /* save to local */
          //setMediaByDate((prev) => ({ ...prev, [iso]: { uri: asset.uri } }))

          addPhoto(currentUserId, {
            id: photoId,
            uri: dest,
            timestamp: captureDate,
            likes: []
          })

          /* ensure week bundle present & patch */
          if (isFirstOfDay) {
            setWeeks((prev) => {
              const captureWeek = pickerWeekRef.current!.weekNum
              const current = getISOWeek()
              const offset = current - captureWeek
              const exists = prev.some((w) => w.weekNum === captureWeek)
              if (!exists) {
                // build and insert at correct offset
                const newBundle: WeekBundle = {
                  year: pickerWeekRef.current!.year,
                  weekNum: captureWeek,
                  key: `week-${captureWeek}`,
                  days: buildDays(offset).map((d) =>
                    !d.isAdd && ymd(d.date) === iso ? { ...d, hasMedia: true, thumbnail: asset.uri } : d
                  ),
                  feed: []
                }
                const arr = [...prev]
                arr.splice(offset, 0, newBundle)
                return arr
              }
              return prev.map((w) =>
                w.weekNum === captureWeek
                  ? {
                      ...w,
                      days: buildDays(offset).map((d) =>
                        !d.isAdd && getDateString(d.date) === iso ? { ...d, hasMedia: true, thumbnail: asset.uri } : d
                      )
                    }
                  : w
              )
            })
          }
        })
        .catch((err) => {
          console.error('Error uploading photo', err)
          console.log(err.response.data)
          Alert.alert('Error uploading photo', 'Please try again.')
        })
    },
    [mediaByDate]
  )

  return (
    <Themed.View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: `Week ${enrichedWeeks[weekListIndex]?.weekNum ?? ''}`,
          headerTransparent: true,
          ...(!Constants.isIOS && { headerStyle: { backgroundColor: colors.background } })
        }}
      />

      <FlatList
        ref={listRef}
        data={enrichedWeeks}
        pagingEnabled
        keyExtractor={(w) => w.key}
        renderItem={({ item }) => (
          <WeekPage
            bundle={item}
            markSeen={markSeen}
            addMedia={() => openPicker(item)}
            openPhotoModal={openPhotoModal}
            openFeedPhoto={openFeedPhoto}
            openFriendProfile={openFriendProfile}
          />
        )}
        refreshControl={<RefreshControl progressViewOffset={200} refreshing={refreshing} onRefresh={onResfresh} />}
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

      {/* picker modal */}
      <Modal visible={pickerVisible} animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.pickerHeader}>
          <TouchableOpacity onPress={() => setPickerVisible(false)}>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>Cancel</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 16, fontWeight: '700' }}>Select a photo</Text>
          <View style={{ width: 60 }} />
        </View>
        <FlatList
          data={pickerAssets}
          keyExtractor={(a) => a.id}
          numColumns={3}
          renderItem={({ item }) => <AssetTile asset={item} onSelect={handleAssetSelect} />}
        />
      </Modal>
    </Themed.View>
  )
}

/**************** Styles ****************/
const tileWidth = 100
const tileHeight = 120
const assetSize = SCREEN_WIDTH / 3 - 2
const grey = '#9EA0A6' // light grey used for empty text

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
    marginRight: 12,
    overflow: 'hidden'
  },
  dayCellAddContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  addIcon: {
    fontSize: 42,
    fontWeight: '300',
    color: '#000'
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
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  dayAdd: {
    fontSize: 40,
    fontWeight: '300'
  },
  /* ↓ reusable centre helper */
  center: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  /* PLUS */
  plus: {
    fontSize: 42,
    lineHeight: 46,
    fontWeight: '400'
  },
  /* PHOTO */
  thumb: { width: '100%', height: '100%' },
  thumbContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative'
  },
  /* bottom-center overlay */
  weekdayOverlay: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    alignItems: 'center'
  },
  weekdayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },

  /* EMPTY (no photo)  —  three-line centred label */
  emptyLabelWrap: {
    ...StyleSheet.absoluteFillObject, // fill tile
    justifyContent: 'center',
    alignItems: 'center'
  },
  month: {
    fontSize: 14,
    fontWeight: '600',
    color: grey,
    marginBottom: 2
  },
  dateNum: {
    fontSize: 28,
    fontWeight: '700',
    color: grey,
    marginBottom: 2,
    lineHeight: 32
  },
  weekday: {
    fontSize: 14,
    fontWeight: '600',
    color: grey
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
  },
  // picker modal
  pickerHeader: {
    marginTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16
  },
  assetTile: { width: assetSize, height: assetSize, margin: 1 },
  assetImg: { width: '100%', height: '100%' }
  //})
})

export default HomeScreen
