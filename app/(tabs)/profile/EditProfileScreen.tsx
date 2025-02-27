import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import * as DocumentPicker from 'expo-document-picker'
import * as Crypto from 'expo-crypto'
import { DocumentPickerAsset } from 'expo-document-picker'
import { useTranslation } from 'react-i18next'

import { useProfileStore } from '@/hooks'
import { Themed } from '@/components'
import { EditType } from '@/types'
import { WorkExp, Education, Resume } from '@/types/profile.type'
import { Constants } from '@/constants'
import { WorkExpForm, EducationForm, AboutMeForm, ResumeForm, SkillsForm } from '@/components/profile'
// import { useSession } from '@/contexts/auth'
import { formatTag } from '@/utils'

const validTypes: EditType[] = [
  'about',
  'workexp',
  'edit_workexp',
  'education',
  'edit_education',
  'skills',
  'language',
  'resume'
]

const typeMap: Record<EditType, { title: string }> = {
  about: { title: 'About me' },
  workexp: { title: 'Add work experience' },
  edit_workexp: { title: 'Edit work experience' },
  education: { title: 'Add education' },
  edit_education: { title: 'Edit education' },
  skills: { title: 'Skills' },
  language: { title: 'Language' },
  resume: { title: 'Resume' }
}

const INITIAL_CATEGORIES = [
  { id: 1, name: 'Consulting', selected: false },
  { id: 2, name: 'Customer Service', selected: false },
  { id: 3, name: 'Design', selected: false },
  { id: 4, name: 'Education', selected: false },
  { id: 5, name: 'Engineering', selected: false },
  { id: 6, name: 'Finance', selected: false },
  { id: 7, name: 'Healthcare', selected: false },
  { id: 8, name: 'Human Resources', selected: false },
  { id: 9, name: 'Logistics', selected: false },
  { id: 10, name: 'Marketing', selected: false },
  { id: 11, name: 'Photography', selected: false },
  { id: 12, name: 'Promotion', selected: false },
  { id: 13, name: 'Sales', selected: false },
  { id: 14, name: 'Software', selected: false }
]

export interface SkillTag {
  tagId: string
  name: string
  selected: boolean
}

