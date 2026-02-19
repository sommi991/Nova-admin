import { format, formatDistance, formatRelative, formatDuration, intervalToDuration } from 'date-fns'
import { enUS, es, fr, de, it, pt, ja, zh, ar, ru } from 'date-fns/locale'

// ============================================================================
// TYPES
// ============================================================================

export type Locale = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ja' | 'zh' | 'ar' | 'ru'
export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY' | 'INR' | 'BRL'
export type Unit = 'metric' | 'imperial'
export type DateFormat = 'short' | 'medium' | 'long' | 'full' | 'relative' | 'iso'
export type NumberFormat = 'decimal' | 'percent' | 'scientific' | 'engineering'

export interface FormatOptions {
  locale?: Locale
  currency?: Currency
  unit?: Unit
  precision?: number
  compact?: boolean
  signDisplay?: 'auto' | 'always' | 'exceptZero' | 'never'
  notation?: 'standard' | 'scientific' | 'engineering' | 'compact'
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  minimumIntegerDigits?: number
  useGrouping?: boolean
}

// ============================================================================
// LOCALE MAPPING
// ============================================================================

const LOCALE_MAP: Record<Locale, Locale> = {
  en: 'en',
  es: 'es',
  fr: 'fr',
  de: 'de',
  it: 'it',
  pt: 'pt',
  ja: 'ja',
  zh: 'zh',
  ar: 'ar',
  ru: 'ru'
}

const DATE_FNS_LOCALE: Record<Locale, any> = {
  en: enUS,
  es: es,
  fr: fr,
  de: de,
  it: it,
  pt: pt,
  ja: ja,
  zh: zh,
  ar: ar,
  ru: ru
}

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF',
  CNY: '¥',
  INR: '₹',
  BRL: 'R$'
}

const CURRENCY_NAMES: Record<Currency, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan',
  INR: 'Indian Rupee',
  BRL: 'Brazilian Real'
}

// ============================================================================
// CURRENCY FORMATTER
// ============================================================================

export class CurrencyFormatter {
  private static instances: Map<string, Intl.NumberFormat> = new Map()

  static format(
    amount: number,
    currency: Currency = 'USD',
    options: FormatOptions = {}
  ): string {
    const { locale = 'en', compact = false, signDisplay = 'auto' } = options
    
    const cacheKey = `${locale}-${currency}-${compact}-${signDisplay}`
    
    if (!this.instances.has(cacheKey)) {
      this.instances.set(
        cacheKey,
        new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          notation: compact ? 'compact' : 'standard',
          signDisplay,
          minimumFractionDigits: options.minimumFractionDigits ?? (compact ? 0 : 2),
          maximumFractionDigits: options.maximumFractionDigits ?? (compact ? 1 : 2)
        })
      )
    }

    return this.instances.get(cacheKey)!.format(amount)
  }

  static formatWithSymbol(amount: number, currency: Currency): string {
    const symbol = CURRENCY_SYMBOLS[currency]
    return `${symbol}${amount.toFixed(2)}`
  }

  static formatWithName(amount: number, currency: Currency): string {
    const name = CURRENCY_NAMES[currency]
    return `${amount.toFixed(2)} ${name}`
  }

  static formatRange(
    min: number,
    max: number,
    currency: Currency = 'USD',
    options: FormatOptions = {}
  ): string {
    return `${this.format(min, currency, options)} - ${this.format(max, currency, options)}`
  }

  static formatDelta(
    current: number,
    previous: number,
    currency: Currency = 'USD',
    options: FormatOptions = {}
  ): string {
    const delta = current - previous
    const formatted = this.format(Math.abs(delta), currency, {
      ...options,
      signDisplay: 'never'
    })
    
    if (delta > 0) return `+${formatted}`
    if (delta < 0) return `-${formatted}`
    return formatted
  }

  static formatChange(
    current: number,
    previous: number,
    options: FormatOptions = {}
  ): { value: string; percentage: string; direction: 'up' | 'down' | 'stable' } {
    const delta = current - previous
    const percentage = previous !== 0 ? (delta / previous) * 100 : 0
    
    return {
      value: this.formatDelta(current, previous, 'USD', options),
      percentage: NumberFormatter.formatPercent(percentage / 100, options),
      direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'stable'
    }
  }
}

