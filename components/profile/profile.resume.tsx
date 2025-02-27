import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { Stack } from 'expo-router'

import Themed from '../themed/Themed'
import { useTheme } from '@/hooks'
import { Resume } from '@/types'

interface ResumeFormProps {
  resume?: Resume
  onSelect: () => void
  onRemove: () => void
}

interface ViewOrDeleteDocumentProps {
  resume?: Resume
  onRemove?: () => void
}

export const ViewOrDeleteDocument = ({ resume, onRemove }: ViewOrDeleteDocumentProps) => {
  return (
    <Themed.View
      style={{
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#888',
        borderRadius: 8,
        padding: 12
      }}
      lightColor="#E6E6FA"
      darkColor="#333"
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <MaterialCommunityIcons
          name="file-pdf-box"
          size={48}
          color="#E13B3B"
          style={{ marginRight: 8, alignSelf: 'center' }}
        />
        <View style={{ flex: 1, justifyContent: 'center', gap: 4 }}>
          <Themed.Text style={{ fontSize: 16, fontWeight: '600' }}>{resume?.name}</Themed.Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: 'grey' }}>
              {resume!.uploadedAt ? new Date(resume!.uploadedAt).toLocaleString() : 'To Be Uploaded'}
            </Text>
          </View>
        </View>
      </View>
      {onRemove && (
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 12,
            alignSelf: 'flex-start',
            paddingVertical: 8,
            paddingBottom: 2,
            paddingHorizontal: 10
          }}
          activeOpacity={0.7}
          onPress={onRemove}
        >
          <Ionicons name="trash-outline" size={18} color="#E13B3B" />
          <Text style={{ marginLeft: 6, color: '#E13B3B', fontWeight: '500' }}>Remove file</Text>
        </TouchableOpacity>
      )}
    </Themed.View>
  )
}

const ResumeForm = ({ resume, onSelect, onRemove }: ResumeFormProps) => {
  const { colors } = useTheme()

  const UploadDocument = () => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        paddingVertical: 30,
        borderRadius: 8,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#888'
      }}
      activeOpacity={0.7}
      onPress={onSelect}
    >
      <Ionicons name="cloud-upload-outline" size={24} color={colors.text} style={{ marginRight: 8 }} />
      <Themed.Text style={{ fontSize: 16, fontWeight: '500' }}>Upload CV/Resume</Themed.Text>
    </TouchableOpacity>
  )

  return (
    <View>
      <Stack.Screen options={{ sheetAllowedDetents: [0.34], contentStyle: { backgroundColor: colors.background } }} />
      {!resume || resume?.name === '' ? (
        <UploadDocument />
      ) : (
        <ViewOrDeleteDocument resume={resume} onRemove={onRemove} />
      )}
      <Text style={{ marginTop: 8, fontSize: 12, color: 'gray' }}>Upload PDF for up to $not-set MB</Text>
    </View>
  )
}

export default ResumeForm
