import { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
  Dimensions,
  Keyboard,
  Alert,
  ListRenderItem,
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'

import { Themed, TouchableBounce } from '@/components'
import { Stack, Form, ContentUnavailable } from '@/components/router-form'
import { BlurredHandle, BlurredBackground } from '@/components/bottomsheetUI'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { AlbumCover } from '../album/index-album'
import { useTheme, useAlbumStore, useUserStore, usePhotoStore } from '@/hooks'
import { isAuthenticated, parsePublicUrl, useSession } from '@/contexts/auth'
import { Album } from '@/types'
import { PhotoPreview } from '@/types/photo.types'
import { useSync } from '@/hooks/useSync'

interface PhotoWeek {
  id: string;
  startDate: Date;
  endDate: Date;
  year: number;
  week: number;
  photos: PhotoPreview[];
}

const generateMockPhotos = () => {
  const weeks = []
  const currentDate = new Date()

  for (let i = 0; i < 4; i++) {
    const weekStart = new Date(currentDate)
    weekStart.setDate(currentDate.getDate() - i * 7)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() - 6)

    const photos = []
    // Generate 3-8 photos per week
    const photoCount = Math.floor(Math.random() * 6) + 3

    for (let j = 0; j < photoCount; j++) {
      const width = 300 + Math.floor(Math.random() * 300)
      const height = 300 + Math.floor(Math.random() * 300)

      photos.push({
        id: `week${i}_photo${j}`,
        url: `https://via.placeholder.com/${width}x${height}`,
        caption: j % 3 === 0 ? 'Enjoying the weekend vibes! #photography' : '',
        location: j % 4 === 0 ? 'Golden Gate Park' : '',
        timestamp: new Date(weekStart.getTime() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000))
      } as PhotoPreview)
    }

    weeks.push({
      id: `week${i}`,
      startDate: weekEnd,
      endDate: weekStart,
      photos: photos
    })
  }

  return weeks
}

/**
 * Returns the Date of the Monday of the given ISO week and year.
 */
function getWeekStart(year: number, week: number): Date {
  // January 4th is always in the first ISO week of the year
  const simple = new Date(Date.UTC(year, 0, 4));
  // Get the Monday of the first ISO week
  const dayOfWeek = simple.getUTCDay() || 7; // 1 (Mon) ... 7 (Sun)
  const monday = new Date(simple);
  monday.setUTCDate(simple.getUTCDate() - dayOfWeek + 1 + (week - 1) * 7);
  // Return as local date (remove UTC if you want UTC)
  return new Date(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate());
}

/**
 * Returns the Date of the Sunday of the given ISO week and year.
 */
function getWeekEnd(year: number, week: number): Date {
  const monday = getWeekStart(year, week);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return sunday;
}

const photosByWeek = generateMockPhotos()

const { width } = Dimensions.get('window')
const photoCardWidth = width * 0.75
const photoMargin = 12
const albumCardSize = (width - 48) / 2

