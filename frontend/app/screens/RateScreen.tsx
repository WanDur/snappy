/**
 * RateScreen.tsx
 * The screen where the user can rate the app and submit the rating.
 * An in-app rating prompt is shown when the user navigates to this screen.
 */

import React, { useState, useRef, useCallback } from 'react'
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Button,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Stack, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import JobItem from '@/components/cards/RateJobCard'
import { Colors } from '@/constants'
import { Bounceable, SettingsGroup, Themed } from '@/components'
import { ScrollView } from 'react-native-gesture-handler'
import * as ImagePicker from 'expo-image-picker'
import SelectedFileAnimation from '@/components/SelectedFileAnimation'

const jobs = [
  {
    id: 1,
    title: 'Frontend, Backend Develop',
    companyName: 'Tech Corp',
    isVerified: true,
    date: '2024.11.24',
    tags: ['React Native', 'JavaScript', 'Full-Time'],
    companyLocation: 'Huangpu, Shanghai',
    price: '$1314',
    priceType: 'Hourly'
  }
]

const options = [
  { label: 'Quality', value: 'The quality is excellent.' },
  { label: 'Price', value: 'The price is reasonable.' },
  { label: 'Durability', value: 'The durability is outstanding.' },
  { label: 'Design', value: 'The design is sleek and modern.' },
  { label: 'Functionality', value: 'The functionality meets my needs.' }
]

const screenHeight = Dimensions.get('window').height
const MAX_HEIGHT = screenHeight * 0.5 // Half of the screen

