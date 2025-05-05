import { BASE_URL } from '@/constants/server'
import {
  AuthContextProps,
  LoginInfoResponse,
  LoginInfoResponseSchema,
  SessionSchema,
  SessionType,
  SignUpBody,
  UserTier
} from '@/types/auth.type'
import api from '@/utils/api'
import { useStorageState } from '@/utils/useStorageState'
import axios, { AxiosInstance } from 'axios'
import * as SecureStore from 'expo-secure-store'
import { createContext, PropsWithChildren, useContext, useRef } from 'react'
import { AppState } from 'react-native'
import { z } from 'zod'

const AuthContext = createContext<AuthContextProps>({
  signInWithCredential: async (): Promise<void> => {},
  signUpWithCredential: async (): Promise<void> => {},
  signOut: async (): Promise<void> => {},
  session: null,
  apiWithToken: axios.create({
    baseURL: BASE_URL,
    headers: {
      Accept: "application/json",
    },
  }),
  refreshAccessTokenRequest: async (): Promise<string | null> => Promise.resolve(null),
  useWebSocketWithToken: async (): Promise<WebSocket | null> => Promise.resolve(null),
  isSocketOpen: (): boolean => false
})

export function parsePublicUrl(filePath: string) {
  return `${BASE_URL}/public/${filePath}`
}

export function isAuthenticated(session: AuthContextProps) {
  if (process.env.EXPO_PUBLIC_BYPASS_LOGIN == 'true') return true
  return session.session && session.session.refreshExpireTime > Math.floor(Date.now() / 1000)
}

export function useSession() {
  const value = useContext(AuthContext)
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />')
    }
  }
  return value
}

