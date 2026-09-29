import { useEffect, useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { JoditEditor } from '@/components/forms/JoditEditor'
import { PageHeader } from '@/components/ui/PageHeader'
import { ErrorState } from '@/components/ui/ErrorState'
import { useGetSettingQuery, useUpdateSettingMutation } from '@/features/settings/settingsApi'
import type { SettingKey } from '@/features/settings/types'
import { getErrorMessage } from '@/utils/errors'

const tabs: Array<{ key: SettingKey; label: string }> = [
  { key: 'about', label: 'About Us' },
  { key: 'privacy-policy', label: 'Privacy Policy' },
  { key: 'terms-of-services', label: 'Terms of Service' },
]

export function SettingsPage() {
  const [active, setActive] = useState<SettingKey>('about')
  const { data, isFetching, isError, error, refetch } = useGetSettingQuery(active)
  const [updateSetting, { isLoading }] = useUpdateSettingMutation()
  const [description, setDescription] = useState('')

  useEffect(() => {
    setDescription(data?.data?.description ?? '')
  }, [data, active])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      const result = await updateSetting({ key: active, description }).unwrap()
      toast.success(result.message ?? 'Settings saved successfully')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const activeTabLabel = tabs.find((t) => t.key === active)?.label ?? 'Page'

  return (
    <div className="space-y-6 max-w-7xl">
      <PageHeader
        title="App Settings"
        description="Manage About, Privacy Policy, and Terms of Service using Jodit WYSIWYG rich text editor."
      />

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#231d18] pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`rounded-xl px-5 py-2.5 text-xs font-extrabold transition-all duration-200 cursor-pointer ${
              active === tab.key
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md shadow-amber-500/20'
                : 'border border-[#29221b] bg-[#161310] text-stone-400 hover:border-amber-500/40 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card className="p-6 bg-[#161310]">
        {isError ? (
          <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-6 xl:grid-cols-2">
              {/* Jodit Text Editor */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-white">
                  Edit {activeTabLabel} Content
                </label>
                <JoditEditor
                  value={description}
                  onChange={setDescription}
                  placeholder={`Write ${activeTabLabel} content here...`}
                />
              </div>

              {/* Live Preview */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-white">Live HTML Preview</label>
                <div className="h-[468px] overflow-y-auto rounded-xl border border-[#29221b] bg-[#0c0a09] p-5 text-sm text-stone-200">
                  {description ? (
                    <div
                      className="rich-preview prose prose-invert max-w-none text-stone-200"
                      dangerouslySetInnerHTML={{ __html: description }}
                    />
                  ) : (
                    <p className="text-xs italic text-stone-500">
                      No content available. Use the Jodit editor on the left to write and format content.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#231d18]">
              <Button
                type="submit"
                variant="amber-pill"
                className="px-6 py-2.5"
                loading={isLoading || isFetching}
              >
                Save {activeTabLabel}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}

