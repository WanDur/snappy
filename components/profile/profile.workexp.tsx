import { useState, useEffect } from 'react'
import { View } from 'react-native'
import { Stack } from 'expo-router'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import { StatusBar } from 'expo-status-bar'

import { formatDate, DateModal, DeleteEntryComponent } from './utils'
import { useTheme, useProfileStore } from '@/hooks'
import { Constants } from '@/constants'
import { WorkExp } from '@/types/profile.type'
import Themed from '../themed/Themed'

interface WorkExpFormProps {
  id: string
  workExp: WorkExp
  setWorkExp: (workExp: WorkExp) => void
  onDelete?: () => void
}

const WorkExpForm = ({ id, workExp, setWorkExp, onDelete }: WorkExpFormProps) => {
  const { colors } = useTheme()
  const workexps = useProfileStore((state) => state.profile.workExp)

  const [isCurrent, setIsCurrent] = useState(true)
  const [fromDate, setFromDate] = useState(new Date())
  const [toDate, setToDate] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [isFrom, setIsFrom] = useState(false)

  useEffect(() => {
    if (id) {
      const foundExp = workexps.find((exp) => exp.id === id)
      if (foundExp) {
        setWorkExp(foundExp)
        setIsCurrent(!foundExp.endDate)
      }
    }
  }, [id, workexps, setWorkExp])

  const onSave = (date: Date) => {
    const formattedDate = formatDate(date)
    if (isFrom) {
      setWorkExp({ ...workExp, startDate: formattedDate })
      setFromDate(date)
    } else {
      setWorkExp({ ...workExp, endDate: formattedDate })
      setToDate(date)
    }
    setShowModal(false)
  }

  const toggleCheckBox = () => {
    // @ts-ignore
    setWorkExp((prev: WorkExp) => {
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
      <Themed.TextInput
        label="Job title"
        value={workExp.title}
        onChangeText={(text) => setWorkExp({ ...workExp, title: text })}
        autoFocus
      />
      <Themed.TextInput
        label="Company"
        value={workExp.company}
        onChangeText={(text) => setWorkExp({ ...workExp, company: text })}
      />
      <View style={{ flexDirection: 'row' }}>
        <Themed.TextInput
          label="From"
          containerStyle={{ flex: 1, marginRight: 10 }}
          value={workExp.startDate || formatDate(new Date())}
          editable={false}
          onTouchEnd={() => {
            setIsFrom(true)
            setShowModal(true)
          }}
        />
        <Themed.TextInput
          label="To"
          containerStyle={{ flex: 1, marginLeft: 10 }}
          value={workExp.endDate}
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
        textComponent={<Themed.Text style={{ marginLeft: 6, padding: 4 }}>This is my current position</Themed.Text>}
        size={24}
      />
      <Themed.TextInput
        label="Description"
        placeholder="additional information..."
        multiline
        value={workExp.desc}
        onChangeText={(text) => setWorkExp({ ...workExp, desc: text })}
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

export default WorkExpForm
