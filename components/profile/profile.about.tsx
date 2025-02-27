import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { Stack } from 'expo-router'

import { useTheme } from '@/hooks'
import { Constants } from '@/constants'

interface AboutMeFormProps {
  bios: string
  setBios: (bios: string) => void
}

const AboutMeForm = ({ bios, setBios }: AboutMeFormProps) => {
  const { colors } = useTheme()

  return (
    <View>
      <Stack.Screen options={{ sheetAllowedDetents: [0.26], contentStyle: { backgroundColor: colors.background } }} />
      <TextInput
        placeholder="Write a little about yourself..."
        onChangeText={setBios}
        maxLength={200}
        value={bios}
        autoFocus
        autoCorrect={false}
        multiline
        style={[styles.input, { color: colors.text }]}
      />
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 10,
          alignItems: 'center',
          justifyContent: 'flex-end',
          top: 6
        }}
      >
        <Text style={{ color: 'grey' }}>{bios ? bios.length : 0}/200 •</Text>
        <TouchableOpacity style={{ padding: 3 }} activeOpacity={0.7} onPress={() => setBios('')}>
          <Text style={{ color: 'grey', fontWeight: '600' }}>Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    fontSize: 16,
    paddingHorizontal: 16,
    height: Constants.screenHeight * 0.13
  }
})

export default AboutMeForm
