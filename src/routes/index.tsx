import Editor from '@monaco-editor/react'
import { createFileRoute } from '@tanstack/react-router'
import DOMPurify from 'dompurify'
import { configureMonacoTailwindcss, tailwindcssData } from 'monaco-tailwind'
import type {
  CssCompilerResult,
  TailwindHandler,
} from 'monaco-tailwind/TailwindHandler'
import { useEffect, useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import {
  defaultBodyContent,
  defaultTailwindConfig,
  wrapWithHtmlTemplate,
} from '../lib/templates'

export const Route = createFileRoute('/')({
  component: App,
})

export function extractAllClasses(bodyContent: string): string[] {
  const regex = /class="([^"]*)"/g
  const classes: string[] = []
  let match: RegExpExecArray | null

  while ((match = regex.exec(bodyContent)) !== null) {
    const classNames = match[1].split(/\s+/).filter(Boolean)
    classes.push(...classNames)
  }

  return classes
}

function App() {
  const [bodyContent, setBodyContent] = useState(defaultBodyContent)
  const [tailwindConfig, setTailwindConfig] = useState(defaultTailwindConfig)
  const [previewKey, setPreviewKey] = useState(0)
  const [activeTab, setActiveTab] = useState<'html' | 'config'>('html')
  const [tailwindHandler, setTailwindHandler] = useState<TailwindHandler>()
  const [fullHtml, setFullHtml] = useState('')

  useEffect(() => {
    let isMounted = true

    const compileHtml = async () => {
      const sanitizedBody = DOMPurify.sanitize(bodyContent, {
        ADD_TAGS: ['script', 'style', 'link'],
        ADD_ATTR: [
          'onclick',
          'onload',
          'onerror',
          'class',
          'id',
          'href',
          'src',
        ],
      })

      if (!tailwindHandler) {
        if (isMounted) {
          setFullHtml(wrapWithHtmlTemplate(sanitizedBody, ''))
        }
        return
      }

      let compiledCss: CssCompilerResult | undefined
      try {
        const allClasses = extractAllClasses(bodyContent)
        compiledCss = await tailwindHandler.buildCss(
          tailwindConfig,
          allClasses,
          {},
        )
      } catch (error) {
        console.error('Failed to compile CSS:', error)
      }

      if (isMounted) {
        setFullHtml(wrapWithHtmlTemplate(sanitizedBody, compiledCss?.css ?? ''))
      }
    }

    compileHtml()

    return () => {
      isMounted = false
    }
  }, [bodyContent, tailwindConfig, tailwindHandler])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewKey((prev) => prev + 1)
    }, 3000)

    return () => clearTimeout(timer)
  }, [fullHtml])

  const editorValue = activeTab === 'html' ? bodyContent : tailwindConfig
  const editorLanguage = activeTab === 'html' ? 'html' : 'javascript'

  const handleEditorChange = (value: string | undefined) => {
    if (activeTab === 'html') {
      setBodyContent(value || '')
    } else {
      setTailwindConfig(value || '')
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <PanelGroup direction="horizontal" className="flex-1">
        <Panel defaultSize={50} minSize={20}>
          <div className="h-full flex flex-col">
            <div className="bg-gray-800 text-white flex border-b border-gray-700">
              <button
                className={`px-4 py-2 text-sm transition-colors ${
                  activeTab === 'html'
                    ? 'bg-gray-700 border-b-2 border-blue-500'
                    : 'hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab('html')}
              >
                HTML
              </button>
              <button
                className={`px-4 py-2 text-sm transition-colors ${
                  activeTab === 'config'
                    ? 'bg-gray-700 border-b-2 border-blue-500'
                    : 'hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab('config')}
              >
                CSS
              </button>
            </div>
            <div className="flex-1">
              <Editor
                height="100%"
                language={editorLanguage}
                value={editorValue}
                beforeMount={(monaco) => {
                  monaco.languages.css.cssDefaults.setOptions({
                    data: {
                      dataProviders: {
                        tailwindcssData,
                      },
                    },
                  })
                  const monacoTailwind = configureMonacoTailwindcss(monaco, {
                    languageSelector: ['html', 'css'],
                  })
                  setTailwindHandler(monacoTailwind)
                }}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: 'on',
                  tabSize: 2,
                }}
              />
            </div>
          </div>
        </Panel>
        <PanelResizeHandle className="w-1 bg-gray-700 hover:bg-blue-500 transition-colors" />
        <Panel defaultSize={50} minSize={20}>
          <div className="h-full flex flex-col">
            <div className="flex-1">
              <iframe
                key={previewKey}
                srcDoc={fullHtml}
                title="preview"
                sandbox="allow-scripts"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  )
}
