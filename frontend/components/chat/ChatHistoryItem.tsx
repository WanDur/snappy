import { View, TouchableOpacity, Text, StyleSheet, Touchable } from 'react-native'
import { Feather } from '@expo/vector-icons'

import { type ChatHistoryItemActionProps } from '.'

function formatCreatedTime(timestamp: number) {
  const now = new Date()
  const date = new Date(timestamp)

  const timeDifference = now.getTime() - timestamp
  const oneDay = 24 * 60 * 60 * 1000

  // Check if the date is today
  if (date.toDateString() === now.toDateString()) {
    return 'Today'
  }

  // Check if the date was yesterday
  const yesterday = new Date(now.getTime() - oneDay)
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }

  // If more than 1 day ago but within the last 10 days, show X days ago
  if (timeDifference < 10 * oneDay) {
    const daysAgo = Math.floor(timeDifference / oneDay)
    return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`
  }

  // For dates older than 10 days, show the date
  const dayOfMonth = date.getDate()
  const month = date.toLocaleString('default', { month: 'long' })
  const year = date.getFullYear()
  return `${dayOfMonth} ${month} ${year}`
}

export const ChatHistoryItem = ({ id, createdAt, title, onSelect, onEdit, onDelete }: ChatHistoryItemActionProps) => {
  return (
    <TouchableOpacity
      style={styles.chatItem}
      activeOpacity={0.7}
      onPress={() => {
        onSelect(id)
      }}
    >
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title ? title.replace(/["']/g, '') : 'Chat'}</Text>
        <Text style={styles.date}>Created: {formatCreatedTime(parseInt(createdAt))}</Text>
      </View>
      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={() => {
          onEdit(id)
        }}
      >
        <Feather name="edit-2" size={20} color="#007AFF" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={() => {
          onDelete(id)
        }}
      >
        <Feather name="trash-2" size={20} color="#007AFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 10
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333'
  },
  date: {
    color: '#999',
    fontSize: 14,
    marginTop: 4
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8
  }
})

export default ChatHistoryItem
