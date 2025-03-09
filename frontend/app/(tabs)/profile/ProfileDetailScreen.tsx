import { View, StyleSheet, TouchableOpacity, Alert, Keyboard } from 'react-native'
import { useState, useRef, useMemo, useEffect, memo } from 'react'
import { useRouter } from 'expo-router'
import { FontAwesome6 } from '@expo/vector-icons'
import { useHeaderHeight } from '@react-navigation/elements'
import { BottomSheetFlatList, BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet'
import { useTranslation } from 'react-i18next'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import * as Crypto from 'expo-crypto'

import { useTheme, useProfileStore } from '@/hooks'
import { ExpandableRow, Themed, Dot } from '@/components'
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground'
import { ViewOrDeleteDocument } from '@/components/profile'
import { BlurredBackground, BlurredHandle } from '@/components/bottomsheetUI'
// import { useSession } from '@/contexts/auth'
import { ProfileData } from '@/types'
import { formatTag } from '@/utils'

const LanguageListItem = memo(
  ({
    item,
    isChecked,
    disabled,
    onPress
  }: {
    item: { code: string; name: string }
    isChecked: boolean
    disabled: boolean
    onPress: () => void
  }) => (
    <View style={{ flexDirection: 'row', paddingVertical: 12 }}>
      <BouncyCheckbox
        isChecked={isChecked}
        disabled={disabled}
        onPress={onPress}
        fillColor={disabled ? 'grey' : '#007AFF'}
        textComponent={
          <Themed.Text style={{ marginLeft: 8, width: '100%', paddingVertical: 6 }}>{item.name}</Themed.Text>
        }
      />
    </View>
  )
)

const ProfileDetailScreen = () => {
  const router = useRouter()
  //const session = useSession()
  const { t } = useTranslation()

  const { profile, updateProfile, updateFirstName, updateLastName } = useProfileStore()
  const { user, language, education, resume, skills, workExp } = profile
  const tabBarHeight = useBottomTabOverflow() || 0
  const headerHeight = useHeaderHeight()
  const { colors } = useTheme()

  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const [selectedLang, setSelectedLang] = useState({
    primary: '',
    secondary: '',
    additional: ['']
  })
  const [editLangType, setEditLangType] = useState<'primary' | 'secondary' | 'additional'>('primary')
  const [firstName, setFirstName] = useState(user.realName!.firstName)
  const [lastName, setLastName] = useState(user.realName!.lastName)
  const [search, setSearch] = useState('')

  const filteredLanguages = useMemo(() => {
    return
    return LANGUAGES.filter((lang) => lang.name.toLowerCase().startsWith(search.toLowerCase()))
  }, [search])

  const fetchUserProfile = async () => {
    return
    try {
      const profileRes = await session.apiWithToken.get(`/panda/user/provider/${user._id}/profile?self=true`)
      const loadedProfile: ProfileData = {
        user: profile.user,
        aboutDesc: profileRes.data.aboutDesc,
        workExp: profileRes.data.workExp.map((exp: any) => {
          return {
            ...exp,
            id: Crypto.randomUUID().slice(0, 8),
            startDate: exp.startDate.split('T')[0],
            endDate: exp.endDate && exp.endDate.split('T')[0]
          }
        }),
        education: profileRes.data.education.map((exp: any) => {
          return {
            ...exp,
            id: Crypto.randomUUID().slice(0, 8),
            startDate: exp.startDate.split('T')[0],
            endDate: exp.endDate && exp.endDate.split('T')[0]
          }
        }),
        skills: profileRes.data.skills,
        language: profileRes.data.language,
        resume: profileRes.data.resume.url == '' ? undefined : profileRes.data.resume
      }
      updateProfile(loadedProfile)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchUserProfile()
  }, [])

  // set which language type are going to edit and open the bottom sheet for language selection
  const openLanguageBottomSheet = (_type: 'primary' | 'secondary' | 'additional') => {
    setEditLangType(_type)
    setSelectedLang({
      primary: language.primary || '',
      secondary: language.secondary || '',
      additional: language.additional || []
    })
    bottomSheetModalRef.current?.present()
  }

  const handleSelectItem = (code: string) => {
    setSelectedLang((prev) => {
      if (editLangType === 'primary') {
        // Toggle if the same is selected
        return {
          ...prev,
          primary: prev.primary === code ? '' : code
        }
      }
      if (editLangType === 'secondary') {
        return {
          ...prev,
          secondary: prev.secondary === code ? '' : code
        }
      }
      // additional
      const isSelected = prev.additional.includes(code)
      if (isSelected) {
        // remove from array
        return {
          ...prev,
          additional: prev.additional.filter((c) => c !== code)
        }
      } else {
        // add to array if not full
        if (prev.additional.length >= 3) {
          return prev // do nothing if already at max
        }
        return {
          ...prev,
          additional: [...prev.additional, code]
        }
      }
    })
  }

  const onLangSave = async () => {
    return
    try {
      await session.apiWithToken.post('/panda/user/provider/profile/edit', {
        language: selectedLang
      })
      updateLanguage(selectedLang)
      bottomSheetModalRef.current?.close()
    } catch (error) {
      Alert.alert('Error', 'Failed to save language selection')
    }
  }

  const saveFirstName = async () => {
    return
    updateFirstName(firstName!)
    await session.apiWithToken.post('/panda/user/provider/profile/edit', { firstName })
  }

  const saveLastName = async () => {
    return
    if (lastName?.trim() === '') {
      setLastName(user.realName!.lastName)
      return
    }
    updateLastName(lastName)
    await session.apiWithToken.post('/panda/user/provider/profile/edit', { lastName })
  }

  const isItemChecked = (code: string) => {
    if (editLangType === 'primary') {
      return selectedLang.primary === code
    } else if (editLangType === 'secondary') {
      return selectedLang.secondary === code
    }
    // additional
    return selectedLang.additional.includes(code)
  }

  const isItemDisabled = (code: string) => {
    if (editLangType === 'primary' || editLangType === 'secondary') {
      // If an item is already checked, and this one is not it, disable
      const someOtherSelected =
        (editLangType === 'primary' && !!selectedLang.primary && selectedLang.primary !== code) ||
        (editLangType === 'secondary' && !!selectedLang.secondary && selectedLang.secondary !== code)
      return someOtherSelected
    }
    // additional => up to 3
    const isChecked = selectedLang.additional.includes(code)
    if (!isChecked && selectedLang.additional.length >= 3) {
      return true
    }
    return false
  }

  const renderItem = ({ item }: { item: { code: string; name: string } }) => {
    const checked = isItemChecked(item.code)
    const disabled = isItemDisabled(item.code)

    return (
      <LanguageListItem
        item={item}
        isChecked={checked}
        disabled={disabled}
        onPress={() => {
          if (!checked) {
            Keyboard.dismiss()
          }
          handleSelectItem(item.code)
        }}
      />
    )
  }

  // get language name from its code
  const getLanguageLabel = (code: string) => {
    return
    const found = LANGUAGES.find((lang) => lang.code === code)
    return found ? found.name : code
  }

  return (
    <Themed.ScrollView
      style={{ padding: 16, paddingTop: 0 }}
      contentContainerStyle={{ paddingBottom: tabBarHeight + 16 }}
      keyboardDismissMode="on-drag"
    >
      <ExpandableRow iconName="at" title="Basic details" hideButton isExpanded isEdit>
        <View style={{ marginLeft: 4, marginBottom: 10 }}>
          <Themed.Text style={{ marginBottom: 4 }}>Username</Themed.Text>
          <Themed.Text style={{ fontSize: 18, fontWeight: '600' }}>{`@${
            profile.user.username || 'guest'
          }`}</Themed.Text>
        </View>

        <View style={{ flexDirection: 'row' }}>
          <Themed.TextInput
            label="Last name"
            value={lastName}
            onChangeText={setLastName}
            onBlur={saveLastName}
            containerStyle={{ flex: 1, marginRight: 10 }}
          />
          <Themed.TextInput
            label="First name"
            value={firstName}
            onChangeText={setFirstName}
            onBlur={saveFirstName}
            containerStyle={{ flex: 1, marginLeft: 10 }}
          />
        </View>
      </ExpandableRow>
      <ExpandableRow
        iconName="person-outline"
        title="About me"
        onAddPress={() => {
          router.push({ pathname: '/(tabs)/profile/EditProfileScreen', params: { _type: 'about' } })
        }}
        isEdit
      >
        {profile.aboutDesc ? <Themed.Text style={{ fontSize: 14 }}>{profile.aboutDesc}</Themed.Text> : null}
      </ExpandableRow>
      <ExpandableRow
        iconName="briefcase-outline"
        title="Work experience"
        onAddPress={() => {
          router.push({ pathname: '/(tabs)/profile/EditProfileScreen', params: { _type: 'workexp' } })
        }}
      >
        {workExp && workExp.length > 0
          ? workExp.map((workexp, index) => (
              <View key={workexp.id} style={{ padding: 2, marginBottom: index === workExp.length - 1 ? 6 : 16 }}>
                <View style={styles.titleBtnRow}>
                  <Themed.Text style={{ fontSize: 17, fontWeight: '600' }}>{workexp.title}</Themed.Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      router.push({
                        pathname: '/(tabs)/profile/EditProfileScreen',
                        params: { _type: 'edit_workexp', _metaData: JSON.stringify(workexp.id) }
                      })
                    }
                  >
                    <FontAwesome6 name="edit" size={20} color={colors.text} style={{ marginRight: 6 }} />
                  </TouchableOpacity>
                </View>

                <Themed.Text style={{ fontSize: 16, color: 'grey', marginBottom: 2 }}>{workexp.company}</Themed.Text>
                <Themed.Text style={{ fontSize: 14, color: 'grey' }}>
                  {workexp.startDate} - {workexp.endDate || 'Present'}
                </Themed.Text>
              </View>
            ))
          : null}
      </ExpandableRow>
      <ExpandableRow
        iconName="school-outline"
        title="Education"
        onAddPress={() => {
          router.push({ pathname: '/(tabs)/profile/EditProfileScreen', params: { _type: 'education' } })
        }}
      >
        {education && education.length > 0
          ? education.map((edu, index) => (
              <View key={edu.id} style={{ padding: 2, marginBottom: index === education.length - 1 ? 6 : 16 }}>
                <View style={styles.titleBtnRow}>
                  <Themed.Text style={{ fontSize: 17, fontWeight: '600' }}>{edu.field}</Themed.Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      router.push({
                        pathname: '/(tabs)/profile/EditProfileScreen',
                        params: { _type: 'edit_education', _metaData: JSON.stringify(edu.id) }
                      })
                    }
                  >
                    <FontAwesome6 name="edit" size={20} color={colors.text} style={{ marginRight: 6 }} />
                  </TouchableOpacity>
                </View>

                <Themed.Text style={{ fontWeight: '600', marginBottom: 6 }}>{edu.level}</Themed.Text>
                <Themed.Text style={{ fontSize: 16, color: 'grey', marginBottom: 2 }}>{edu.institution}</Themed.Text>
                <Themed.Text style={{ fontSize: 14, color: 'grey' }}>
                  {edu.startDate} - {edu.endDate || 'Present'}
                </Themed.Text>
              </View>
            ))
          : null}
      </ExpandableRow>
      <ExpandableRow
        iconName="aperture-outline"
        title="Skills"
        onAddPress={() => {
          router.push({ pathname: '/(tabs)/profile/EditProfileScreen', params: { _type: 'skills' } })
        }}
      >
        {skills.length > 0
          ? skills.map((skill, index) => (
              <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Dot size={6} />
                <Themed.Text style={{ fontSize: 14, fontWeight: 500 }}>{formatTag(t, skill)}</Themed.Text>
              </View>
            ))
          : null}
      </ExpandableRow>
      <ExpandableRow iconName="language" title="Language">
        <View style={{ marginVertical: 6, gap: 14 }}>
          <View>
            <View style={styles.titleBtnRow}>
              <Themed.Text style={{ color: 'grey', fontSize: 16 }}>Primary:</Themed.Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => openLanguageBottomSheet('primary')}>
                <FontAwesome6 name="edit" size={20} color={colors.text} style={{ marginRight: 6 }} />
              </TouchableOpacity>
            </View>
            {language.primary !== '' && (
              <Themed.Text style={{ fontSize: 17, fontWeight: '600' }}>
                {getLanguageLabel(language.primary)}
              </Themed.Text>
            )}
          </View>

          <View>
            <View style={styles.titleBtnRow}>
              <Themed.Text style={{ color: 'grey', fontSize: 16 }}>Secondary:</Themed.Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => openLanguageBottomSheet('secondary')}>
                <FontAwesome6 name="edit" size={20} color={colors.text} style={{ marginRight: 6 }} />
              </TouchableOpacity>
            </View>
            {language.secondary && (
              <Themed.Text style={{ fontSize: 17, fontWeight: '600' }}>
                {getLanguageLabel(language.secondary)}
              </Themed.Text>
            )}
          </View>

          <View>
            <View style={styles.titleBtnRow}>
              <Themed.Text style={{ color: 'grey', fontSize: 16 }}>Additional:</Themed.Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => openLanguageBottomSheet('additional')}>
                <FontAwesome6 name="edit" size={20} color={colors.text} style={{ marginRight: 6 }} />
              </TouchableOpacity>
            </View>
            {language.additional && (
              <Themed.Text style={{ fontSize: 17, fontWeight: '600' }}>
                {language.additional.map((code) => getLanguageLabel(code)).join(', ')}
              </Themed.Text>
            )}
          </View>
        </View>
      </ExpandableRow>
      <ExpandableRow
        iconName="clipboard-outline"
        title="Resume"
        subtitle={resume ? `Uploaded on: ${new Date(resume.uploadedAt).toLocaleString()}` : undefined}
        onAddPress={() => {
          router.push({ pathname: '/(tabs)/profile/EditProfileScreen', params: { _type: 'resume' } })
        }}
        isUpload
      >
        {resume ? <ViewOrDeleteDocument resume={resume} /> : null}
      </ExpandableRow>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={['70%']}
        topInset={headerHeight}
        handleComponent={BlurredHandle}
        backgroundComponent={BlurredBackground}
        backdropComponent={() => (
          <View onTouchEnd={() => bottomSheetModalRef.current?.close()} style={[StyleSheet.absoluteFill]} />
        )}
        onDismiss={() => setSearch('')}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16 }}>
          <Themed.Text style={styles.title}>Edit {editLangType} language</Themed.Text>
          <TouchableOpacity style={styles.saveButton} activeOpacity={0.7} onPress={onLangSave}>
            <Themed.Text style={styles.buttonText}>Save</Themed.Text>
          </TouchableOpacity>
        </View>

        <View style={{ padding: 16, paddingTop: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <BottomSheetTextInput
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              maxLength={5}
              placeholder="Search"
              style={{
                flex: 3,
                padding: 10,
                borderRadius: 10,
                fontSize: 16,
                borderWidth: StyleSheet.hairlineWidth * 2,
                color: colors.text,
                borderColor: colors.borderColor
              }}
            />
            <TouchableOpacity
              onPress={() => {
                setSelectedLang({
                  primary: '',
                  secondary: '',
                  additional: []
                })
                setSearch('')
              }}
              activeOpacity={0.7}
            >
              <Themed.Text style={{ fontSize: 15 }}>Reset all</Themed.Text>
            </TouchableOpacity>
          </View>

          <View style={{ paddingTop: 10 }} />
          <BottomSheetFlatList
            data={filteredLanguages}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: tabBarHeight * 2 }}
            ItemSeparatorComponent={() => (
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.borderColor }} />
            )}
          />
        </View>
      </BottomSheetModal>
    </Themed.ScrollView>
  )
}

const styles = StyleSheet.create({
  titleBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: 20,
    paddingHorizontal: 16,
    fontWeight: '500'
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

export default ProfileDetailScreen