// ============================================================================
// NUMBER FORMATTER
// ============================================================================

export class NumberFormatter {
  private static instances: Map<string, Intl.NumberFormat> = new Map()

  static format(
    value: number,
    options: FormatOptions = {}
  ): string {
    const {
      locale = 'en',
      precision = 2,
      compact = false,
      notation = 'standard',
      signDisplay = 'auto',
      minimumFractionDigits,
      maximumFractionDigits,
      minimumIntegerDigits,
      useGrouping = true
    } = options

    const cacheKey = `${locale}-${precision}-${compact}-${notation}-${signDisplay}`
    
    if (!this.instances.has(cacheKey)) {
      this.instances.set(
        cacheKey,
        new Intl.NumberFormat(locale, {
          notation,
          compactDisplay: compact ? 'short' : 'standard',
          signDisplay,
          minimumFractionDigits: minimumFractionDigits ?? precision,
          maximumFractionDigits: maximumFractionDigits ?? precision,
          minimumIntegerDigits,
          useGrouping
        })
      )
    }

    return this.instances.get(cacheKey)!.format(value)
  }

  static formatCompact(value: number, precision: number = 1): string {
    return this.format(value, { compact: true, precision })
  }

  static formatPercent(value: number, options: FormatOptions = {}): string {
    return new Intl.NumberFormat(options.locale || 'en', {
      style: 'percent',
      minimumFractionDigits: options.minimumFractionDigits ?? 1,
      maximumFractionDigits: options.maximumFractionDigits ?? 2,
      signDisplay: options.signDisplay
    }).format(value)
  }

  static formatOrdinal(value: number, locale: Locale = 'en'): string {
    const pr = new Intl.PluralRules(locale, { type: 'ordinal' })
    const suffixes: Record<string, string> = {
      en: { one: 'st', two: 'nd', few: 'rd', other: 'th' },
      es: { one: 'º', other: 'º' },
      fr: { one: 'er', other: 'e' },
      de: { one: '.', other: '.' },
      it: { one: 'º', other: 'º' },
      pt: { one: 'º', other: 'º' }
    }
    
    const rule = pr.select(value)
    return `${value}${suffixes[locale]?.[rule] || suffixes.en[rule]}`
  }

  static formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
  }

  static formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    const parts = []
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)

    return parts.join(' ')
  }

  static formatDistance(meters: number, unit: Unit = 'metric'): string {
    if (unit === 'metric') {
      if (meters < 1000) return `${Math.round(meters)} m`
      return `${(meters / 1000).toFixed(2)} km`
    } else {
      const feet = meters * 3.28084
      if (feet < 5280) return `${Math.round(feet)} ft`
      return `${(feet / 5280).toFixed(2)} mi`
    }
  }

  static formatWeight(grams: number, unit: Unit = 'metric'): string {
    if (unit === 'metric') {
      if (grams < 1000) return `${grams} g`
      return `${(grams / 1000).toFixed(2)} kg`
    } else {
      const ounces = grams * 0.035274
      if (ounces < 16) return `${ounces.toFixed(1)} oz`
      return `${(ounces / 16).toFixed(2)} lb`
    }
  }

  static formatTemperature(celsius: number, unit: Unit = 'metric'): string {
    if (unit === 'metric') {
      return `${Math.round(celsius)}°C`
    } else {
      const fahrenheit = (celsius * 9/5) + 32
      return `${Math.round(fahrenheit)}°F`
    }
  }
}

// ============================================================================
// DATE FORMATTER
// ============================================================================