const ProfileScreen = () => {
  const router = useRouter()
  const session = useSession()
  const { user, setUser, updateName, updateUsername, updateBio, updateAvatar } = useUserStore()
  const { albumList } = useAlbumStore()
  const { colors } = useTheme()
  const { syncPhotos } = useSync()
  const { getUserPhotos } = usePhotoStore()

  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [firstName, setFirstName] = useState(user.name.split(' ')[0])
  const [lastName, setLastName] = useState(user.name.split(' ')[1])
  const [userName, setUserName] = useState(user.username)
  const [bio, setBio] = useState(user.bio)
  const [photoCount, setPhotoCount] = useState(0)
  const [photoWeeks, setPhotoWeeks] = useState<PhotoWeek[]>([])

  const fetchProfileData = async () => {
    if (session.session) {
      session.apiWithToken.get('/user/profile/myself').then((res) => {
        const userData = res.data
        setUser({
          id: userData.id,
          email: userData.email,
          username: userData.username,
          name: userData.name,
          phone: userData.phone,
          iconUrl: userData.iconUrl,
          bio: userData.bio,
          notificationTokens: [], // TODO - to be implemented
          tier: userData.tier,
          premiumExpireTime: userData.premiumExpireTime
        })
        const iconUrl = parsePublicUrl(userData.iconUrl)
        updateAvatar(iconUrl)
        setPhotoCount(userData.photoCount)
      })
    }
  }

  useEffect(() => {
    if (!isAuthenticated(session)) {
      router.replace('/(auth)/LoginScreen')
      return
    }

    fetchProfileData()
    syncPhotos(session, user.id).then(() => {
      const photos = getUserPhotos(user.id)
      const weeks: PhotoWeek[] = []
      photos.forEach((photo) => {
        const week = weeks.find((week) => week.year === photo.year && week.week === photo.week)
        if (week) {
          week.photos.push(photo)
        } else {
          weeks.push({
            id: `${photo.year}-${photo.week}`,
            startDate: getWeekStart(photo.year, photo.week),
            endDate: getWeekEnd(photo.year, photo.week),
            year: photo.year,
            week: photo.week,
            photos: [photo]
          })
        }
      })
      setPhotoWeeks(weeks)
    })
  }, [])

  // Handle tab change from tab press
  const handleTabPress = (index: number) => {
    setActiveTab(index)
    scrollViewRef.current?.scrollTo({ x: width * index, animated: true })
  }

  // Handle scroll event to update active tab
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x
    const tabIndex = Math.round(contentOffsetX / width)
    if (activeTab !== tabIndex) {
      setActiveTab(tabIndex)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatWeekRange = (start: Date, end: Date) => {
    return `${formatDate(start)} to ${formatDate(end)}`
  }

  // region weekly post tab
  const renderWeekSection: ListRenderItem<any> = ({ item }) => {
    return (
      <View style={styles.weekContainer}>
        <View style={styles.weekHeader}>
          <View style={styles.weekDateContainer}>
            <MaterialCommunityIcons name="calendar-week" size={18} color="#007AFF" />
            <Themed.Text style={styles.weekTitle}>{formatWeekRange(item.startDate, item.endDate)}</Themed.Text>
          </View>
          {false && (
            <TouchableOpacity style={styles.memoryButton}>
              <Text style={styles.memoryButtonText}>Create Memory</Text>
              <Feather name="film" size={14} color="#007AFF" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photosScrollView}
          decelerationRate="fast"
          snapToInterval={photoCardWidth + photoMargin}
          snapToAlignment="start"
        >
          {item.photos.map((photo: PhotoPreview) => (
            <TouchableOpacity key={photo.id} style={styles.photoCard} activeOpacity={0.9}>
              <Image source={{ uri: photo.url }} style={styles.photoImage} />

              {(photo.caption || photo.location) && (
                <View style={styles.photoInfo}>
                  {photo.location && (
                    <View style={styles.locationContainer}>
                      <Feather name="map-pin" size={12} color="#dfe6e9" />
                      <Text style={styles.locationText}>{photo.location}</Text>
                    </View>
                  )}
                  {photo.caption && (
                    <Text style={styles.captionText} numberOfLines={2}>
                      {photo.caption}
                    </Text>
                  )}
                </View>
              )}

              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.photoGradient} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    )
  }
  // #endregion

  // #region album tab
  const renderAlbum: ListRenderItem<Album> = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.gridAlbumItem}
        activeOpacity={1}
        onPress={() => router.push({ pathname: '/screens/AlbumScreen', params: { albumId: item.id } })}
      >
        <View style={styles.albumCoverContainer}>
          <AlbumCover
            coverImage={item.coverImage}
            isShared={item.isShared}
            contributors={item.contributors}
            style={{ width: '100%', height: '100%' }}
            placeholderStyle={{ width: '100%', height: '100%' }}
          />
        </View>
        <Themed.Text style={{ fontSize: 15, fontWeight: '500', marginTop: 8 }} numberOfLines={1}>
          {item.name}
        </Themed.Text>
        <Themed.Text style={{ fontSize: 13, marginTop: 2 }} text50>
          {item.images.length} photos
        </Themed.Text>
      </TouchableOpacity>
    )
  }

  const renderNoAlbum = () => (
    <Form.Section style={{ marginHorizontal: -16 }}>
      <ContentUnavailable
        title="No Albums"
        systemImage="photo.stack"
        actions={
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(modal)/CreateAlbumModal')}>
            <Themed.Text type="link">Create new album</Themed.Text>
          </TouchableOpacity>
        }
      />
    </Form.Section>
  )

  // #endregion

  // #region save profile changes
  const handleSave = () => {
    if (firstName.trim() === '') setFirstName(user.name.split(' ')[0])
    if (lastName.trim() === '') setLastName(user.name.split(' ')[1])
    if (userName.trim() === '') setUserName(user.username)

    if (firstName.trim() !== '' && lastName.trim() !== '' && userName.trim() !== '') {
      const name = `${firstName} ${lastName}`

      session.apiWithToken
        .post('/user/profile/edit', {
          name: name,
          username: userName,
          bio: bio.trim()
        })
        .catch((error) => {
          console.error('Error updating profile:', error)
          Alert.alert('Error', 'Failed to update profile. Please try again later.')
        })

      updateName(name)

      setUserName(userName)
      updateUsername(userName)

      updateBio(bio.trim())
    }

    Keyboard.dismiss()
    bottomSheetModalRef.current?.close()
  }
  // #endregion

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/settingscreen/SettingScreen')}>
              <IconSymbol name="gearshape" color={colors.text} size={26} />
            </TouchableOpacity>
          )
        }}
      />
      <Themed.ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={{ paddingHorizontal: 20 }}>
            <View style={styles.profileImageSection}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(modal)/ProfileAvatar')}>
                <Themed.View style={styles.profileImageWrapper} lightColor="#E6E6E6" darkColor="#4D4D4D">
                  {user.iconUrl ? (
                    <Image
                      source={{ uri: user.iconUrl }}
                      style={[styles.profileImage, { borderColor: colors.borderColor }]}
                    />
                  ) : (
                    <View
                      style={[
                        styles.profileImage,
                        { borderColor: colors.borderColor, justifyContent: 'center', alignItems: 'center' }
                      ]}
                    >
                      <IconSymbol name="person.fill" color={colors.gray} size={36} />
                    </View>
                  )}
                </Themed.View>
              </TouchableOpacity>
              <Themed.View style={styles.postCountBadge} shadow>
                <Text style={styles.postCountText}>{photoCount}</Text>
                <Text style={styles.postLabel}>Photos</Text>
              </Themed.View>
            </View>

            <View style={styles.profileInfo}>
              <Themed.Text style={styles.nameText}>{user.name}</Themed.Text>
              <Themed.Text style={styles.usernameText} text70>
                @{user.username}
              </Themed.Text>
              {user.bio !== '' && <Themed.Text style={styles.bioText}>{user.bio}</Themed.Text>}
            </View>
          </View>

          <View style={styles.profileActions}>
            <View style={{ flex: 1 }}>
              <TouchableBounce
                style={[
                  styles.editButton,
                  { borderColor: colors.borderColor, backgroundColor: colors.background, shadowColor: colors.text }
                ]}
                onPress={() => bottomSheetModalRef.current?.present()}
              >
                <Feather name="edit-2" size={16} color="#007AFF" />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableBounce>
            </View>
            <View style={{ flex: 0.5 }}>
              <TouchableBounce
                style={[
                  styles.shareButton,
                  { borderColor: colors.borderColor, backgroundColor: colors.background, shadowColor: colors.text }
                ]}
              >
                <Feather name="share" size={16} color={colors.text} />
                <Themed.Text style={styles.shareButtonText}>Share</Themed.Text>
              </TouchableBounce>
            </View>
          </View>
        </View>

        {/* Instagram-style Tabs Section */}
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 0 && styles.activeTabButton]}
            onPress={() => handleTabPress(0)}
          >
            <Feather name="grid" size={20} color={activeTab === 0 ? '#007AFF' : '#999'} />
            <Themed.Text style={[styles.tabText, activeTab === 0 && styles.activeTabText]}>Photos</Themed.Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 1 && styles.activeTabButton]}
            onPress={() => handleTabPress(1)}
          >
            <Feather name="folder" size={20} color={activeTab === 1 ? '#007AFF' : '#999'} />
            <Themed.Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>Albums</Themed.Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal swipeable content */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          style={styles.tabContentContainer}
        >
          {/* Photos Tab */}
          <View style={[styles.tabPage, { width }]}>
            <View style={styles.photosSection}>
              <FlatList
                data={photoWeeks}
                renderItem={renderWeekSection}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          </View>

          {/* Albums Tab */}
          <View style={[styles.tabPage, { width }]}>
            <View style={styles.albumsSection}>
              <FlatList
                data={albumList}
                renderItem={renderAlbum}
                ListEmptyComponent={renderNoAlbum}
                keyExtractor={(item) => item.id}
                numColumns={2}
                scrollEnabled={false}
                columnWrapperStyle={styles.albumsColumnWrapper}
              />
            </View>
          </View>
        </ScrollView>
      </Themed.ScrollView>
      <BottomSheetModal
        index={1}
        ref={bottomSheetModalRef}
        snapPoints={['80%']}
        handleComponent={BlurredHandle}
        backgroundComponent={BlurredBackground}
        backdropComponent={() => (
          <View
            onTouchEnd={() => {
              Keyboard.dismiss()
              bottomSheetModalRef.current?.close()
            }}
            style={[StyleSheet.absoluteFill]}
          />
        )}
      >
        <BottomSheetView style={{ flex: 1, padding: 16 }}>
          <TouchableOpacity
            style={{ position: 'absolute', padding: 2, right: 14 }}
            activeOpacity={0.7}
            onPress={handleSave}
          >
            <Themed.Text type="headerButton" state={true}>
              Save
            </Themed.Text>
          </TouchableOpacity>
          <View style={styles.nameRow}>
            <View style={{ flex: 0.48 }}>
              <Themed.TextInput label="First Name" value={firstName} onChangeText={setFirstName} />
            </View>

            <View style={{ flex: 0.48 }}>
              <Themed.TextInput label="Last Name" value={lastName} onChangeText={setLastName} />
            </View>
          </View>

          <View>
            <Themed.TextInput
              label="Username"
              value={userName}
              onChangeText={setUserName}
              placeholder="Username"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoFocus
            />
          </View>

          <View>
            <Themed.TextInput
              label="Bio"
              value={bio}
              style={{ height: 100, padding: 16 }}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor="#999"
              multiline={true}
              maxLength={100}
              numberOfLines={3}
              onBlur={() => setBio(bio.trim())}
            />
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  )
}

