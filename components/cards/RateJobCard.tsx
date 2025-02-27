/**
 * This component is used to display a job card in the RateScreen
 */
import React from 'react'
import { useRouter } from 'expo-router'
import { View, Image, StyleSheet } from 'react-native'
import ShimmerPlaceholder from 'react-native-shimmer-placeholder'
import { Ionicons } from '@expo/vector-icons'

import Themed from '../themed/Themed'
import Bounceable from '../Bounceable'

interface JobCardProps {
  index: number
  loading?: boolean
  title: string
  companyName: string
  isVerified?: boolean
  disableTouch?: boolean
  companyLocation: string
  date: string
  tags: string[]
  price: string
  priceType: string
}

const JobItem = ({
  index,
  loading,
  title,
  companyName,
  isVerified,
  companyLocation,
  date,
  tags,
  price,
  priceType,
  disableTouch = false
}: JobCardProps) => {
  const router = useRouter()

  const displayedTags = tags.length <= 3 ? tags : [...tags.slice(0, 2), `+${tags.length - 2}`]

  return (
    <Bounceable
      onPress={() => {
        if (disableTouch) return
        router.push('/screens/JobDetailScreen')
      }}
      disabled
    >
      <Themed.View key={index} style={styles.card} type="secondary">
        {/* Main Row: Image, Title, Tags, Location, Price */}
        <View style={styles.mainRow}>
          <ShimmerPlaceholder width={60} height={60} shimmerStyle={{ borderRadius: 5 }} visible={!loading}>
            <Image source={{ uri: 'https://picsum.photos/300/300' }} style={styles.cardImage} />
          </ShimmerPlaceholder>

          <Themed.View style={styles.contentContainer} type="secondary">
            <ShimmerPlaceholder
              contentStyle={{ flexDirection: 'row', alignItems: 'center' }}
              width={160}
              height={20}
              visible={!loading}
            >
              <Themed.Text style={styles.cardTitle}>{title}</Themed.Text>
              {isVerified && <Ionicons name="checkmark-circle" size={16} color="#4CAF50" style={styles.verifiedIcon} />}
            </ShimmerPlaceholder>

            <Themed.View style={styles.tagsContainer} type="secondary">
              {displayedTags.map((tag, idx) => (
                <Themed.View key={idx} style={styles.tag}>
                  <Themed.Text style={styles.tagText}>{tag}</Themed.Text>
                </Themed.View>
              ))}
            </Themed.View>
            <View style={styles.locationPriceRow}>
              <View style={styles.locationContainer}>
                <Ionicons name="location-sharp" size={16} color="#000" style={styles.locationIcon} />
                <Themed.Text style={styles.locationText}>{companyLocation}</Themed.Text>
              </View>
              <Themed.Text style={styles.priceText}>{price}</Themed.Text>
            </View>
          </Themed.View>
        </View>
      </Themed.View>
    </Bounceable>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'column',
    padding: 16,
    borderRadius: 5,
    marginVertical: 0,
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    minHeight: 100,
    backgroundColor: 'white'
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 5
  },
  contentContainer: {
    flexShrink: 1,
    marginLeft: 12,
    flex: 1,
    backgroundColor: 'white'
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333'
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 4,
    backgroundColor: 'white'
  },
  tag: {
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4
  },
  tagText: {
    fontSize: 12,
    color: '#00796B'
  },

  verifiedIcon: {
    marginLeft: 4
  },
  locationPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  locationIcon: {
    marginRight: 4
  },
  priceText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4A90E2'
  },
  locationText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#012222'
  }
})

export default JobItem