export class DateFormatter {
  static format(
    date: Date | string | number,
    formatStr: string = 'PPP',
    locale: Locale = 'en'
  ): string {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date
    
    return format(dateObj, formatStr, { locale: DATE_FNS_LOCALE[locale] })
  }

  static formatShort(date: Date | string | number, locale: Locale = 'en'): string {
    return this.format(date, 'PP', locale)
  }

  static formatMedium(date: Date | string | number, locale: Locale = 'en'): string {
    return this.format(date, 'PPP', locale)
  }

  static formatLong(date: Date | string | number, locale: Locale = 'en'): string {
    return this.format(date, 'PPPP', locale)
  }

  static formatRelative(
    date: Date | string | number,
    baseDate: Date | string | number = new Date(),
    locale: Locale = 'en'
  ): string {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    const baseObj = typeof baseDate === 'string' || typeof baseDate === 'number' ? new Date(baseDate) : baseDate
    
    return formatRelative(dateObj, baseObj, { locale: DATE_FNS_LOCALE[locale] })
  }

  static formatDistance(
    date: Date | string | number,
    baseDate: Date | string | number = new Date(),
    options: { addSuffix?: boolean; includeSeconds?: boolean } = {},
    locale: Locale = 'en'
  ): string {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    const baseObj = typeof baseDate === 'string' || typeof baseDate === 'number' ? new Date(baseDate) : baseDate
    
    return formatDistance(dateObj, baseObj, {
      ...options,
      locale: DATE_FNS_LOCALE[locale]
    })
  }

  static formatDistanceToNow(
    date: Date | string | number,
    options: { addSuffix?: boolean; includeSeconds?: boolean } = {},
    locale: Locale = 'en'
  ): string {
    return this.formatDistance(date, new Date(), options, locale)
  }

  static formatDuration(
    start: Date | string | number,
    end: Date | string | number,
    format: 'short' | 'long' = 'short'
  ): string {
    const startObj = typeof start === 'string' || typeof start === 'number' ? new Date(start) : start
    const endObj = typeof end === 'string' || typeof end === 'number' ? new Date(end) : end
    
    const duration = intervalToDuration({ start: startObj, end: endObj })
    
    const parts = []
    if (duration.years) parts.push(`${duration.years}y`)
    if (duration.months) parts.push(`${duration.months}mo`)
    if (duration.days) parts.push(`${duration.days}d`)
    if (duration.hours) parts.push(`${duration.hours}h`)
    if (duration.minutes) parts.push(`${duration.minutes}m`)
    if (duration.seconds) parts.push(`${duration.seconds}s`)
    
    return parts.join(' ')
  }

  static formatRange(
    start: Date | string | number,
    end: Date | string | number,
    format: 'short' | 'medium' | 'long' = 'medium',
    locale: Locale = 'en'
  ): string {
    const startStr = this.format(start, format === 'short' ? 'PP' : format === 'medium' ? 'PPP' : 'PPPP', locale)
    const endStr = this.format(end, format === 'short' ? 'PP' : format === 'medium' ? 'PPP' : 'PPPP', locale)
    
    return `${startStr} – ${endStr}`
  }

  static formatTimeAgo(
    date: Date | string | number,
    options: { short?: boolean } = {}
  ): string {
    const now = new Date()
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    const diffMs = now.getTime() - dateObj.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)
    const diffWeek = Math.floor(diffDay / 7)
    const diffMonth = Math.floor(diffDay / 30)
    const diffYear = Math.floor(diffDay / 365)

    if (options.short) {
      if (diffSec < 60) return `${diffSec}s`
      if (diffMin < 60) return `${diffMin}m`
      if (diffHour < 24) return `${diffHour}h`
      if (diffDay < 7) return `${diffDay}d`
      if (diffWeek < 4) return `${diffWeek}w`
      if (diffMonth < 12) return `${diffMonth}mo`
      return `${diffYear}y`
    }