const EditProfileScreen = () => {
  const router = useRouter()
  // const session = useSession()
  const { t } = useTranslation()

  const { profile, getProfile, updateAbout } = useProfileStore()
  const { education: educations, language, resume, skills, user, workExp: workexps } = profile

  const { _type, _metaData } = useLocalSearchParams()
  const type = _type.toString() as EditType
  const metaData = JSON.parse(_metaData ? _metaData.toString() : '{}')

  const [about, setAbout] = useState(profile.aboutDesc)
  const [workExp, setWorkExp] = useState<WorkExp>({
    id: '',
    title: '',
    company: '',
    startDate: '',
    endDate: undefined,
    desc: ''
  })
  const [education, setEducation] = useState<Education>({
    id: '',
    field: '',
    institution: '',
    level: '',
    startDate: '',
    endDate: undefined
  })

  // #region initialize values
  useEffect(() => {
    if (!type || !validTypes.includes(type)) {
      console.warn(
        `[WARNING][EditProfileScreen] edit type "${type}" not supported. Valid types: [${validTypes.join(', ')}]`
      )
      return
    }
  }, [type])

  // useEffect(() => {
  //   const updated = INITIAL_CATEGORIES.map((cat) => {
  //     if (skills.includes(cat.name)) {
  //       return { ...cat, selected: true }
  //     }
  //     return cat
  //   })
  //   setSkillTags(updated)
  // }, [skills])

  // #endregion

  // #region skill
  const [skillTags, setSkillTags] = useState<SkillTag[]>([])
  const selectedSkillTags = skillTags.filter((tag) => tag.selected)

  useEffect(() => {
    const fetchSkillTags = async () => {
      return
      try {
        const response = await session.apiWithToken.get('/panda/job/tags?count=30')
        setSkillTags(
          response.data.map((tag: { tagId: string }) => ({
            tagId: tag.tagId,
            name: formatTag(t, tag.tagId),
            selected: skills.includes(tag.tagId)
          }))
        )
      } catch (error) {
        console.error(error)
      }
    }

    fetchSkillTags()
  }, [])

  const toggleCategory = (tagId: string) => {
    setSkillTags((prevSkillTags) => {
      const updated = prevSkillTags.map((tag) => (tag.tagId === tagId ? { ...tag, selected: !tag.selected } : tag))
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
      return updated
    })
  }

  // #endregion

  class RNBlob extends Blob {
    get [Symbol.toStringTag]() {
      return 'Blob'
    }
  }

  // #region resume
  const [pickedResume, setPickedResume] = useState<DocumentPickerAsset | null>(null)

  const handleSelectDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: false })
    if (!result.canceled) {
      const pickedFile: DocumentPickerAsset = result.assets[0]
      delete pickedFile.mimeType
      setPickedResume(pickedFile)
      updateResume({
        url: '',
        name: pickedFile.name,
        uploadedAt: ''
      })
    }
  }

  const handleRemoveResume = async () => {
    await session.apiWithToken.delete('/panda/user/provider/profile/resume/delete')
    removeResume()
  }
  // #endregion

  // #region workexp
  const onRemoveWorkExp = () => {
    removeWorkExp(metaData)
    session.apiWithToken.post('/panda/user/provider/profile/edit', {
      workExp: getProfile().workExp.map((exp) => {
        return {
          ...exp,
          startDate: `${exp.startDate}T00:00:00`,
          endDate: exp.endDate && `${exp.endDate}T00:00:00`,
          id: undefined
        }
      })
    })
    router.back()
  }
  // #endregion

  // #region education
  const onRemoveEducation = async () => {
    removeEducation(metaData)
    await saveToServer({
      education: getProfile().education.map((edu) => {
        return {
          ...edu,
          startDate: `${edu.startDate}T00:00:00`,
          endDate: edu.endDate && `${edu.endDate}T00:00:00`,
          id: undefined
        }
      })
    })
    router.back()
  }
  // #endregion

  // #region save function
  const saveToServer = async (body: object) => {
    try {
      await session.apiWithToken.post('/panda/user/provider/profile/edit', body)
    } catch (error) {
      Alert.alert('Error', 'Failed to update about me')
    }
  }

  const saveHandler: Record<EditType, () => void> = {
    about: async () => {
      updateAbout(about)
      await saveToServer({ aboutDesc: about })
    },
    skills: async () => {
      return
      updateSkills(selectedSkillTags.map((tag) => tag.tagId))
      await saveToServer({ skills: getProfile().skills })
    },
    workexp: async () => {
      return
      if (workExp.title.trim() === '' || workExp.company.trim() === '' || workExp.startDate.trim() === '') return
      addWorkExp({ ...workExp, id: Crypto.randomUUID().slice(0, 8) })
      await saveToServer({
        workExp: getProfile().workExp.map((exp) => {
          return {
            ...exp,
            startDate: `${exp.startDate}T00:00:00`,
            endDate: exp.endDate && `${exp.endDate}T00:00:00`,
            id: undefined
          }
        })
      })
    },
    edit_workexp: async () => {
      return
      if (workExp.title.trim() === '' || workExp.company.trim() === '' || workExp.startDate.trim() === '') return
      editWorkExp(metaData, workExp)
      await saveToServer({
        workExp: getProfile().workExp.map((exp) => {
          return {
            ...exp,
            startDate: `${exp.startDate}T00:00:00`,
            endDate: exp.endDate && `${exp.endDate}T00:00:00`,
            id: undefined
          }
        })
      })
    },
    education: async () => {
      return
      if (education.level.trim() === '' || education.institution.trim() === '' || education.startDate.trim() === '')
        return
      addEducation({ ...education, id: Crypto.randomUUID().slice(0, 8) })
      await saveToServer({
        education: getProfile().education.map((edu) => {
          return {
            ...edu,
            startDate: `${edu.startDate}T00:00:00`,
            endDate: edu.endDate && `${edu.endDate}T00:00:00`,
            id: undefined
          }
        })
      })
    },
    edit_education: async () => {
      return
      if (education.level.trim() === '' || education.institution.trim() === '' || education.startDate.trim() === '')
        return
      editEducation(metaData, education)
      await saveToServer({
        education: getProfile().education.map((edu) => {
          return {
            ...edu,
            startDate: `${edu.startDate}T00:00:00`,
            endDate: edu.endDate && `${edu.endDate}T00:00:00`,
            id: undefined
          }
        })
      })
    },
    resume: async () => {
      return
      if (!pickedResume) return
      try {
        const formData = new FormData()
        formData.append('file', {
          uri: pickedResume.uri,
          name: pickedResume.name,
          type: 'application/pdf'
        } as any)

        const response = await session.apiWithToken.post('/panda/user/provider/profile/resume/upload', formData)
        const resume: Resume = response.data
        updateResume(resume)
      } catch (error) {
        console.error('Error:', error)
        Alert.alert('Error', 'Failed to upload resume')
      }
    },
    language: () => {}
  }

  const handleSave = async () => {
    saveHandler[type]()
    router.back()
  }
  // #endregion

  // #region render content
  const renderContent = () => {
    switch (type) {
      case 'about':
        return <AboutMeForm bios={about} setBios={setAbout} />
      case 'workexp':
        return <WorkExpForm id="" workExp={workExp} setWorkExp={setWorkExp} />
      case 'edit_workexp':
        return <WorkExpForm id={metaData} workExp={workExp} setWorkExp={setWorkExp} onDelete={onRemoveWorkExp} />
      case 'education':
        return <EducationForm id="" education={education} setEducation={setEducation} />
      case 'edit_education':
        return (
          <EducationForm id={metaData} education={education} setEducation={setEducation} onDelete={onRemoveEducation} />
        )
      case 'skills':
        return <SkillsForm skillTags={skillTags} toggleSkillTag={toggleCategory} />
      case 'resume':
        return (
          <View style={{ padding: 16, paddingVertical: 2 }}>
            <ResumeForm resume={resume} onSelect={handleSelectDocument} onRemove={handleRemoveResume} />
          </View>
        )
    }
  }
  // #endregion

  // #region component render
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Themed.Text style={styles.title}>{typeMap[type].title}</Themed.Text>
        <TouchableOpacity style={styles.saveButton} activeOpacity={0.7} onPress={handleSave}>
          <Themed.Text style={styles.buttonText}>Save</Themed.Text>
        </TouchableOpacity>
      </View>
      {renderContent()}
    </ScrollView>
  )
  // #endregion
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingTop: 16
  },
  title: {
    fontSize: 20,
    paddingHorizontal: 16,
    fontWeight: '500'
  },
  input: {
    fontSize: 16,
    paddingHorizontal: 16,
    height: Constants.screenHeight * 0.13
  },
  saveButton: {
    marginRight: 12,
    borderRadius: 30,
    alignItems: 'center',
    padding: 5
  },
  buttonText: {
    fontWeight: '600',
    color: '#007AFF'
  }
})

export default EditProfileScreen
