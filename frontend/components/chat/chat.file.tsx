import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { FontAwesome6 } from '@expo/vector-icons'

import { formatBytes, getFileExtension, type FileExtensions } from '.'
import AudioComponent from './chat.audio'
import { useTheme } from '@/hooks'

interface FileComponentProps {
  position: 'left' | 'right',
  fileType: string
  filePath: string
  fileName: string
  fileSize?: number
}

const FileComponent = ({ position, filePath, fileName, fileSize, fileType }: FileComponentProps) => {
  const name = fileName.split('.')[0]
  const { colors } = useTheme()

  const getFileIcon = (type: string) => {
    const [fileType, fileSubtype] = type.split('/')
    if (fileType === 'image') {
      return 'file-image'
    } else if (fileType === 'audio') {
      return 'file-audio'
    } else if (fileType === 'video') {
      return 'file-video'
    } else if (type === 'application/pdf') {
      return 'file-pdf'
    } else {
      return 'file'
    }
  }

  /*if (fileType === 'mp3') {
    return <AudioComponent uri={filePath} />
  }*/

    const styles = StyleSheet.create({
      fileComponentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 'auto',
        padding: 16,
        borderRadius: 12,
        margin: 6,
        marginBottom: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        backgroundColor: colors.chat.file[position].backgroundColor
      },
      fileInfo: {
        flex: 1
      },
      fileName: {
        fontWeight: '600',
        color: colors.chat.file[position].textColor
      },
      fileType: {
        fontSize: 12,
        color: colors.chat.file[position].textColor,
        marginTop: 2
      }
    })

  return (
    <TouchableOpacity style={styles.fileComponentContainer} activeOpacity={0.9}>
      <FontAwesome6 name={getFileIcon(fileType)} size={30} color={colors.chat.file[position].textColor} style={{ marginRight: 14 }} />
      <View style={styles.fileInfo}>
        <Text style={[styles.fileName, { fontSize: name.length < 16 ? 16 : 10 }]}>
          {name.length < 30 ? name : name.slice(0, 31) + '...'}
        </Text>
        <Text style={styles.fileType}>
          {fileType.split('/')[1].toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

export default FileComponent
