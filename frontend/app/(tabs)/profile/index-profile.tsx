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
  Alert
} from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'

import { Themed, TouchableBounce } from '@/components'
import { Stack } from '@/components/router-form'
import { BlurredHandle, BlurredBackground } from '@/components/bottomsheetUI'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useTheme, useUserStore } from '@/hooks'
import { isAuthenticated, parsePublicUrl, useSession } from '@/contexts/auth'

const generateMockPhotos = () => {
  const weeks = []
  const currentDate = new Date()

  for (let i = 0; i < 6; i++) {
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
        uri: `https://via.placeholder.com/${width}x${height}`,
        caption: j % 3 === 0 ? 'Enjoying the weekend vibes! #photography' : '',
        location: j % 4 === 0 ? 'Golden Gate Park' : '',
        date: new Date(weekStart.getTime() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000))
      })
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

const photosByWeek = generateMockPhotos()

const { width } = Dimensions.get('window')
const photoCardWidth = width * 0.75
const photoMargin = 12

const ProfileScreen = () => {
  const router = useRouter()
  const session = useSession()
  const { user, setUser, updateName, updateUsername, updateBio, updateAvatar } = useUserStore()
  const { colors } = useTheme()

  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const [selectedTag, setSelectedTag] = useState('All')
  const [firstName, setFirstName] = useState(user.name.split(' ')[0])
  const [lastName, setLastName] = useState(user.name.split(' ')[1])
  const [userName, setUserName] = useState(user.username)
  const [bio, setBio] = useState(user.bio)
  const [photoCount, setPhotoCount] = useState(0)
  const [lastLocation, setLastLocation] = useState('')

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
              setLastLocation(userData.lastLocation)
              console.log('Icon url:', iconUrl)
              console.log('User data fetched and stored in userStore:', userData)
            })
    }
  }

  useEffect(() => {
    if (!isAuthenticated(session)) {
      router.replace('/(auth)/LoginScreen');
      return
    }

    fetchProfileData()

  }, [])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatWeekRange = (start: Date, end: Date) => {
    return `${formatDate(start)} to ${formatDate(end)}`
  }

  const renderWeekSection = ({ item }) => {
    // Filter photos if a tag is selected (mock filtering based on index)
    const filteredPhotos = selectedTag === 'All' ? item.photos : item.photos.filter((_, index) => index % 3 === 0)

    if (filteredPhotos.length === 0) return null

    return (
      <View style={styles.weekContainer}>
        <View style={styles.weekHeader}>
          <View style={styles.weekDateContainer}>
            <MaterialCommunityIcons name="calendar-week" size={18} color="#6c5ce7" />
            <Themed.Text style={styles.weekTitle}>{formatWeekRange(item.startDate, item.endDate)}</Themed.Text>
          </View>
          <TouchableOpacity style={styles.memoryButton}>
            <Text style={styles.memoryButtonText}>Create Memory</Text>
            <Feather name="film" size={14} color="#6c5ce7" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photosScrollView}
          decelerationRate="fast"
          snapToInterval={photoCardWidth + photoMargin}
          snapToAlignment="start"
        >
          {filteredPhotos.map((photo) => (
            <TouchableOpacity key={photo.id} style={styles.photoCard} activeOpacity={0.9}>
              <Image source={{ uri: photo.uri }} style={styles.photoImage} />

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

  // #region save profile changes
  const handleSave = () => {
    if (firstName.trim() === '') setFirstName(user.name.split(' ')[0])
    if (lastName.trim() === '') setLastName(user.name.split(' ')[1])
    if (userName.trim() === '') setUserName(user.username)

    if (firstName.trim() !== '' && lastName.trim() !== '' && userName.trim() !== '') {
      const name = `${firstName} ${lastName}`
      updateName(name)

      const username = userName.startsWith('@') ? userName : `@${userName}`
      setUserName(username)
      updateUsername(username)

      updateBio(bio.trim())

      session.apiWithToken.post('/user/profile/edit', {
        name: name,
        username: username,
        bio: bio.trim()
      }).catch((error) => {
        console.error('Error updating profile:', error)
        Alert.alert('Error', 'Failed to update profile. Please try again later.')
      })
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
                  <Image
                    source={{ uri: user.iconUrl }}
                    style={[styles.profileImage, { borderColor: colors.borderColor }]}
                  />
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
                {user.username}
              </Themed.Text>
              <View style={styles.locationRow}>
                <Feather name="map-pin" size={14} color="#fff" />
                <Themed.Text style={styles.locationText}>{lastLocation}</Themed.Text>
              </View>
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
                <Feather name="edit-2" size={16} color="#6c5ce7" />
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

        {/* Tags Section */}
        <View style={styles.tagsSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsScrollView}>
            <TouchableOpacity
              style={[styles.tagButton, selectedTag === 'All' && styles.activeTagButton]}
              onPress={() => setSelectedTag('All')}
            >
              <Text style={[styles.tagText, selectedTag === 'All' && styles.activeTagText]}>All</Text>
            </TouchableOpacity>
            {/*userData.tags.map((tag, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.tagButton, selectedTag === tag && styles.activeTagButton]}
                onPress={() => setSelectedTag(tag)}
              >
                <Text style={[styles.tagText, selectedTag === tag && styles.activeTagText]}>{tag}</Text>
              </TouchableOpacity>
            ))*/}
          </ScrollView>
        </View>

        {/* Photos Section */}
        <View style={styles.photosSection}>
          <FlatList
            data={photosByWeek}
            renderItem={renderWeekSection}
            keyExtractor={(item) => item.id}
            scrollEnabled={false} // Prevent scrolling since we're already in a ScrollView
          />
        </View>
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
    color: '#6c5ce7'
  },
  postLabel: {
    fontSize: 10,
    color: '#6c5ce7'
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  locationText: {
    fontSize: 12,
    marginLeft: 6
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
    color: '#6c5ce7',
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
  tagsSection: {
    marginTop: 20,
    marginBottom: 10
  },
  tagsScrollView: {
    paddingHorizontal: 15
  },
  tagButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
    marginRight: 10
  },
  activeTagButton: {
    backgroundColor: '#6c5ce7'
  },
  tagText: {
    color: '#636e72',
    fontWeight: '500'
  },
  activeTagText: {
    color: '#fff'
  },
  photosSection: {
    paddingVertical: 10,
    paddingBottom: 30
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
    color: '#6c5ce7',
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
  captionText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '400'
  },
  nameRow: {
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  nameInput: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16
  }
})

export default ProfileScreen
