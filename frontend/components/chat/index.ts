// common types and functions for chat screen related component
import MessageInput from './MessageInput'
import ChatRow from './ChatRow'

import ImageComponent from './chat.image'
import ImagesComponent from './chat.images'
import FileComponent from './chat.file'
import AudioComponent from './chat.audio'

export type FileExtensions =
  | 'pdf'
  | 'mp3'
  | 'mp4'
  | 'jpg'
  | 'png'
  | 'jpeg'
  | 'gif'
  | 'txt'
  | 'doc'
  | 'docx'
  | 'ppt'
  | 'pptx'
  | 'xls'
  | 'xlsx'
  | 'zip'
  | 'rar'
  | ''

export enum Role {
  User = 0,
  Bot = 1
}

export interface Message {
  /**
   * role to identify message sender
   */
  role: Role

  /**
   * content that is passed to the server.
   * it can be the text message itself, base64 of images or audio
   */
  content: string

  /**
   * type of message
   * different type will render different component
   *
   * image & images : render single image & multiple images
   */
  type: 'text' | 'image' | 'images' | 'files' | 'audio'

  /**
   * extra data for message
   * help to provide or render additional information
   */
  metaData?: MetaData
}

export interface MetaData {
  /**
   * file name
   */
  name?: string

  /**
   * file size in bytes
   */
  size?: number

  /**
   * extra prompt entered by user when uploading files
   */
  extraPrompt?: string
}

const getFileExtension = (filePath: string): FileExtensions => {
  const regex = /[^.]+$/
  const match = filePath.match(regex)

  if (match) {
    return match[0] as FileExtensions
  }
  return ''
}

const formatBytes = (bytes: number) => {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 B'
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString())
  const value = bytes / Math.pow(1024, i)
  return `${value.toFixed(i > 1 ? 1 : 0)} ${sizes[i]}`
}

const convertToBase64 = async (uri: string) => {
  const response = await fetch(uri)
  const blob = await response.blob()
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      resolve(reader.result as string)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export {
  MessageInput,
  ChatRow,
  getFileExtension,
  formatBytes,
  convertToBase64,
  ImageComponent,
  ImagesComponent,
  FileComponent,
  AudioComponent
}
