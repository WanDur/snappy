import { Redirect, Tabs } from 'expo-router'
import { Platform } from 'react-native'

import { useTheme } from '@/hooks'
import TabBarBackground from '@/components/ui/TabBarBackground'
import { TabBarIcon } from '@/components/navigation/TabBarIcon'

export default function TabLayout() {
  const { colors } = useTheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        headerShown: false,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute'
          },
          default: {}
        })
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'people' : 'people-outline'} color={color} />
        }}
      />
      <Tabs.Screen
        name="album"
        options={{
          title: 'Albums',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'book' : 'book-outline'} color={color} />
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
        }}
      />
    </Tabs>
  )
}
