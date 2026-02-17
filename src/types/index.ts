export type Industry = 
  | 'ecommerce'
  | 'saas'
  | 'healthcare'
  | 'fintech'
  | 'realestate'
  | 'logistics'
  | 'education'
  | 'hospitality'

export interface IndustryConfig {
  id: Industry
  name: string
  icon: string
  emoji: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    gradient: string
    background: string
    card: string
    text: string
  }
  metrics: Metric[]
  features: Feature[]
}

export interface Metric {
  id: string
  label: string
  value: string
  change: number
  icon: string
  trend: 'up' | 'down'
}

export interface Feature {
  id: string
  name: string
  description: string
  icon: string
  path: string
}

export interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}
