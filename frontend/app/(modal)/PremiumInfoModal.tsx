import { useState, ReactNode } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'

import { TouchableBounce } from '@/components'
import { useTheme } from '@/hooks'

const FeatureItem = ({ icon, title, description }: { icon: ReactNode; title: string; description: string }) => {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconContainer}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  )
}

const PremiumInfoModal = () => {
  const router = useRouter()
  const { message } = useLocalSearchParams<{ message: string }>()
  const { reverseTheme } = useTheme()

  const [isMonthly, setIsMonthly] = useState(false)

  const handleUpgradePress = () => {
    router.push('/(modal)/RedeemCodeModal')
  }

  const togglePlan = () => {
    setIsMonthly((prev) => !prev)
  }

  return (
    <View style={{ flex: 1 }}>
      <BlurView intensity={80} tint={reverseTheme} style={{ flex: 1 }}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <AntDesign name="close" size={24} color="white" />
        </TouchableOpacity>

        <ScrollView
          style={styles.contentContainer}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <MaterialCommunityIcons name="crown" size={40} color="#FFD700" />
            <Text style={styles.title}>Upgrade to Premium</Text>
            <Text style={styles.subtitle}>Unlock the full experience</Text>
            {message && <Text style={styles.subtitle}>{message}</Text>}
          </View>

          <View style={{ paddingBottom: 10 }}>
            <FeatureItem
              icon={<Ionicons name="ribbon" size={24} color="#FFD700" />}
              title="Premium Badge"
              description="Showcase your premium with a badge"
            />

            <FeatureItem
              icon={<Ionicons name="albums" size={24} color="#FFD700" />}
              title="Unlimited Albums"
              description="Create as many albums as you want without any restrictions"
            />

            <FeatureItem
              icon={<Ionicons name="infinite" size={24} color="#FFD700" />}
              title="Unlimited Group Chat Members"
              description="Add as many members as you want to your group chats"
            />
          </View>


          <TouchableBounce style={styles.upgradeButton} onPress={handleUpgradePress}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.upgradeButtonText}>Redeem Code</Text>
            </LinearGradient>
          </TouchableBounce>

          <Text style={styles.termsText}>By continuing, you agree to our Terms of Service and Privacy Policy</Text>
        </ScrollView>
      </BlurView>
    </View>
  )
}

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  contentContainer: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 16
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
    textAlign: 'center'
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)'
  },
  pricingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center'
  },
  planContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  planOption: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  planSelected: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: '#FFD700'
  },
  planDuration: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5
  },
  planSaving: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600'
  },
  upgradeButton: {
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 20
  },
  gradientButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  termsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 30
  }
})

export default PremiumInfoModal
