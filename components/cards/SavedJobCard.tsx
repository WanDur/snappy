import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeInDown } from 'react-native-reanimated'

import { JobResponse, JobType } from '@/types/job.type'
import Bounceable from '../Bounceable'
import Themed from '../themed/Themed'
import { useTheme } from '@/hooks'
import { getPriceText } from '@/utils'

interface SavedJobCardProps extends JobResponse {
  index: number
  onPressMore: () => void
}

const SavedJobCard = ({ index, onPressMore, ...props }: SavedJobCardProps) => {
  const router = useRouter()
  const { colors } = useTheme()
  const { title, tags } = props as JobResponse

  const renderTags = () => {
    if (tags.length > 3) {
      return (
        <>
          {tags.slice(0, 2).map((tag, idx) => (
            <View style={styles.tagItem} key={idx}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          <View style={styles.tagItem}>
            <Text style={styles.tagText}>+{tags.length - 3}</Text>
          </View>
        </>
      )
    }
    return tags.map((tag, idx) => (
      <View style={styles.tagItem} key={idx}>
        <Text style={styles.tagText}>{tag}</Text>
      </View>
    ))
  }

  return (
    <Bounceable
      onPress={() => {
        router.push({ pathname: '/screens/JobDetailScreen', params: { detail: JSON.stringify(props) } })
      }}
    >
      <Animated.View
        key={props.id}
        style={[styles.card, { backgroundColor: colors.background }]}
        entering={FadeInDown.duration(500).delay(50 * index)}
      >
        <View style={styles.topRow}>
          {props.employer.iconUrl && props.employer.iconUrl !== '' ? (
            <Image source={{ uri: props.employer.iconUrl }} style={styles.logo} />
          ) : (
            <Ionicons name="person" size={styles.logo.width} color={colors.gray} />
          )}

          <View style={{ flex: 1, alignSelf: 'center' }}>
            <Themed.Text style={styles.title}>{title}</Themed.Text>
            <Themed.Text type="grey">
              {props.employer.companyName || props.employer.realName.firstName + props.employer.realName.lastName} •{' '}
              {props.location}
            </Themed.Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onPressMore}
          activeOpacity={0.7}
          style={{ position: 'absolute', right: 0, top: 0, padding: 16 }}
        >
          <Ionicons name="ellipsis-horizontal" size={26} color="#6B7280" />
        </TouchableOpacity>

        <View style={styles.tagsContainer}>{renderTags()}</View>

        <Themed.View style={{ marginBottom: 12 }} type="divider" />

        <View style={styles.bottomRow}>
          <Themed.Text type="grey">posted on {props.createdAt.split('T')[0]}</Themed.Text>
          <Text style={styles.priceText}>{getPriceText(props)}</Text>
        </View>
      </Animated.View>
    </Bounceable>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    // Android shadow
    elevation: 3
  },
  topRow: {
    flexDirection: 'row',
    marginBottom: 12
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4
  },
  location: {
    fontSize: 14,
    color: '#777'
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6
  },
  tagItem: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  tagText: {
    fontSize: 12,
    color: '#374151'
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  priceText: {
    marginLeft: 'auto',
    fontSize: 20,
    fontWeight: '800',
    color: '#4A90E2'
  }
})

export default SavedJobCard
