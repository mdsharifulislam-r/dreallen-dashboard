import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Plus, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { FormField } from '@/components/forms/FormField'
import { PageHeader } from '@/components/ui/PageHeader'
import { ErrorState } from '@/components/ui/ErrorState'
import {
  useCreatePackageMutation,
  useGetPackagesQuery,
  useUpdatePackageMutation,
} from '@/features/packages/packagesApi'
import type { PackagePayload, PackageRecurring } from '@/features/packages/types'
import { getErrorMessage, getFieldErrors } from '@/utils/errors'

const emptyForm: PackagePayload = {
  label: '',
  productId: '',
  referenceId: '',
  features: [''],
  recommended: false,
  price: 0,
  recurring: 'monthly',
}

export function PackageFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const packages = useGetPackagesQuery()
  const [createPackage, createState] = useCreatePackageMutation()
  const [updatePackage, updateState] = useUpdatePackageMutation()
  const [form, setForm] = useState<PackagePayload>(emptyForm)
  const fieldErrors = getFieldErrors(createState.error ?? updateState.error)
  const existing = packages.data?.data.find((item) => item._id === id)

  useEffect(() => {
    if (existing) {
      setForm({
        label: existing.label,
        productId: existing.productId,
        referenceId: existing.referenceId,
        features: existing.features.length ? existing.features : [''],
        recommended: existing.recommended,
        price: existing.price,
        recurring: (existing.recurring as PackageRecurring) || 'monthly',
      })
    }
  }, [existing])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const body: PackagePayload = {
      ...form,
      features: form.features.map((item) => item.trim()).filter(Boolean),
      price: Number(form.price),
    }
    try {
      if (isEdit && id) {
        const result = await updatePackage({ id, body }).unwrap()
        toast.success(result.message ?? 'Package updated')
      } else {
        const result = await createPackage(body).unwrap()
        toast.success(result.message ?? 'Package created')
      }
      navigate('/admin/packages')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (isEdit && packages.isError) {
    return <ErrorState message={getErrorMessage(packages.error)} onRetry={() => void packages.refetch()} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Edit Package' : 'Create Package'}
        description={isEdit ? 'Update subscription package details and pricing.' : 'Add a new subscription tier for users.'}
      />
      <Card className="bg-[#161310] max-w-2xl p-6">
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-[#26201a] pb-2">
              Package Details
            </p>
            <FormField
              label="Label"
              required
              value={form.label}
              onChange={(event) => setForm({ ...form, label: event.target.value })}
              error={fieldErrors.label}
              placeholder="e.g. Pro Monthly"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Product ID"
                required
                value={form.productId}
                onChange={(event) => setForm({ ...form, productId: event.target.value })}
                error={fieldErrors.productId}
                placeholder="apple_product_id"
              />
              <FormField
                label="Reference ID"
                required
                value={form.referenceId}
                onChange={(event) => setForm({ ...form, referenceId: event.target.value })}
                error={fieldErrors.referenceId}
                placeholder="store_ref_id"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Price"
                type="number"
                step="0.01"
                required
                value={String(form.price)}
                onChange={(event) => setForm({ ...form, price: Number(event.target.value) })}
                error={fieldErrors.price}
                placeholder="9.99"
              />
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-stone-300">Billing Cycle</p>
                <Select
                  value={form.recurring}
                  onChange={(event) => setForm({ ...form, recurring: event.target.value as PackageRecurring })}
                  className="w-full"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="buisness">Business</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Recommended Toggle */}
          <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-[#29221b] bg-[#120f0d] px-4 py-3 hover:border-amber-500/30 transition-all">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={form.recommended}
                onChange={(event) => setForm({ ...form, recommended: event.target.checked })}
              />
              <div className={`h-5 w-9 rounded-full transition-all ${form.recommended ? 'bg-amber-500' : 'bg-stone-700'}`} />
              <div className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.recommended ? 'translate-x-4' : ''}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Recommended</p>
              <p className="text-xs text-stone-400">Highlight this package as the best value option</p>
            </div>
          </label>

          {/* Features */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-[#26201a] pb-2">
              Features
            </p>
            {form.features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <input
                  className="flex-1 rounded-xl border border-[#29221b] bg-[#120f0d] px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-600 outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  value={feature}
                  placeholder={`Feature ${index + 1}`}
                  onChange={(event) => {
                    const next = [...form.features]
                    next[index] = event.target.value
                    setForm({ ...form, features: next })
                  }}
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, features: form.features.filter((_, i) => i !== index) })}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-900/40 bg-red-950/30 text-red-400 transition hover:bg-red-900/50 hover:text-red-300 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              className="gap-2 hover:border-amber-500/40 hover:text-amber-400"
              onClick={() => setForm({ ...form, features: [...form.features, ''] })}
            >
              <Plus className="h-4 w-4" />
              Add Feature
            </Button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-[#26201a]">
            <Button type="button" variant="secondary" onClick={() => navigate('/admin/packages')}>
              Cancel
            </Button>
            <Button type="submit" variant="amber-pill" loading={createState.isLoading || updateState.isLoading}>
              {isEdit ? 'Save Changes' : 'Create Package'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
