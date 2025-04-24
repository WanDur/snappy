import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable } from 'react-native'
import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'

import { Themed, TouchableBounce } from '@/components'
import { useTheme } from '@/hooks'

const PremiumInfoModal = () => {
  const router = useRouter()
  const { reverseTheme } = useTheme()

  const handleUpgradePress = () => {}

  return (
    <View style={{ flex: 1 }}>
      <BlurView intensity={80} tint={reverseTheme} style={{ flex: 1 }}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <AntDesign name="close" size={24} color="white" />
        </TouchableOpacity>

        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <MaterialCommunityIcons name="crown" size={40} color="#FFD700" />
            <Text style={styles.title}>Upgrade to Premium</Text>
            <Text style={styles.subtitle}>Unlock the full experience</Text>
          </View>

          <View style={styles.featuresContainer}>
            <FeatureItem
              icon={<Ionicons name="albums" size={24} color="#FFD700" />}
              title="Unlimited Albums"
              description="Create as many albums as you want without any restrictions"
            />

            <FeatureItem
              icon={<Ionicons name="eye" size={24} color="#FFD700" />}
              title="Sneak Peek"
              description="Exclusive access to view premium content from other users"
            />

            <FeatureItem
              icon={<MaterialCommunityIcons name="image-filter-hdr" size={24} color="#FFD700" />}
              title="Advanced Filters"
              description="Access to our premium collection of photo filters"
            />

            <FeatureItem
              icon={<AntDesign name="cloudupload" size={24} color="#FFD700" />}
              title="Cloud Storage"
              description="5GB of cloud storage for your high-quality photos"
            />

            <FeatureItem
              icon={<AntDesign name="tag" size={24} color="#FFD700" />}
              title="Ad-Free Experience"
              description="Enjoy the app without any advertisements"
            />
          </View>

          <View style={styles.pricingContainer}>
            <Text style={styles.pricingTitle}>Choose Your Plan</Text>

            <View style={styles.planContainer}>
              <TouchableOpacity style={[styles.planOption, styles.planSelected]} activeOpacity={0.7}>
                <Text style={styles.planDuration}>Annual</Text>
                <Text style={styles.planPrice}>$49.99</Text>
                <Text style={styles.planSaving}>Save 30%</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.planOption} activeOpacity={0.7}>
                <Text style={styles.planDuration}>Monthly</Text>
                <Text style={styles.planPrice}>$5.99</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableBounce style={styles.upgradeButton} onPress={handleUpgradePress}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            </LinearGradient>
          </TouchableBounce>

          <TouchableOpacity>
            <Themed.Text style={{ textAlign: 'center', marginBottom: 14 }} text70>
              Restore purchase/Have code already?
            </Themed.Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>By continuing, you agree to our Terms of Service and Privacy Policy</Text>
        </ScrollView>
      </BlurView>
    </View>
  )
}

const FeatureItem = ({ icon, title, description }) => {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconContainer}>{icon}</View>
      <View style={styles.featureTextContainer}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
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
    marginTop: 5
  },
  featuresContainer: {
    marginBottom: 30
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
  featureTextContainer: {
    flex: 1
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
  pricingContainer: {
    marginBottom: 30
  },
  pricingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 15,
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
    marginHorizontal: 5
  },
  planSelected: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderWidth: 2,
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
