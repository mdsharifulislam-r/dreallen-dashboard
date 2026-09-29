import type { SortableListQuery } from '@/types/api'

export interface Video {
  _id: string
  title: string
  artist: string
  cover_image?: string
  type?: string
  releaseDate?: string
  duration?: string
  viewsCount?: number
  playCount?: number
  video?: string
  createdAt?: string
  updatedAt?: string
  isFeatured?: boolean
  avgRating?: number
  ratingCount?: number
  rating?: number
  isFavorite?: boolean
}

export type VideosQuery = SortableListQuery