export function SessionProvider({ children }: PropsWithChildren) {
  const appState = useRef(AppState.currentState)
  const [[isLoading, session], setSession] = useStorageState<SessionType>('session')
  const createdSockets = useRef<Map<string, WebSocket>>(new Map())

  const apiWithToken: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
      Accept: "application/json",
    },
  });

  apiWithToken.interceptors.request.use(
    async (config) => {
      let accessToken = await refreshAccessTokenRequest()
      if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`
      }
      return config
    },
    (error) => {
      console.error('apiWithToken Interceptor Error:', error)
      return Promise.reject(error)
    }
  )

  apiWithToken.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config
      const accessToken = await SecureStore.getItemAsync('accessToken')
      if (accessToken && error.response?.status == 401 && !originalRequest._retry) {
        originalRequest._retry = true
        console.log('apiWithToken Interceptor: Refreshing token due to 401')
        const refreshToken = await SecureStore.getItemAsync('refreshToken')
        if (refreshToken) {
          try {
            const response = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
              headers: {  
                Authorization: `Bearer ${refreshToken}`
              }
            })

            const loginData = {
              refreshToken,
              refreshExpireTime: session?.refreshExpireTime,
              ...response.data
            }
            const data = LoginInfoResponseSchema.parse(loginData)
            originalRequest.headers['Authorization'] = `Authorization ${data.accessToken}`
            console.log('apiWithToken Interceptor: Token refreshed. Retrying.')
            return apiWithToken(originalRequest)
          } catch (refreshError) {
            console.error('apiWithToken Interceptor: Refresh token failed:', refreshError)
          }
        }
      }
      return Promise.reject(error)
    }
  )

  const saveTokens = async (data: LoginInfoResponse) => {
    if (session) {
      const sessionObj = session as { [key: string]: any }
      const keys = Object.keys(sessionObj)
      keys.forEach((key) => {
        if (key in data) {
          sessionObj[key] = data[key as keyof LoginInfoResponse]
        }
      })
      setSession(sessionObj as SessionType)
    } else {
      try {
        const parsedData = SessionSchema.parse(data)
        setSession(parsedData)
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error(error.errors)
        } else {
          console.error(error)
        }
      }
    }

    if ('refreshToken' in data && data.refreshExpireTime) {
      await SecureStore.setItemAsync('refreshToken', data.refreshToken as string)
    }

    if ('accessToken' in data && data.accessExpireTime) {
      await SecureStore.setItemAsync('accessToken', data.accessToken as string)
    }
  }

  const signInWithCredential = async (emailUsernamePhone: string, password: string) => {
    try {
      const response = await api.post('/auth/login', {
        emailUsernamePhone,
        password
      })
      const data = LoginInfoResponseSchema.parse(response.data)
      await saveTokens(data)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Login failed: ', error)
      } else {
        console.log('Login Error:', error)
      }
      throw error
    }
  }

  const signUpWithCredential = async (formData: SignUpBody) => {
    try {
      const signUpResponse = await api.post('/auth/register', formData)
      const loginResponse = await api.post('/auth/login', {
        emailUsernamePhone: formData.email,
        password: formData.password
      })
      const data = LoginInfoResponseSchema.parse(loginResponse.data)
      await saveTokens(data)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('Server Error:', error.response?.data)
          throw new Error(error.response.data.detail || 'An error occurred. Please try again.')
        } else if (error.request) {
          console.error('Network error:', error.request)
          throw new Error('Network error. Please check your connection.')
        }
      } else {
        console.error('Sign Up Error:', error)
        throw error
      }
    }
  }

  const signOut = async () => {
    const refreshTokenValue = SecureStore.getItem('refreshToken')
    await SecureStore.deleteItemAsync('accessToken')
    await SecureStore.deleteItemAsync('refreshToken')
    setSession(null)

    if (!refreshTokenValue) {
      console.log('No refresh token found')
      return
    }

    createdSockets.current.forEach((ws) => {
      ws.close(1000)
    })
    createdSockets.current.clear()

    // TODO here
    await api
      .post('/auth/token/revoke', {}, {
        headers: {
          'Authorization': `Bearer ${refreshTokenValue}`
        }
      })
      .then((response) => {
        if (response.status == 204) {
          console.log('Token revoked successfully!')
        } else {
          throw new Error('Failed to revoke token with status code: ' + response.status)
        }
      })
      .catch((error) => {
        console.error('Failed to revoke token:', error)
      })
  }

  const refreshAccessTokenRequest = async (): Promise<string | null> => {
    try {
      let accessToken = await SecureStore.getItemAsync('accessToken')
      const refreshToken = await SecureStore.getItemAsync('refreshToken')

      if (!session || !refreshToken) {
        console.log('No session or refreshToken found')
        return null
      }

      const accessTokenExpireTime = session?.accessExpireTime
      if (accessToken && accessTokenExpireTime && isAccessTokenExpired(session)) {
        // Access token expired, request again
        const response = await api.post('/auth/token/refresh', {}, {
          headers: {
            'Authorization': `Bearer ${refreshToken}`
          }
        })

        const loginData = { ...response.data }

        if (!loginData.refreshToken && !loginData.refreshExpireTime) {
          loginData.refreshToken = refreshToken
          loginData.refreshExpireTime = session.refreshExpireTime
        }

        await saveTokens(loginData)

        return loginData.accessToken
      } else {
        return accessToken
      }
    } catch (error) {
      await signOut()
      return null
    }
  }

  function isAccessTokenExpired(sessionObj: any) {
    const accessExpireTime = sessionObj.accessExpireTime
    const currentTimeInSeconds = Math.floor(Date.now() / 1000)
    return currentTimeInSeconds >= accessExpireTime
  }

  function isSocketOpen(path: string) {
    return createdSockets.current.get(path)?.readyState == WebSocket.OPEN
  }

  async function useWebSocketWithToken(path: string, forceNew: boolean = false) {
    if (createdSockets.current.get(path) && !forceNew) {
      const ws = createdSockets.current.get(path)
      if (ws?.readyState == WebSocket.OPEN) {
        return ws
      }
    }

    let accessToken = await refreshAccessTokenRequest()
    if (accessToken) {
      // @ts-ignore
      const ws = new WebSocket(`ws://${BASE_URL!.split('://')[1]}${path}`, null, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      ws.onerror = (e) => {
        console.error('Web Socket error:', e)
      }
      if (process.env.EXPO_PUBLIC_MODE === 'debug') {
        ws.onopen = () => {
          console.log('WebSocket opened')
        }
      }
      createdSockets.current.set(path, ws)
      return ws
    }
    return null
  }

  return (
    <AuthContext.Provider
      value={{
        signInWithCredential,
        signUpWithCredential,
        signOut,
        session,
        apiWithToken,
        refreshAccessTokenRequest,
        useWebSocketWithToken,
        isSocketOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
