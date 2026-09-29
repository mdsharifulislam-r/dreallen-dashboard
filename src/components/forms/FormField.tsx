import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface BaseFieldProps {
  label: string
  error?: string
  hint?: string
}

interface InputFieldProps extends BaseFieldProps, InputHTMLAttributes<HTMLInputElement> {
  as?: 'input'
}

interface TextareaFieldProps extends BaseFieldProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  as: 'textarea'
}

interface SelectFieldProps extends BaseFieldProps, SelectHTMLAttributes<HTMLSelectElement> {
  as: 'select'
  children: ReactNode
}

type FormFieldProps = InputFieldProps | TextareaFieldProps | SelectFieldProps

export function FormField(props: FormFieldProps) {
  const { label, error, hint, as = 'input', id, className = '', ...rest } = props
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  const shared =
    'w-full rounded-xl border bg-[#161310] text-stone-100 placeholder-stone-500 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 ' +
    (error ? 'border-red-500/70' : 'border-[#29221b]')

  return (
    <label className="block space-y-1.5" htmlFor={fieldId}>
      <span className="text-sm font-semibold text-stone-300">{label}</span>
      {as === 'textarea' ? (
        <textarea
          id={fieldId}
          className={`${shared} min-h-36 ${className}`}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : as === 'select' ? (
        <select id={fieldId} className={`${shared} ${className}`} {...(rest as SelectHTMLAttributes<HTMLSelectElement>)}>
          {(props as SelectFieldProps).children}
        </select>
      ) : (
        <input id={fieldId} className={`${shared} ${className}`} {...(rest as InputHTMLAttributes<HTMLInputElement>)} />
      )}
      {hint && !error ? <p className="text-xs text-stone-400">{hint}</p> : null}
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </label>
  )
}
