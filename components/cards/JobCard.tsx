import { useRouter } from 'expo-router'
import { View, Image, StyleSheet } from 'react-native'
import ShimmerPlaceholder from 'react-native-shimmer-placeholder'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks'
import Themed from '../themed/Themed'
import Bounceable from '../Bounceable'
import { JobResponse } from '@/types/job.type'
import { useTranslation } from 'react-i18next'
import { formatTag, getPriceText } from '@/utils'

interface JobCardProps {
  job: JobResponse
  loading?: boolean
}

const JobCard = ({ job, loading }: JobCardProps) => {
  const router = useRouter()
  const { colors } = useTheme()
  const { t } = useTranslation()

  const displayedTags = job.tags.length <= 3 ? job.tags : [...job.tags.slice(0, 2), `+${job.tags.length - 2}`]

  return (
    <Bounceable
      onPress={() => {
        router.push({ pathname: '/screens/JobDetailScreen', params: { detail: JSON.stringify(job) } })
      }}
    >
      <Themed.View style={[styles.card, { shadowColor: colors.text }]} type="secondary">
        {/* Main Row: Image, Title, Tags */}
        <View style={styles.mainRow}>
          <ShimmerPlaceholder width={60} height={60} shimmerStyle={{ borderRadius: 30 }} visible={!loading}>
            {job.employer.iconUrl && job.employer.iconUrl !== '' ? (
              <Image source={{ uri: job.employer.iconUrl }} style={styles.cardImage} />
            ) : (
              <Ionicons name="person" size={styles.cardImage.width} color={colors.gray} />
            )}
          </ShimmerPlaceholder>

          <Themed.View style={styles.contentContainer} type="secondary">
            <ShimmerPlaceholder width={160} height={20} visible={!loading}>
              <Themed.Text style={styles.cardTitle}>{job.title}</Themed.Text>
            </ShimmerPlaceholder>

            <Themed.View style={styles.tagsContainer} type="secondary">
              {displayedTags.map((tag, idx) => (
                <Themed.View key={idx} style={styles.tag}>
                  <Themed.Text style={styles.tagText}>{formatTag(t, tag)}</Themed.Text>
                </Themed.View>
              ))}
            </Themed.View>
          </Themed.View>
        </View>

        <Themed.View type="divider" style={{ marginVertical: 10 }} />

        {/* Company, date, salary */}
        <Themed.View style={styles.footerContainer} type="secondary">
          <ShimmerPlaceholder width={120} height={15} visible={!loading}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Themed.Text style={[styles.companyName, { fontWeight: '700' }]}>
                {job.employer.companyName || job.employer.realName.firstName + ' ' + job.employer.realName.lastName}
              </Themed.Text>
              {job.employer.realNameVerified && (
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" style={styles.verifiedIcon} />
              )}
            </View>
            <Themed.Text style={[styles.companyName, { fontSize: 12, color: 'grey' }]}>
              posted on {job.createdAt.split('T')[0]}
            </Themed.Text>
          </ShimmerPlaceholder>

          <Themed.Text style={styles.priceText}>{getPriceText(job)}</Themed.Text>
        </Themed.View>
      </Themed.View>
    </Bounceable>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    marginVertical: 8,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 30
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600'
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginTop: 6,
    backgroundColor: '#007AFF22',
    borderColor: '#007AFF',
    borderWidth: StyleSheet.hairlineWidth
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500'
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  companyName: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 4
  },
  verifiedIcon: {
    marginLeft: 4
  },
  priceText: {
    marginLeft: 'auto',
    fontSize: 20,
    fontWeight: '800',
    color: '#4A90E2'
  }
})

export default JobCard
