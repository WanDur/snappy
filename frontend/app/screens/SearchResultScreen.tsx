import { useEffect, useState } from 'react'
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Header } from '@react-navigation/elements'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { IconSymbol } from '@/components/ui/IconSymbol'
import { Constants } from '@/constants'
import { useTheme } from '@/hooks'
import { Themed, JobCard, CheckBox, FilterSortButton } from '@/components'
//import { useSession } from '@/contexts/auth'

type ButtonType = 'recommended' | 'salary' | 'views' | 'posted'
type SortFunctions = {
  up: () => void
  down: () => void
}

const buttonConfig: Record<ButtonType, { isSortable: boolean }> = {
  recommended: { isSortable: false },
  salary: { isSortable: true },
  views: { isSortable: true },
  posted: { isSortable: true }
}

const SearchResultScreen = () => {
  const router = useRouter()
  //const session = useSession()

  const { colors } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  const [result, setResult] = useState<JobResponse[]>([])
  const { _query } = useLocalSearchParams()
  const query = JSON.parse(_query.toString())

  const [activeButton, setActiveButton] = useState<ButtonType | null>('recommended')
  const [sortDirections, setSortDirections] = useState<Partial<Record<ButtonType, 'up' | 'down'>>>({
    salary: 'up',
    views: 'up',
    posted: 'up'
  })

  const filterMap: Record<ButtonType, SortFunctions> = {
    salary: {
      up: () => setResult(result.sort((a, b) => a.salary - b.salary)),
      down: () => setResult(result.sort((a, b) => b.salary - a.salary))
    },
    views: {
      up: () => {},
      down: () => {}
    },
    posted: {
      up: () => setResult(result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())),
      down: () => setResult(result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    },
    recommended: {
      up: () => {},
      down: () => {}
    }
  }

  const handlePress = (button: ButtonType, newSortDirection?: 'up' | 'down') => {
    if (activeButton !== button) {
      setActiveButton(button)
      if (buttonConfig[button].isSortable && newSortDirection) {
        setSortDirections((prev) => ({ ...prev, [button]: newSortDirection }))
        filterMap[button][newSortDirection]()
      }
    } else {
      if (buttonConfig[button].isSortable && newSortDirection) {
        setSortDirections((prev) => ({ ...prev, [button]: newSortDirection }))
        filterMap[button][newSortDirection]()
      }
    }
  }

  const fetchSearchResults = async () => {
    const res = await session.apiWithToken.post('/panda/job/fetch', {
      count: 10,
      skip: 0,
      expectedSalary: query.salary,
      title: query.query,
      jobTypes: query.jobTypes,
      filterTags: query.tagIds[0] != 'all' ? query.tagIds : []
    })
    setResult(res.data)
  }

  useEffect(() => {
    setIsLoading(true)
    fetchSearchResults()
    setIsLoading(false)
  }, [_query])

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: colors.background },
          headerLeft: () => (
            <TouchableOpacity
              style={{ marginLeft: 8, flexDirection: 'row', alignItems: 'center' }}
              onPress={() => router.back()}
            >
              <IconSymbol
                name="chevron.backward"
                weight="medium"
                size={24}
                color={Constants.isIOS ? colors.blue : colors.text}
                style={{ marginRight: 10 }}
              />
            </TouchableOpacity>
          ),
          header: ({ options, route }) => (
            <View>
              <Header {...options} title="Search results" />
              <ScrollView
                style={{
                  backgroundColor: colors.background,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderColor: colors.borderColor
                }}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  gap: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  backgroundColor: colors.background
                }}
              >
                {(['recommended', 'salary', 'views', 'posted'] as ButtonType[]).map((button, index) => (
                  <FilterSortButton
                    key={`${colors.text}-${index}`}
                    name={button.slice(0, 1).toUpperCase() + button.slice(1)}
                    selected={activeButton === button}
                    isSortable={buttonConfig[button].isSortable}
                    sortDirection={buttonConfig[button].isSortable ? sortDirections[button] : undefined}
                    onPress={(newDirection) => handlePress(button, newDirection)}
                  />
                ))}
              </ScrollView>
            </View>
          )
        }}
      />
      <ScrollView contentContainerStyle={{ flex: 1, padding: 16 }}>
        {isLoading ? (
          <ActivityIndicator />
        ) : session.session ? (
          result.length > 0 ? (
            result.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <Text style={{ marginTop: 32, textAlign: 'center' }}>No results found</Text>
          )
        ) : (
          <></>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16
  },
  sectionBtn: {
    backgroundColor: 'grey',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  sectionBtnSelected: {
    backgroundColor: 'grey',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  sectionBtnText: {
    color: '#000',
    fontWeight: '500'
  },
  sectionBtnTextSelected: {
    color: '#fff',
    fontWeight: '500'
  },
  card: {
    borderRadius: 8,
    backgroundColor: 'grey',
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 40
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600'
  },
  cardDesc: {
    fontSize: 14,
    color: '#000'
  },
  cardAuthor: {
    fontSize: 14,
    color: '#666'
  }
})

export default SearchResultScreen
