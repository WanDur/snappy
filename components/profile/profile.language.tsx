import { View, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useState, useRef } from 'react'
import DropdownSelect from 'react-native-input-select'
import BottomSheet, { BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet'

import Themed from '../themed/Themed'
import { languages, Constants } from '@/constants'

const LanguageForm = () => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const [firstLang, setFirstLang] = useState('')
  const [secondLang, setSecondLang] = useState('')
  const [otherLang, setOtherLang] = useState('')

  return (
    <BottomSheetFlatList
      data={languages}
      keyExtractor={(i) => i.code}
      renderItem={({ item }) => <Themed.Text>{item.name}</Themed.Text>}
    />
  )
}

const styles = StyleSheet.create({})

/**
 * <View style={{ padding: 16, paddingVertical: 2 }}>
        <TouchableOpacity onPress={() => bottomSheetModalRef.current?.present()}>
          <Themed.Text style={{ fontSize: 26, marginBottom: 8 }}>PRESS ME</Themed.Text>
        </TouchableOpacity>
        <DropdownSelect
          label="Primary language"
          labelStyle={{ fontSize: 16, marginBottom: 8 }}
          placeholder=""
          options={languages}
          optionLabel={'name'}
          optionValue={'code'}
          selectedValue={firstLang}
          onValueChange={(itemValue: any) => setFirstLang(itemValue)}
          isSearchable
          autoCloseOnSelect
          dropdownStyle={{
            borderWidth: 0
          }}
        />
        <DropdownSelect
          label="Secondary language"
          labelStyle={{ fontSize: 16, marginBottom: 8 }}
          placeholder="optional"
          options={languages.filter((lang) => lang.code !== firstLang)}
          optionLabel={'name'}
          optionValue={'code'}
          selectedValue={secondLang}
          onValueChange={(itemValue: any) => setSecondLang(itemValue)}
          isSearchable
          autoCloseOnSelect
          dropdownStyle={{
            borderWidth: 0
          }}
        />
        <DropdownSelect
          label="Others"
          labelStyle={{ fontSize: 16, marginBottom: 8 }}
          placeholder="select up to 3"
          options={languages}
          optionLabel={'name'}
          optionValue={'code'}
          selectedValue={otherLang}
          onValueChange={(itemValue: any) => setOtherLang(itemValue)}
          isSearchable
          isMultiple
          listControls={{ hideSelectAll: true }}
          dropdownStyle={{
            borderWidth: 0
          }}
          maxSelectableItems={3}
        />
      </View>
 */

export default LanguageForm
