import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

import Themed from '../themed/Themed'
import { useTheme } from '@/hooks'
import CheckBox from '../CheckBox'
import { SkillTag } from '@/app/(tabs)/profile/EditProfileScreen'

interface SkillsFormProps {
  skillTags: SkillTag[]
  toggleSkillTag: (tagId: string) => void
}

const SkillsForm = ({ skillTags, toggleSkillTag }: SkillsFormProps) => {
  const { theme, colors } = useTheme()

  return (
    <View style={{ padding: 16, paddingVertical: 2 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <Stack.Screen options={{ sheetAllowedDetents: [0.55], contentStyle: { backgroundColor: colors.background } }} />
        {skillTags.map((tag) => (
          <CheckBox
            key={`${theme}-${tag.tagId}`}
            name={tag.name}
            checked={tag.selected}
            onPress={() => toggleSkillTag(tag.tagId)}
            hideCheck
          />
        ))}
      </View>
      {/*<TouchableOpacity style={{ marginTop: 16 }} activeOpacity={0.7}>
        <Themed.Text style={{ margin: 4, fontSize: 15, textDecorationLine: 'underline' }}>Show all</Themed.Text>
      </TouchableOpacity>*/}
    </View>
  )
}

export default SkillsForm