const styles = StyleSheet.create({
  profileHeader: {
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomRightRadius: 30
  },
  profileImageSection: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 16
  },
  profileImageWrapper: {
    padding: 3,
    borderRadius: 55
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2
  },
  postCountBadge: {
    position: 'absolute',
    right: width / 2 - 90,
    top: 10,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center'
  },
  postCountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF'
  },
  postLabel: {
    fontSize: 10,
    color: '#007AFF'
  },
  gridAlbumItem: {
    flex: 1,
    margin: 4,
    marginBottom: 16
  },
  albumCoverContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    aspectRatio: 1
  },
  profileInfo: {
    alignItems: 'center'
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4
  },
  usernameText: {
    fontSize: 14,
    marginBottom: 8
  },
  bioText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
    paddingHorizontal: 20
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
    borderWidth: 1
  },
  editButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
    borderWidth: 1
  },
  shareButtonText: {
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTabButton: {
    borderBottomColor: '#007AFF'
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600'
  },
  // Tab content container
  tabContentContainer: {
    flexGrow: 0,
    flexShrink: 0
  },
  tabPage: {
    flex: 1
  },
  photosSection: {
    paddingVertical: 10,
    paddingBottom: 30
  },
  albumsSection: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    paddingBottom: 30
  },
  albumsColumnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 15
  },
  albumCard: {
    width: albumCardSize,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  albumCover: {
    width: '100%',
    height: albumCardSize,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12
  },
  albumInfo: {
    padding: 12
  },
  albumTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4
  },
  albumCount: {
    fontSize: 12,
    color: '#666'
  },
  weekContainer: {
    marginBottom: 30
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15
  },
  weekDateContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  },
  memoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15
  },
  memoryButtonText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    marginRight: 6
  },
  photosScrollView: {
    paddingLeft: 20,
    paddingRight: 10
  },
  photoCard: {
    width: photoCardWidth,
    height: photoCardWidth * 0.75,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: photoMargin,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20
  },
  photoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  },
  photoInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    zIndex: 1
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5
  },
  locationText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4
  },
  captionText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '400'
  },
  nameRow: {
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
})

export default ProfileScreen
