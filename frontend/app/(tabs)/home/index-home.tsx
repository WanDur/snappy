import { View, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native'
import { BlurView } from 'expo-blur'
import { useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LinearGradient } from 'expo-linear-gradient'

import { useProfileStore, useTheme } from '@/hooks'
import { Themed, SectionHeader, JobCard, Bounceable } from '@/components'
import { Constants } from '@/constants'
// import { useSession } from '@/contexts/auth'
import { formatTag } from '@/utils'
// import { useSync } from '@/hooks/useSync'

const DEFAULT_GUIDES = [
  { emoji: '🙎🏻‍♂️', text: 'Complete your profile 1/5' },
  { emoji: '🤝🏽', text: 'Connect with top employers' },
  { emoji: '💰', text: 'Master payment processes' }
]

const TopTags = ({ tags, isLoading }: { tags: JobTag[]; isLoading: boolean }) => {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const router = useRouter()

  return (
    <Themed.ScrollView
      style={{ marginBottom: 10 }}
      contentContainerStyle={{ gap: 16 }}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        tags.map((tag, index) => (
          <Bounceable
            style={{
              width: Constants.screenWidth / 3,
              height: Constants.screenHeight / 6,
              borderRadius: 16,
              overflow: 'hidden',
              borderWidth: StyleSheet.hairlineWidth * 2,
              borderColor: colors.borderColor
            }}
            key={index}
            onPress={() => {
              router.push({ pathname: '/(tabs)/search/index-search', params: { categoryFromParam: tag.tagId } })
            }}
          >
            <Image
              source={{ uri: tag.iconUrl || 'https://cdn-icons-png.freepik.com/512/6477/6477886.png' }}
              style={{ flex: 1, width: 70, height: 70, alignSelf: 'center', marginBottom: 30 }}
              contentFit="contain"
            />

            <BlurView
              intensity={80}
              tint="systemChromeMaterial"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 40,
                justifyContent: 'center'
              }}
            >
              <View>
                <Themed.Text style={{ fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }}>
                  {formatTag(t, tag.tagId)}
                </Themed.Text>
              </View>
            </BlurView>
          </Bounceable>
        ))
      )}
    </Themed.ScrollView>
  )
}

const Guides = () => {
  const { theme, colors } = useTheme()

  const gradients: { light: [string, string]; dark: [string, string] }[] = [
    { light: ['#0ea5e9', '#0c4a6e'], dark: ['#38bdf8', '#f0f9ff'] },
    { light: ['#a855f7', '#581c87'], dark: ['#c084fc', '#faf5ff'] },
    { light: ['#22c55e', '#14532d'], dark: ['#4ade80', '#f0fdf4'] }
  ]
  return (
    <Themed.ScrollView
      style={{ marginBottom: 30 }}
      contentContainerStyle={{ gap: 16 }}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {DEFAULT_GUIDES.map((guide, index) => {
        const gradient = gradients[index][theme]

        return (
          <Bounceable
            style={{
              width: Constants.screenWidth / 2,
              height: Constants.screenHeight / 6,
              borderRadius: 16,
              overflow: 'hidden',
              borderWidth: StyleSheet.hairlineWidth * 2,
              borderColor: gradient[0],
              alignItems: 'center',
              backgroundColor: `${gradient[0]}33`
            }}
            key={index}
          >
            <LinearGradient
              colors={gradient}
              style={{
                width: 60,
                height: 60,
                backgroundColor: colors.secondaryBg,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 60,
                marginVertical: 10
              }}
            >
              <Themed.Text style={{ fontSize: 34 }}>{guide.emoji}</Themed.Text>
            </LinearGradient>
            <View>
              <Themed.Text style={{ marginHorizontal: 10, fontSize: 18, alignSelf: 'center' }}>
                {guide.text}
              </Themed.Text>
            </View>
          </Bounceable>
        )
      })}
    </Themed.ScrollView>
  )
}

export default function HomeScreen() {
  // const session = useSession()
  // const sync = useSync()
  const { profile } = useProfileStore()

  const [isLoading, setIsLoading] = useState(true)

  const fetchUserInfo = async () => {
    return
    if (!session.session) return
    const userInfoRes = await session.apiWithToken.get('/panda/user/info')
    profile.user.realName = userInfoRes.data.realName
    profile.user.username = userInfoRes.data.username
    profile.user.email = userInfoRes.data.email
    profile.user.avatar = userInfoRes.data.iconUrl
    profile.user._id = userInfoRes.data.userId
  }

  const refreshData = async () => {
    return
    setIsLoading(true)
    await Promise.all([fetchTags(), fetchFeaturedJobs(), fetchUserInfo(), sync.initialize()])
    setIsLoading(false)
  }

  useEffect(() => {
    refreshData()
  }, [])

  return (
    <Themed.ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshData} />}
      showsVerticalScrollIndicator={false}
    >
      <SectionHeader style={{ marginTop: 10 }} title="Guides" />
      <Guides />
    </Themed.ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 8
  },
  categoryItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 20
  },
  categoryShadow: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 4
  },
  categoryButton: {
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  categoryLabel: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center'
  }
})
