import { useState } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { FlashList } from '@shopify/flash-list'

import { Constants } from '@/constants'
import { useStorageStore, useTheme } from '@/hooks'
import { Themed, SectionHeader, InterestCard } from '@/components'
import { Stack } from '@/components/router-form'

const interestsData = [
  { id: 1, title: 'Social media content' },
  { id: 2, title: 'Photo edit' },
  { id: 3, title: 'Video edit' },
  { id: 4, title: 'Graphic design' },
  { id: 5, title: 'Photography' },
  { id: 6, title: 'Gaming' },
  { id: 7, title: 'Making advertisement' },
  { id: 8, title: 'Making music' },
  { id: 9, title: 'Making video' },
  { id: 10, title: 'Writer' },
  { id: 11, title: 'Web development' },
  { id: 12, title: 'Mobile development' },
  { id: 13, title: 'UI/UX design' },
  { id: 14, title: 'Animation' },
  { id: 15, title: 'Translation' },
  { id: 16, title: 'Data analysis' },
  { id: 17, title: 'E-commerce' },
  { id: 18, title: '3D design' },
  { id: 19, title: 'Game development' },
  { id: 20, title: 'Add more' }
]

const SelectInterestScreen = () => {
  const { colors } = useTheme()
  const { savedInterests, saveInterests } = useStorageStore()

  const [selectedInterests, setSelectedInterests] = useState<number[]>(savedInterests)

  const handleToggleInterest = (id: number) => {
    setSelectedInterests((prev) => {
      if (prev.includes(id)) {
        return prev.filter((interestId) => interestId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleSave = () => {
    saveInterests(selectedInterests)
    router.back()
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Interests',
          ...(!Constants.isIOS && { headerStyle: { backgroundColor: colors.background } })
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} contentInsetAdjustmentBehavior="automatic">
        <SectionHeader title="Choose your interests" />
        <Themed.Text style={styles.infoText}>
          Please select the following fields, so we can tailor job recommendations for you.
        </Themed.Text>

        <FlashList
          data={interestsData}
          extraData={selectedInterests}
          numColumns={2}
          renderItem={({ item }) => (
            <InterestCard
              key={item.id}
              id={item.id}
              title={item.title}
              selected={selectedInterests.includes(item.id)}
              onPress={() => handleToggleInterest(item.id)}
            />
          )}
          estimatedItemSize={80}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </ScrollView>
      <View style={[styles.saveContainer, { borderColor: colors.borderColor }]}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.7}>
          <Themed.Text style={styles.saveButtonText}>Save</Themed.Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default SelectInterestScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between'
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1
  },
  infoText: {
    color: 'grey',
    marginBottom: 16
  },
  saveContainer: {
    padding: 16,
    paddingBottom: Constants.isIOS ? 32 : 32,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderTopWidth: StyleSheet.hairlineWidth
  },
  saveButton: {
    width: '80%',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF'
  },
  saveButtonText: {
    fontWeight: '600',
    color: 'white'
  }
})
