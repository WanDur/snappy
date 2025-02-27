import React, { useState } from 'react'
import { Feather } from '@expo/vector-icons'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { useTheme } from '@/hooks'
import Themed from '../../themed/Themed'

interface SettingsSelectListProps {
  options: string[]
  defaultSelectedIndex: number
  multipleSelection: boolean
  onChange?: (index: number) => void
}

const SettingsSelectList = ({
  options,
  defaultSelectedIndex,
  multipleSelection,
  onChange
}: SettingsSelectListProps) => {
  const { colors } = useTheme()
  const [selectedIndexes, setSelectedIndexes] = useState(new Set([defaultSelectedIndex]))

  const handlePress = (index: number) => {
    if (multipleSelection) {
      const updatedSelected = new Set(selectedIndexes)
      if (updatedSelected.has(index)) {
        updatedSelected.delete(index)
      } else {
        updatedSelected.add(index)
      }
      setSelectedIndexes(updatedSelected)
    } else {
      setSelectedIndexes(new Set([index]))
      onChange?.(index)
    }
  }

  return (
    <Themed.View type="secondary">
      {options.map((option, index) => {
        const isLastOption = index === options.length - 1

        return (
          <View key={option}>
            <TouchableOpacity style={styles.optionContainer} onPress={() => handlePress(index)} activeOpacity={0.7}>
              <Themed.Text style={styles.optionText}>{option}</Themed.Text>
              {selectedIndexes.has(index) && <Feather name="check" style={styles.checkIcon} color="#007AFF" />}
            </TouchableOpacity>

            {!isLastOption && <View style={[styles.divider, { backgroundColor: colors.borderColor }]} />}
          </View>
        )
      })}
    </Themed.View>
  )
}

export default SettingsSelectList

const styles = StyleSheet.create({
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    padding: 12
  },
  optionText: {
    fontWeight: '500',
    fontSize: 16,
    marginLeft: 10
  },
  checkIcon: {
    fontSize: 24,
    marginRight: 10
  },
  divider: {
    height: StyleSheet.hairlineWidth * 2,
    marginHorizontal: 12
  }
})
