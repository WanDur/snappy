/**
 * @param format
 * * *month*: mmmm (November) | mmm (Nov) | mm (11)
 * *  *day*: dd (01)
 * * *year*: yyyy (2021) | yy (21)
 *
 * @default format='mmm dd, yyyy' (Nov 01, 2021)
 */
export const formatDate = (date: Date, format: string = 'mmm dd, yyyy') => {
  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthNamesLong = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]

  const day = date.getDate().toString().padStart(2, '0')
  const monthIndex = date.getMonth()
  const monthShort = monthNamesShort[monthIndex]
  const monthLong = monthNamesLong[monthIndex]
  const yearFull = date.getFullYear().toString()
  const yearShort = yearFull.slice(-2)

  return format
    .replace('mmmm', monthLong)
    .replace('mmm', monthShort)
    .replace('mm', (monthIndex + 1).toString().padStart(2, '0'))
    .replace('dd', day)
    .replace('yyyy', yearFull)
    .replace('yy', yearShort)
}

export const formatChatDate = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
  return formatDate(date, 'yyyy.mm.dd')
}

export const isBetween = (x: number, min: number, max: number) => {
  return x >= min && x <= max
}

export const formatBytes = (bytes: number | string) => {
  bytes = typeof bytes === 'string' ? parseInt(bytes) : bytes
  if (bytes == 0) return '0 bytes'
  const k = 1000
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * return a random element from an array
 */
export const pickRandom = <T>(arr: T[]) => {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * returns a random integer between min and max (inclusive)
 */
export const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