    if (diffSec < 60) return 'just now'
    if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`
    if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`
    if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`
    if (diffWeek < 4) return `${diffWeek} week${diffWeek === 1 ? '' : 's'} ago`
    if (diffMonth < 12) return `${diffMonth} month${diffMonth === 1 ? '' : 's'} ago`
    return `${diffYear} year${diffYear === 1 ? '' : 's'} ago`
  }

  static formatISODate(date: Date | string | number): string {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    return dateObj.toISOString()
  }

  static formatISODateOnly(date: Date | string | number): string {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    return dateObj.toISOString().split('T')[0]
  }

  static formatTime(date: Date | string | number, format: '12h' | '24h' = '24h'): string {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    const hours = dateObj.getHours()
    const minutes = dateObj.getMinutes()
    const seconds = dateObj.getSeconds()

    if (format === '12h') {
      const period = hours >= 12 ? 'PM' : 'AM'
      const hour12 = hours % 12 || 12
      return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  static formatDateTime(
    date: Date | string | number,
    format: 'short' | 'medium' | 'long' = 'medium',
    locale: Locale = 'en'
  ): string {
    const dateStr = this.format(date, format === 'short' ? 'PP' : format === 'medium' ? 'PPP' : 'PPPP', locale)
    const timeStr = this.formatTime(date)
    return `${dateStr} at ${timeStr}`
  }

  static formatRelativeDateTime(
    date: Date | string | number,
    baseDate: Date | string | number = new Date(),
    locale: Locale = 'en'
  ): string {
    const diff = this.formatDistance(date, baseDate, { addSuffix: true }, locale)
    const timeStr = this.formatTime(date)
    return `${diff} at ${timeStr}`
  }

  static formatCalendar(
    date: Date | string | number,
    locale: Locale = 'en'
  ): string {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (dateObj.toDateString() === today.toDateString()) {
      return `Today at ${this.formatTime(dateObj)}`
    }
    if (dateObj.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${this.formatTime(dateObj)}`
    }
    if (dateObj.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${this.formatTime(dateObj)}`
    }

    return this.formatDateTime(dateObj, 'medium', locale)
  }

  static formatWeekday(date: Date | string | number, format: 'short' | 'long' = 'long'): string {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', { weekday: format })
  }

  static formatMonth(date: Date | string | number, format: 'short' | 'long' = 'long'): string {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', { month: format })
  }

  static formatQuarter(date: Date | string | number): string {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    const month = dateObj.getMonth()
    const quarter = Math.floor(month / 3) + 1
    const year = dateObj.getFullYear()
    return `Q${quarter} ${year}`
  }

  static formatWeek(date: Date | string | number): string {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    const start = new Date(dateObj)
    start.setDate(start.getDate() - start.getDay())
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    
    return `Week of ${this.formatShort(start)}`
  }
}

// ============================================================================
// STRING FORMATTER
// ============================================================================

export class StringFormatter {
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  static capitalizeWords(str: string): string {
    return str.split(' ').map(word => this.capitalize(word)).join(' ')
  }

  static titleCase(str: string): string {
    const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i
    return str.toLowerCase().replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, (match, index, title) => {
      if (index > 0 && index + match.length !== title.length && match.search(smallWords) > -1 && title.charAt(index - 2) !== ':' && (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') && title.charAt(index - 1).search(/[^\s-]/) < 0) {
        return match.toLowerCase()
      }
      return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase()
    })
  }

  static camelCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => index === 0 ? word.toLowerCase() : word.toUpperCase())
      .replace(/\s+/g, '')
  }

  static pascalCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase())
      .replace(/\s+/g, '')
  }

  static snakeCase(str: string): string {
    return str
      .replace(/\s+/g, '_')
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .toLowerCase()
  }

  static kebabCase(str: string): string {
    return str
      .replace(/\s+/g, '-')
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase()
  }

  static truncate(str: string, length: number, suffix: string = '...'): string {
    if (str.length <= length) return str
    return str.substring(0, length - suffix.length) + suffix
  }

  static truncateWords(str: string, words: number, suffix: string = '...'): string {
    const wordArray = str.split(' ')
    if (wordArray.length <= words) return str
    return wordArray.slice(0, words).join(' ') + suffix
  }

  static slugify(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  static pluralize(count: number, singular: string, plural?: string): string {
    if (count === 1) return singular
    return plural || singular + 's'
  }

  static ordinalSuffix(num: number): string {
    const j = num % 10
    const k = num % 100
    if (j === 1 && k !== 11) return 'st'
    if (j === 2 && k !== 12) return 'nd'
    if (j === 3 && k !== 13) return 'rd'
    return 'th'
  }

  static formatPhone(phone: string, country: 'US' | 'UK' | 'default' = 'US'): string {
    const cleaned = phone.replace(/\D/g, '')
    
    if (country === 'US' && cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
    }
    
    if (country === 'UK' && cleaned.length === 11) {
      return `+44 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 11)}`
    }
    
    return phone
  }

  static formatSSN(ssn: string): string {
    const cleaned = ssn.replace(/\D/g, '')
    if (cleaned.length === 9) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 9)}`
    }
    return ssn
  }

  static formatCreditCard(card: string): string {
    const cleaned = card.replace(/\D/g, '')
    const match = cleaned.match(/.{1,4}/g)
    return match ? match.join(' ') : card
  }

  static obfuscateEmail(email: string): string {
    const [local, domain] = email.split('@')
    if (!domain) return email
    
    const obfuscatedLocal = local.length > 2
      ? local.slice(0, 2) + '*'.repeat(local.length - 2)
      : local + '*'.repeat(2)
    
    const [domainName, tld] = domain.split('.')
    const obfuscatedDomain = domainName.length > 2
      ? domainName.slice(0, 2) + '*'.repeat(domainName.length - 2)
      : domainName + '*'.repeat(2)
    
    return `${obfuscatedLocal}@${obfuscatedDomain}.${tld}`
  }

  static obfuscatePhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length >= 10) {
      return '*'.repeat(cleaned.length - 4) + cleaned.slice(-4)
    }
    return '*'.repeat(cleaned.length)
  }

  static highlight(text: string, query: string): string {
    if (!query) return text
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  }

  static template(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key]?.toString() || '')
  }
}

