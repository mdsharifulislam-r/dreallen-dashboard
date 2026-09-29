import type { ListQuery } from '@/types/api'

export interface UserRecord {
  _id: string
  name?: string
  email?: string
  user_name?: string
  image?: string
  role?: string
  status?: string          // 'active' | 'suspended' | 'blocked'
  isSuspended?: boolean
  isBlocked?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface UsersQuery extends ListQuery {
  fields?: string
}

export interface UserStatistics {
  totalUser?: number
  totalSongs?: number
  totalVideos?: number
  totalBTs?: number
  totalRavanue?: number
}

export interface MonthlyUserStat {
  month: string
  newUsers: number
  cumulativeNewUsers: number
}

export interface MonthlyEarningStat {
  month: string
  earning: number
}

export interface UserGrowthResponse {
  year: number
  userStats: MonthlyUserStat[]
}

export interface EarningResponse {
  year: number
  totalEarning: number
  earningStats: MonthlyEarningStat[]
}
