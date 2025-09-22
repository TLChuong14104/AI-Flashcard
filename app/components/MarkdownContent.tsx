import ReactMarkdown, { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { useEffect, ReactNode } from 'react'

interface MarkdownContentProps {
  content: string
}

interface CodeProps {
  inline?: boolean
  className?: string
  children: ReactNode
  [key: string]: unknown
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  useEffect(() => {
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block as HTMLElement)
    })
  }, [content])

  const CodeBlock = ({ inline, className, children, ...props }: CodeProps) => {
    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : ''
    const code = String(children).replace(/\n$/, '')

    // Inline code
    if (inline) {
      const isPath = code.includes('/') || code.includes('\\')
      const isGitCommand = /^git\s+\w+/.test(code)
      const isCommand = isGitCommand || code.includes('-')
      return (
        <code
          className={`font-mono ${
            isPath || isCommand
              ? 'px-1.5 py-0.5 bg-blue-100 text-blue-800'
              : 'px-1.5 py-0.5 bg-gray-100 text-gray-800'
          } rounded text-[0.9em]`}
          {...props}
        >
          {code}
        </code>
      )
    }

    // Code block nhiều dòng
    let detectedLanguage = language
    if (!detectedLanguage) {
      try {
        const result = hljs.highlightAuto(code)
        detectedLanguage = result.language || ''
      } catch (e) {
        console.warn('Không thể tự động phát hiện ngôn ngữ code:', e)
      }
    }

    return (
      <div className="relative group my-4">
        {detectedLanguage && (
          <div className="absolute right-2 top-2 text-xs text-gray-300 bg-gray-700 px-2 py-1 rounded opacity-90">
            {detectedLanguage}
          </div>
        )}
        <pre className="!mt-0 bg-gray-900 rounded-lg overflow-hidden">
          <code
            className={`block overflow-x-auto p-4 text-[0.95em] text-gray-100 ${
              detectedLanguage ? `language-${detectedLanguage}` : ''
            }`}
            {...props}
          >
            {code}
          </code>
        </pre>
      </div>
    )
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code: CodeBlock,
      } as Components}
    >
      {content}
    </ReactMarkdown>
  )
}
