import { Modal, TouchableOpacity, TouchableWithoutFeedback, Alert } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'

import { useTheme } from '@/hooks'
import { Constants } from '@/constants'
import Themed from '../themed/Themed'

export const formatDate = (date: Date) => {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
    .getDate()
    .toString()
    .padStart(2, '0')}`
}

export const DateModal = ({
  showModal,
  setShowModal,
  isFrom,
  fromDate,
  toDate,
  onSave
}: {
  showModal: boolean
  setShowModal: (show: boolean) => void
  isFrom: boolean
  fromDate: Date
  toDate: Date
  onSave: (date: Date) => void
}) => {
  const { theme } = useTheme()

  return (
    <Modal visible={showModal} animationType="fade" transparent>
      <TouchableOpacity
        activeOpacity={1}
        onPressOut={() => setShowModal(false)}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <TouchableWithoutFeedback>
          <Themed.View
            style={{
              margin: 20,
              borderRadius: 16,
              width: Constants.screenWidth - 40,
              height: Constants.screenHeight * 0.4,
              alignItems: 'center'
            }}
          >
            <DateTimePicker
              value={isFrom ? fromDate : toDate}
              mode="date"
              display="inline"
              onChange={(event, selectedDate) => {
                onSave(selectedDate ?? new Date())
              }}
              themeVariant={theme}
              maximumDate={new Date()}
            />
          </Themed.View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  )
}

export const DeleteEntryComponent = ({ onDelete }: { onDelete: () => void }) => (
  <Themed.TouchableOpacity
    style={{ marginTop: 6, padding: 16, alignItems: 'center', borderRadius: 16, backgroundColor: '#d11a2acc' }}
    activeOpacity={0.7}
    onPress={() =>
      Alert.alert('Are you sure', 'This action cannot be undone', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: onDelete
        }
      ])
    }
  >
    <Themed.Text style={{ fontWeight: '600', color: 'white' }}>Remove this entry</Themed.Text>
  </Themed.TouchableOpacity>
)
