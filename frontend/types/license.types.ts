import { User } from './user.types'

interface License {
  key: string
  days: number
  redeemed: boolean
  redeemedAt?: Date
  redeemedBy?: User
}
