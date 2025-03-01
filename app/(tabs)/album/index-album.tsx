import React, { useState, useEffect } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Stack, useRouter, useLocalSearchParams } from 'expo-router'
import { Slider } from '@miblanchard/react-native-slider'
import * as Haptics from 'expo-haptics'

import { useStorageStore, useTheme } from '@/hooks'
import Themed from '@/components/themed/Themed'
import { SectionHeader, CheckBox } from '@/components'
// import { useSession } from '@/contexts/auth'
import { useTranslation } from 'react-i18next'
import { formatTag } from '@/utils/utils'
// import { useSync } from '@/hooks/useSync'

const AlbumScreen = () => {
  const router = useRouter()
  // const session = useSession()
  // const sync = useSync()

  return (
    <Themed.ScrollView style={{ padding: 16, paddingTop: 6 }} extraPadding={20}>
      <Themed.Text>AlbumScreen</Themed.Text>
    </Themed.ScrollView>
  )
}

const styles = StyleSheet.create({
  listContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  searchBtn: {
    backgroundColor: 'tomato',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginVertical: 10,
    marginTop: 30
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    padding: 12,
    height: 80,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,

    elevation: 3
  },
  buttonText: {
    position: 'absolute',
    top: 10,
    left: 10,
    fontWeight: '600'
  }
})

export default AlbumScreen
