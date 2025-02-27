import { View, Platform, Button, Keyboard, ScrollView } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { Stack } from 'expo-router'
import * as Notifications from 'expo-notifications'
import { useTranslation } from 'react-i18next'

import { Constants } from '@/constants'
import { useTheme } from '@/hooks'
import { registerPushNotificationAsync } from '@/utils/registerPushNotificationAsync'
import { Themed } from '@/components'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
})

const NotificationScreen = () => {
  const { t } = useTranslation()
  const { colors } = useTheme()

  const [expoPushToken, setExpoPushToken] = useState('')
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([])
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined)
  const notificationListener = useRef<Notifications.EventSubscription>()
  const responseListener = useRef<Notifications.EventSubscription>()
  const scrollViewRef = useRef<ScrollView | null>(null)

  const [pushTime, setPushTime] = useState('2')
  const [title, setTitle] = useState("You've got mail! 📬")
  const [body, setBody] = useState('Here is the notification body')

  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (countdown <= 0 && timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [countdown])

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
      scrollViewRef.current?.scrollTo({ y: 600, animated: true })
    })

    return () => {
      keyboardDidShowListener.remove()
    }
  }, [])

  useEffect(() => {
    registerPushNotificationAsync().then((value) => setChannels(value ?? []))

    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then((value) => setChannels(value ?? []))
    }
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification)
    })

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response)
    })

    return () => {
      notificationListener.current && Notifications.removeNotificationSubscription(notificationListener.current)
      responseListener.current && Notifications.removeNotificationSubscription(responseListener.current)
    }
  }, [])

  async function handleSchedule() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: { data: 'goes here' }
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: parseInt(pushTime)
      }
    })
    startCountdown()
  }

  function startCountdown() {
    const totalSeconds = parseFloat(pushTime)
    const endTime = Date.now() + totalSeconds * 1000
    setCountdown(totalSeconds)

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    timerRef.current = setInterval(() => {
      const remaining = (endTime - Date.now()) / 1000
      const next = parseFloat(remaining.toFixed(2))

      setCountdown(next > 0 ? next : 0)

      if (next <= 0 && timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }, 30) // update every 30 ms
  }

  return (
    <>
      <Themed.ScrollView ref={scrollViewRef} style={{ padding: 16, paddingTop: 0 }} keyboardDismissMode="on-drag">
        <Stack.Screen
          options={{
            headerTitle: t('notifications'),
            headerBackTitle: t('settings')
          }}
        />
        <Themed.Text style={{ fontWeight: 'bold' }}>======= Region remote push =======</Themed.Text>
        <Themed.Text>Your expo push token: {expoPushToken}</Themed.Text>
        <Themed.Text>{`Channels: ${JSON.stringify(
          channels.map((c) => c.id),
          null,
          2
        )}`}</Themed.Text>
        <Themed.Text style={{ fontWeight: 'bold' }}>==============================</Themed.Text>

        <View style={{ marginTop: 30 }}>
          <Themed.Text style={{ fontWeight: 'bold' }}>====== Region notification data ======</Themed.Text>
          <Themed.Text>Title: {notification && notification.request.content.title} </Themed.Text>
          <Themed.Text>Body: {notification && notification.request.content.body}</Themed.Text>
          <Themed.Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Themed.Text>
          <Themed.Text style={{ fontWeight: 'bold' }}>==============================</Themed.Text>
        </View>

        <View style={{ marginTop: 30 }}>
          <Themed.TextInput
            label={`Push ${pushTime} seconds later`}
            value={pushTime}
            onChangeText={setPushTime}
            onBlur={() => {
              if (pushTime.trim() === '') {
                setPushTime('2')
              }
              setPushTime(Number(pushTime).toString())
            }}
            keyboardType="number-pad"
            maxLength={3}
          />
          <Themed.TextInput
            label="Notification title"
            value={title}
            onChangeText={setTitle}
            onBlur={() => {
              if (title.trim() === '') {
                setTitle("You've got mail! 📬")
              }
            }}
          />
          <Themed.TextInput
            label="Notification body"
            value={body}
            onChangeText={setBody}
            onBlur={() => {
              if (body.trim() === '') {
                setBody('Here is the notification body')
              }
            }}
          />
        </View>

        <Button title="schedule notification" onPress={handleSchedule} disabled={countdown !== 0} />
      </Themed.ScrollView>
      <Themed.View
        style={{
          position: 'absolute',
          bottom: 50,
          width: 100,
          left: Constants.screenWidth / 2 - 100 / 2,
          borderRadius: 30,
          justifyContent: 'center',
          alignItems: 'center',
          height: 50,
          backgroundColor: countdown === 0 ? '#007AFF' : colors.secondaryBg
        }}
      >
        <Themed.Text type="subtitle">{countdown.toFixed(2)}</Themed.Text>
      </Themed.View>
    </>
  )
}

export default NotificationScreen
