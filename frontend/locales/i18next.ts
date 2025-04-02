import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

import { useStorage } from '@/hooks'
import { Constants } from '../constants'
import en from './en.json'
import zh_HK from '../locales/zh-HK.json'

export const languageResources = {
  en: { translation: en },
  zh_HK: { translation: zh_HK }
}

const initializeI18next = async () => {
  const { getSettings } = useStorage()

  const deviceLanguage: string = Constants.deviceLng
  const storedLanguage = await getSettings()
  let language = storedLanguage?.language ?? 'en'

  if (deviceLanguage.includes('zh')) {
    language = 'zh_HK'
  } else if (deviceLanguage.includes('en')) {
    language = 'en'
  } else {
    console.info(`Device language (${deviceLanguage}) is not supported, fallback to English.`)
  }

  i18next.use(initReactI18next).init({
    lng: language,
    compatibilityJSON: 'v4',
    fallbackLng: 'en',
    resources: languageResources
  })
}

export default initializeI18next