// ============================================================================
// ADDRESS FORMATTER
// ============================================================================

export class AddressFormatter {
  static format(address: {
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }): string {
    const parts = [address.line1]
    if (address.line2) parts.push(address.line2)
    parts.push(`${address.city}, ${address.state} ${address.postalCode}`)
    parts.push(address.country)
    return parts.join('\n')
  }

  static formatOneLine(address: {
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }): string {
    const parts = [address.line1]
    if (address.line2) parts.push(address.line2)
    parts.push(`${address.city}, ${address.state} ${address.postalCode}, ${address.country}`)
    return parts.join(' ')
  }

  static formatShort(address: {
    city: string
    state: string
    country: string
  }): string {
    return `${address.city}, ${address.state}, ${address.country}`
  }
}

// ============================================================================
// DURATION FORMATTER
// ============================================================================

export class DurationFormatter {
  static format(seconds: number, format: 'short' | 'long' = 'short'): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (format === 'short') {
      const parts = []
      if (hours > 0) parts.push(`${hours}h`)
      if (minutes > 0) parts.push(`${minutes}m`)
      if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)
      return parts.join(' ')
    }

    const parts = []
    if (hours > 0) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`)
    if (minutes > 0) parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`)
    if (secs > 0 || parts.length === 0) parts.push(`${secs} second${secs === 1 ? '' : 's'}`)
    return parts.join(', ')
  }

  static formatHuman(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`
    }
    return `${secs}s`
  }

  static formatDigital(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
}

// ============================================================================
// MAIN FORMATTER EXPORT
// ============================================================================

export const formatters = {
  currency: CurrencyFormatter,
  number: NumberFormatter,
  date: DateFormatter,
  string: StringFormatter,
  address: AddressFormatter,
  duration: DurationFormatter
}

export default formatters
