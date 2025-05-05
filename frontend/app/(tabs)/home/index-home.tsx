import { useState, useCallback, useRef } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions, ListRenderItem } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useHeaderHeight } from '@react-navigation/elements'

import { useTheme, useFriendStore } from '@/hooks'
import { Themed } from '@/components'
import { Stack } from '@/components/router-form'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { Constants } from '@/constants'

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

/**************** ISO‑week helpers ****************/
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

/**************** Mock generators ****************/
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
    const hasMedia = Math.random() < 0.4
    const label = `${date.toLocaleString('en', { month: 'short' })} ${date.getDate()}\n${date.toLocaleString('en', {
      weekday: 'short'
    })}`
    tiles.push({ id, label, date, hasMedia, thumbnail: hasMedia ? randomThumb() : undefined })
  }
  // Insert the “+” tile after Monday (index 1) to match screenshot
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
const DayCell = ({ day }: { day: DayTile }) => {
  const { colors } = useTheme()
  return (
    <TouchableOpacity
      activeOpacity={0.8}
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

const WeekPage = ({ bundle, markSeen }: { bundle: WeekBundle; markSeen: (id: string) => void }) => {
  const headerHeight = useHeaderHeight()
  const tabHeight = useBottomTabBarHeight()

  const ADAPTIVE_HEIGHT = Constants.isIOS ? SCREEN_HEIGHT : SCREEN_HEIGHT - headerHeight - tabHeight
  const ADAPTIVE_MARGIN = Constants.isIOS ? 0 : headerHeight
  const ADAPTIVE_PADDING = Constants.isIOS ? headerHeight : 0

  const renderDay: ListRenderItem<DayTile> = ({ item }) => <DayCell day={item} />
  const renderFeed: ListRenderItem<FeedItem> = ({ item }) => <FeedCard item={item} onSeen={() => markSeen(item.id)} />
  return (
    <View
      style={{
        width: SCREEN_WIDTH,
        height: ADAPTIVE_HEIGHT,
        marginTop: ADAPTIVE_MARGIN,
        paddingTop: ADAPTIVE_PADDING
        // backgroundColor: bundle.weekNum % 2 === 0 ? 'pink' : 'lightblue'
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

/**************** HomeScreen ****************/
const HomeScreen = () => {
  const { colors } = useTheme()
  const { friends } = useFriendStore()

  const [weeks, setWeeks] = useState(buildWeeks())
  const [weekListIndex, setWeekListIndex] = useState(0)
  const listRef = useRef<FlatList>(null)

  const myFriends = friends.filter((f) => f.type === 'friend')

  myFriends.forEach((f) => console.log(f.name))

  const markSeen = useCallback((id: string) => {
    setWeeks((prev) =>
      prev.map((w) => ({
        ...w,
        feed: w.feed.map((f) => (f.id === id ? { ...f, seen: true } : f))
      }))
    )
  }, [])

  const getItemLayout = (_: any, index: number) => ({ length: SCREEN_HEIGHT, offset: SCREEN_HEIGHT * index, index })

  return (
    <Themed.View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: `Week ${weeks[weekListIndex].weekNum}`,
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
        data={weeks}
        pagingEnabled
        keyExtractor={(w) => w.key}
        renderItem={({ item }) => <WeekPage bundle={item} markSeen={markSeen} />}
        getItemLayout={getItemLayout}
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const pageNum = Math.min(
            Math.max(Math.floor(e.nativeEvent.contentOffset.y / SCREEN_HEIGHT + 0.5), 0),
            weeks.length
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
  pageHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12
  },
  pageTitle: {
    fontSize: 38,
    fontWeight: '700'
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