const RateScreen = () => {
  const testRef = useRef(null) as any
  const router = useRouter()
  const theme = useColorScheme() === 'dark' ? Colors.dark : Colors.light
  const [showRatingPrompt, setShowRatingPrompt] = useState(true)
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [isToggled, setIsToggled] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string[] | null>(null)
  const [loadingImage, setLoadingImage] = useState(false)
  const [toggles, setToggles] = useState<boolean[]>(Array(options.length).fill(false))

  const handleAreaPress = (option: string, index: number) => {
    const newToggles = [...toggles]
    newToggles[index] = !newToggles[index]
    setToggles(newToggles)

    if (newToggles[index]) {
      // If toggled on, append the line if it doesn't already exist
      if (!comment.includes(option)) {
        setComment((prev) => (prev ? `${prev}\n${option}` : option))
      }
    } else {
      // If toggled off, remove that line
      setComment((prev) => {
        const lines = prev.split('\n')
        return lines.filter((line) => line.trim() !== option.trim()).join('\n')
      })
    }
  }

  // Start with 200px height; allow expansion up to MAX_HEIGHT
  const [boxHeight, setBoxHeight] = useState(250)
  const [comment, setComment] = useState('')
  // Expand the box when the used text space exceeds 60% of the current text area (70% of the box)
  const handleContentSizeChange = (event: any) => {
    const usedSpace = Math.floor(event.nativeEvent.contentSize.height)
    const textAreaHeight = boxHeight * 0.7
    // If the used space in the text input is >= 60% of textAreaHeight, expand
    if (usedSpace >= 0.6 * textAreaHeight && boxHeight < MAX_HEIGHT) {
      const newHeight = boxHeight + 20
      setBoxHeight(Math.min(newHeight, MAX_HEIGHT))
    }
  }

  const handleCameraCapture = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync()
    if (!permissionResult.granted) {
      alert('Permission to access camera is required!')
      return
    }
    const cameraResult = await ImagePicker.launchCameraAsync()
    if (!cameraResult.canceled && cameraResult.assets && cameraResult.assets.length > 0) {
      setSelectedImage([cameraResult.assets[0].uri])
      // onSendMessage(cameraResult.assets[0].uri, 'image')
    }
  }

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permissionResult.granted) {
      alert('Permission to access media library is required!')
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 400))
    setLoadingImage(true)
    const pickerResult = await ImagePicker.launchImageLibraryAsync({ allowsMultipleSelection: true })
    setLoadingImage(false)

    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      const uris = pickerResult.assets.map((asset) => asset.uri)
      setSelectedImage(uris)
    }
  }

  const ImagePreview = useCallback(() => {
    if (loadingImage) {
      return (
        <View
          style={{
            width: 58,
            height: 60,
            position: 'absolute',
            justifyContent: 'center'
          }}
        >
          <ActivityIndicator size="small" color="#000" />
        </View>
      )
    } else if (selectedImage) {
      // TODO add relevant image data
      const imageData = selectedImage.map((uri, index) => ({
        key: index.toString(),
        attachment: {
          url: uri,
          name: '',
          type: 'image/jpeg'
        }
      }))
      return (
        <View style={{ marginBottom: 170, position: 'absolute', zIndex: 100, bottom: 50 }}>
          <SelectedFileAnimation data={imageData} isLoading={loadingImage} />
        </View>
      )
    }
  }, [selectedImage, loadingImage])

  const clearSelectedImage = () => {
    setSelectedImage(null)
  }

  const handleFinish = () => {
    // Implement the finish functionality here
    // For example, submit the comments and ratings
    console.log('Finish button pressed')
  }

  function toggleOption(index: number) {
    setToggles((prev) => {
      const copy = [...prev]
      copy[index] = !copy[index]
      return copy
    })
  }
  //
  return (
    <View>
      <Stack.Screen
        options={{
          headerTitle: 'Rate Us',
          headerLargeTitle: false,
          headerBackTitle: 'Profile',
          headerRight: () => (
            <TouchableOpacity onPress={handleFinish} activeOpacity={0.7}>
              <Text style={{ fontSize: 16 }}>Done</Text>
            </TouchableOpacity>
          )
        }}
      />
      {jobs.map((job, index) => (
        <JobItem key={job.id} {...job} index={index} loading={false} disableTouch={true} />
      ))}
      <KeyboardAwareScrollView
        ref={testRef}
        scrollEventThrottle={16}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <SettingsGroup.Custom containerStyle={[styles.customContainer, { paddingVertical: 10 }]}>
          <View style={{ marginVertical: 0, alignItems: 'center' }}>
            <Themed.Text style={{ fontSize: 20, fontWeight: 'bold' }}>How would you rate this service?</Themed.Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {[1, 2, 3, 4, 5].map((star) => {
                if (useColorScheme() === 'dark') {
                  star <= rating ? 'blue' : 'gray'
                } else {
                  star <= rating ? 'blue' : 'gray'
                }
                const labels = ['Awful', 'Bad', 'Normal', 'Good', 'Excellent']
                const label = labels[star - 1]

                return (
                  <TouchableOpacity
                    key={star}
                    onPress={() => {
                      console.log('Pressed star:', star)
                      setRating(star)
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                      <Themed.Text style={{ fontSize: 50, marginHorizontal: 8 }}>
                        {star <= rating ? '★' : '☆'}
                      </Themed.Text>
                      <Themed.Text style={{ fontSize: 16 }}>{label}</Themed.Text>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        </SettingsGroup.Custom>

        <View style={[styles.commentBox, { height: boxHeight }]}>
          {/* Reserve the top 70% for the user to type text */}
          <View style={styles.textContainer}>
            <TextInput
              placeholder="Add a comment..."
              multiline
              value={comment}
              onChangeText={setComment}
              style={styles.input}
              onContentSizeChange={handleContentSizeChange}
              // TODO: dynamic scroll later
              onFocus={() => {
                if (testRef.current) {
                  testRef.current.scrollToPosition(0, 100, true)
                }
              }}
            />
          </View>
          {/* Keep the icon at the bottom left */}
          <View style={{ flexDirection: 'row' }}>
            {selectedImage ? (
              <TouchableOpacity style={{ borderRadius: 12 }} onPress={clearSelectedImage} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={30} color="red" />
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity style={styles.iconContainer} onPress={handleCameraCapture}>
                  <Ionicons name="camera" size={28} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.iconContainer, { marginLeft: 6 }]} onPress={handleImagePick}>
                  <Ionicons name="albums" size={28} color="#000" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
        <ImagePreview />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: 12,
            paddingHorizontal: 20,
            paddingVertical: 0,
            borderRadius: 10,
            backgroundColor: '#f0f0f0',
            marginVertical: 10
          }}
        >
          <View style={styles.optionsContainer}>
            <View
              style={[
                styles.eButton,
                {
                  backgroundColor: '#21504b',
                  alignItems: 'center',
                  justifyContent: 'center'
                }
              ]}
            >
              <Text style={styles.ButtonText}>AutoComment</Text>
            </View>
            {options.map((option, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.eButton, { backgroundColor: toggles[i] ? '#bceee8' : '#00796B' }]}
                onPress={() => {
                  handleAreaPress(option.value, i)
                }}
              >
                <Text style={[styles.ButtonText]}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <TouchableOpacity style={[styles.orderbutton]} onPress={() => router.push('/screens/OrderIssueScreen')}>
          <Text style={styles.ButtonText}>Any problem with the order?</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  customContainer: {
    marginTop: 10, // Adjust the value as needed for spacing
    borderRadius: 20,
    overflow: 'hidden', // Ensure borderRadius is applied properly
    width: '95%',
    alignSelf: 'center'
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginVertical: 5,
    marginLeft: 0
    //backgroundColor: 'themed.background'
  },
  eButton: {
    alignSelf: 'flex-start',
    marginRight: 10, // spacing between buttons
    marginBottom: 20, // spacing between rows
    backgroundColor: '#D1D1D1',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  ButtonText: {
    fontWeight: '700',
    color: '#FFFFFF',
    fontSize: 10
  },
  commentBox: {
    width: '95%',
    alignSelf: 'center',
    backgroundColor: '#e1e1e1',
    borderRadius: 20,
    marginTop: 10,
    position: 'relative'
    // Height is controlled by state
  },
  commentText: {
    textAlign: 'left',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 15
  },
  commentIcon: {
    position: 'absolute',
    bottom: 10,
    left: 15
  },
  textContainer: {
    flex: 1,
    height: 'auto',
    overflow: 'hidden',
    padding: 10
  },
  input: {
    textAlignVertical: 'top',
    height: '75%'
  },
  iconContainer: {
    bottom: 10,
    left: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  orderbutton: {
    marginTop: 15,
    backgroundColor: '#FF9800',
    width: '60%',
    alignSelf: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: 'center', // Center horizontally
    justifyContent: 'center' // Center vertically
    // Shadow properties removed
  },
  finishButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center'
    // Add any additional styling if needed
  }
})

export default RateScreen
