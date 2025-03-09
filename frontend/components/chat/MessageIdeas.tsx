import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'

import { MetaData, MessageType } from '.'

interface MessageIdeasProps {
  onSelectCard: (message: string, type: MessageType, metaData?: MetaData) => void
}

const predefinedMessages = [
  { title: 'Explain Physics', text: 'like I am 5' },
  { title: 'Tell me a joke', text: 'about a tree and a bike' },
  { title: 'Recommend a movie', text: 'like a thriller' }
]

const MessageIdeas = ({ onSelectCard }: MessageIdeasProps) => {
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10, gap: 16 }}
      >
        {predefinedMessages.map((message, index) => (
          <View key={index} style={styles.card}>
            <TouchableOpacity
              key={index}
              onPress={() => {
                onSelectCard(`${message.title} ${message.text}`, 'text')
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: 500 }}>{message.title}</Text>
              <Text style={{ fontSize: 14, color: 'grey' }}>{message.text}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#EEE9F0',
    padding: 14,
    borderRadius: 10
  }
})

export default MessageIdeas
