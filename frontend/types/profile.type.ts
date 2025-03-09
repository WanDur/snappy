import * as DocumentPicker from 'expo-document-picker'
import { User as IUser } from 'react-native-gifted-chat/lib/Models'

export type EditType =
  | 'about'
  | 'workexp'
  | 'edit_workexp'
  | 'education'
  | 'edit_education'
  | 'skills'
  | 'language'
  | 'resume'

export interface RealName {
  firstName: string
  lastName: string
  honorific: string
}

export interface TUser extends IUser{
  _id: string
  username: string
  /**
   * Real name should only be null when referring to the system
   */
  realName?: RealName
  avatar?: string
  email?: string
}

export interface WorkExp {
  id: string
  title: string
  company: string
  startDate: string
  endDate?: string
  desc?: string
}

export interface Education {
  id: string
  level: string
  institution: string
  field: string
  startDate: string
  endDate?: string
  desc?: string
}

export interface Language {
  primary: string
  secondary?: string
  additional?: string[]
}

// export interface Resume extends DocumentPicker.DocumentPickerAsset {
//   uploadedAt?: string
// }

export interface Resume {
  url: string
  name: string
  uploadedAt: string
}

export type ProfileData = {
  /**
   * default: { id: '', username: '', lastName: '' }
   */
  user: TUser
  /**
   * default: []
   */
  aboutDesc: string
  workExp: WorkExp[]
  /**
   * default: []
   */
  education: Education[]
  /**
   * default: []
   */
  skills: string[]
  /**
   * default: { primary: '' }
   */
  language: Language
  /**
   * default: { name: '', uri: '' }
   */
  resume?: Resume
}
