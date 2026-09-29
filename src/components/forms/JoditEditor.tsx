import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    Jodit: any
  }
}

interface JoditEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function JoditEditor({ value, onChange, placeholder, className = '' }: JoditEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const editorInstanceRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(Boolean(window.Jodit))

  useEffect(() => {
    if (window.Jodit) {
      setIsLoaded(true)
      return
    }

    // Load Jodit CSS
    const linkId = 'jodit-cdn-css'
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link')
      link.id = linkId
      link.rel = 'stylesheet'
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/jodit/3.24.9/jodit.min.css'
      document.head.appendChild(link)
    }

    // Load Jodit JS
    const scriptId = 'jodit-cdn-js'
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jodit/3.24.9/jodit.min.js'
      script.async = true
      script.onload = () => setIsLoaded(true)
      document.head.appendChild(script)
    } else {
      const existingScript = document.getElementById(scriptId) as HTMLScriptElement
      existingScript.addEventListener('load', () => setIsLoaded(true))
    }
  }, [])

  useEffect(() => {
    if (!isLoaded || !textareaRef.current || editorInstanceRef.current) return

    try {
      const jodit = window.Jodit.make(textareaRef.current, {
        theme: 'dark',
        minHeight: 350,
        height: 420,
        placeholder: placeholder || 'Type your content here...',
        toolbarButtonSize: 'middle',
        buttons: [
          'source',
          '|',
          'bold',
          'italic',
          'underline',
          'strikethrough',
          '|',
          'font',
          'fontsize',
          'brush',
          'paragraph',
          '|',
          'ul',
          'ol',
          '|',
          'align',
          'outdent',
          'indent',
          '|',
          'link',
          'image',
          'table',
          '|',
          'undo',
          'redo',
          '|',
          'fullsize',
        ],
        uploader: {
          insertImageAsBase64URI: true,
        },
        style: {
          background: '#161310',
          color: '#f5f5f4',
          borderColor: '#29221b',
        },
      })

      if (value) {
        jodit.value = value
      }

      jodit.events.on('change', () => {
        onChange(jodit.value)
      })

      editorInstanceRef.current = jodit
    } catch (e) {
      console.error('Failed to initialize Jodit Editor:', e)
    }

    return () => {
      if (editorInstanceRef.current) {
        try {
          editorInstanceRef.current.destruct()
        } catch {
          // ignore cleanup errors
        }
        editorInstanceRef.current = null
      }
    }
  }, [isLoaded])

  useEffect(() => {
    if (editorInstanceRef.current && value !== editorInstanceRef.current.value) {
      editorInstanceRef.current.value = value
    }
  }, [value])

  return (
    <div className={`w-full overflow-hidden rounded-xl border border-[#29221b] bg-[#161310] ${className}`}>
      {!isLoaded && (
        <div className="flex h-64 items-center justify-center text-sm font-semibold text-stone-400">
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          Loading Jodit Text Editor...
        </div>
      )}
      <textarea
        ref={textareaRef}
        defaultValue={value}
        className={isLoaded ? 'hidden' : 'w-full min-h-64 bg-[#161310] p-4 text-stone-200 outline-none'}
      />
    </div>
  )
}
