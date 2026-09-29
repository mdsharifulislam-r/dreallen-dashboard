import type { SortableListQuery } from '@/types/api'

export interface Song {
  _id: string
  title: string
  artist: string
  cover_image?: string
  releaseDate?: string
  type?: string
  duration?: string
  viewsCount?: number
  playCount?: number
  audio?: string
  createdAt?: string
  updatedAt?: string
  averageRating?: number
  avgRating?: number
  ratingCount?: number
  rating?: number
  isFavorite?: boolean
}

export type SongsQuery = SortableListQuery
