export type PackageRecurring = 'monthly' | 'yearly' | 'buisness'

export interface Package {
  _id: string
  productId: string
  referenceId: string
  label: string
  status?: string
  features: string[]
  recommended: boolean
  price: number
  recurring: PackageRecurring | string
  createdAt?: string
  updatedAt?: string
}

export interface PackagePayload {
  label: string
  productId: string
  referenceId: string
  features: string[]
  recommended: boolean
  price: number
  recurring: PackageRecurring
}
