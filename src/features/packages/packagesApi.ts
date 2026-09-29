import { baseApi } from '@/services/baseApi'
import type { ApiSuccess } from '@/types/api'
import type { Package, PackagePayload } from '@/features/packages/types'

export const packagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPackages: builder.query<ApiSuccess<Package[]>, void>({
      query: () => '/package',
      providesTags: (result) =>
        result?.data?.length
          ? [
              ...result.data.map((item) => ({ type: 'Package' as const, id: item._id })),
              { type: 'PackageList' as const, id: 'LIST' },
            ]
          : [{ type: 'PackageList' as const, id: 'LIST' }],
    }),
    createPackage: builder.mutation<ApiSuccess<Package>, PackagePayload>({
      query: (body) => ({
        url: '/package',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'PackageList', id: 'LIST' }],
    }),
    updatePackage: builder.mutation<ApiSuccess<Package>, { id: string; body: PackagePayload }>({
      query: ({ id, body }) => ({
        url: `/package/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Package', id },
        { type: 'PackageList', id: 'LIST' },
      ],
    }),
    deletePackage: builder.mutation<ApiSuccess<unknown>, string>({
      query: (id) => ({
        url: `/package/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'PackageList', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetPackagesQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation,
} = packagesApi
