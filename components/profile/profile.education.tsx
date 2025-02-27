import { useState, useEffect } from 'react'
import { View } from 'react-native'
import { Stack } from 'expo-router'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import { StatusBar } from 'expo-status-bar'
import RNPickerSelect from 'react-native-picker-select'

import { formatDate, DateModal, DeleteEntryComponent } from './utils'
import { useTheme, useProfileStore } from '@/hooks'
import { Constants } from '@/constants'
import { Education } from '@/types/profile.type'
import Themed from '../themed/Themed'

interface EducationFormProps {
  id: string
  education: Education
  setEducation: (education: Education) => void
  onDelete?: () => void
}

const EducationForm = ({ id, education, setEducation, onDelete }: EducationFormProps) => {
  const { colors, isDark } = useTheme()
  const educations = useProfileStore((state) => state.profile.education)

  const [isCurrent, setIsCurrent] = useState(true)
  const [fromDate, setFromDate] = useState(new Date())
  const [toDate, setToDate] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [isFrom, setIsFrom] = useState(false)

  useEffect(() => {
    if (id) {
      const foundEdu = educations.find((edu) => edu.id === id)
      if (foundEdu) {
        setEducation(foundEdu)
        setIsCurrent(!foundEdu.endDate)
      }
    }
  }, [id, educations, setEducation])

  const onSave = (date: Date) => {
    const formattedDate = formatDate(date)
    if (isFrom) {
      setEducation({ ...education, startDate: formattedDate })
      setFromDate(date)
    } else {
      setEducation({ ...education, endDate: formattedDate })
      setToDate(date)
    }
    setShowModal(false)
  }

  const toggleCheckBox = () => {
    // @ts-ignore
    setEducation((prev: Education) => {
      setIsCurrent(!isCurrent)

      return {
        ...prev,
        endDate: undefined
      }
    })
  }

  return (
    <View style={{ padding: 16, paddingVertical: 2 }}>
      <Stack.Screen options={{ contentStyle: { backgroundColor: colors.background } }} />
      <Themed.Text style={{ marginBottom: 4, marginLeft: 4 }}>Level of education</Themed.Text>
      <RNPickerSelect
        style={{
          viewContainer: {
            borderRadius: 12,
            height: 50,
            padding: 14,
            backgroundColor: isDark ? '#2d2d37' : 'rgb(229, 229, 234)',
            marginBottom: 16,
            justifyContent: 'center'
          },
          inputIOSContainer: {
            pointerEvents: 'none',
            height: 50,
            justifyContent: 'center'
          },
          inputIOS: { color: colors.text, fontSize: 16 },
          placeholder: { color: 'grey' }
        }}
        value={education.level}
        onValueChange={(value) => {
          setEducation({ ...education, level: value })
        }}
        placeholder={{ label: 'Level of education', value: null, color: 'grey' }}
        items={[
          { label: 'High School Diploma', value: 'high_school' },
          { label: 'Associate Degree', value: 'asso' },
          { label: "Bachelor's Degree", value: 'bachelor' },
          { label: "Master's Degree", value: 'master' },
          { label: 'Doctorate / PhD', value: 'doctoral' }
        ]}
        darkTheme={isDark}
      />
      <Themed.TextInput
        label="Institution name"
        value={education.institution}
        onChangeText={(text) => setEducation({ ...education, institution: text })}
        autoFocus
      />
      <Themed.TextInput
        label="Field of study (optional)"
        value={education.field}
        onChangeText={(text) => setEducation({ ...education, field: text })}
      />
      <View style={{ flexDirection: 'row' }}>
        <Themed.TextInput
          label="From"
          containerStyle={{ flex: 1, marginRight: 10 }}
          value={education.startDate || formatDate(new Date())}
          editable={false}
          onTouchEnd={() => {
            setIsFrom(true)
            setShowModal(true)
          }}
        />
        <Themed.TextInput
          label="To"
          containerStyle={{ flex: 1, marginLeft: 10 }}
          value={education.endDate}
          disabled={isCurrent}
          editable={false}
          onTouchEnd={() => {
            if (isCurrent) return
            setIsFrom(false)
            setShowModal(true)
          }}
        />
      </View>
      <BouncyCheckbox
        isChecked={isCurrent}
        onPress={toggleCheckBox}
        style={{ marginBottom: 16 }}
        textComponent={<Themed.Text style={{ marginLeft: 6, padding: 4 }}>This is my current study</Themed.Text>}
        size={24}
      />
      <Themed.TextInput
        label="Description"
        placeholder="additional information..."
        multiline
        value={education.desc}
        onChangeText={(text) => setEducation({ ...education, desc: text })}
        inputStyle={{ height: Constants.screenHeight * 0.25 }}
      />
      {onDelete && <DeleteEntryComponent onDelete={onDelete} />}
      <DateModal
        fromDate={fromDate}
        isFrom={isFrom}
        onSave={onSave}
        showModal={showModal}
        setShowModal={setShowModal}
        toDate={toDate}
      />
      <StatusBar style="light" animated={true} />
    </View>
  )
}

export default EducationForm
