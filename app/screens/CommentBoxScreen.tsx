/**
 * This is the comment box screen, where users can leave a comment here.
 */
import React, { useState } from 'react'
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  KeyboardAvoidingView,
  Text
} from 'react-native'
import Themed from '@/components/themed/Themed'
import { Stack, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants'
const screenHeight = Dimensions.get('window').height
const MAX_HEIGHT = screenHeight * 0.5 // Half of the screen
const CommentBox = () => {
  const router = useRouter()
  const theme = useColorScheme() === 'dark' ? Colors.dark : Colors.light
  // Start with 200px height; allow expansion up to MAX_HEIGHT
  const [boxHeight, setBoxHeight] = useState(200)
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
  return (
    <Themed.ScrollView>
      <Stack.Screen
        options={{
          headerTitle: 'Rate Us',
          headerLargeTitle: false,
          headerBackTitle: '',
          headerBackButtonDisplayMode: 'minimal'
        }}
      />
      <KeyboardAvoidingView
        style={[styles.commentBox, { height: boxHeight }]}
        behavior="padding"
        keyboardVerticalOffset={100}
      >
        {/* Reserve the top 70% for the user to type text */}
        <View style={styles.textContainer}>
          <TextInput
            autoFocus
            placeholder="Add a comment..."
            multiline
            value={comment}
            onChangeText={setComment}
            style={styles.input}
            onContentSizeChange={handleContentSizeChange}
          />
        </View>
        {/* Keep the icon at the bottom left */}
        <View style={styles.iconContainer}>
          <Ionicons name="add-outline" size={28} color="#000" />
        </View>
      </KeyboardAvoidingView>
    </Themed.ScrollView>
  )
}
const styles = StyleSheet.create({
  commentBox: {
    flex: 1,
    width: '95%',
    alignSelf: 'center',
    backgroundColor: '#e1e1e1',
    borderRadius: 20,
    marginTop: 10,
    position: 'relative'
    // Height is controlled by state
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
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  }
})
export default CommentBox
