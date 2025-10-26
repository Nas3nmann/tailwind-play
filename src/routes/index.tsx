import Editor from '@monaco-editor/react'
import { createFileRoute } from '@tanstack/react-router'
import DOMPurify from 'dompurify'
import { configureMonacoTailwindcss, tailwindcssData } from 'monaco-tailwindcss'
import { useEffect, useMemo, useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { defaultBodyContent, wrapWithHtmlTemplate } from '../lib/htmlTemplate'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const [bodyContent, setBodyContent] = useState(defaultBodyContent)
  const [tailwindConfig, setTailwindConfig] = useState(undefined)
  const [previewKey, setPreviewKey] = useState(0)

  const fullHtml = useMemo(() => {
    const sanitizedBody = DOMPurify.sanitize(bodyContent, {
      ADD_TAGS: ['script', 'style', 'link'],
      ADD_ATTR: ['onclick', 'onload', 'onerror', 'class', 'id', 'href', 'src'],
    })

    return wrapWithHtmlTemplate(sanitizedBody)
  }, [bodyContent])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewKey((prev) => prev + 1)
    }, 3000)

    return () => clearTimeout(timer)
  }, [fullHtml])

  return (
    <div className="flex flex-col h-screen">
      <PanelGroup direction="horizontal" className="flex-1">
        <Panel defaultSize={50} minSize={20}>
          <div className="h-full flex flex-col">
            <div className="bg-gray-800 text-white px-4 py-2 text-sm border-b border-gray-700">
              HTML
            </div>
            <div className="flex-1">
              <Editor
                height="100%"
                defaultLanguage="html"
                value={bodyContent}
                beforeMount={(monaco) => {
                  monaco.languages.css.cssDefaults.setOptions({
                    data: {
                      dataProviders: {
                        tailwindcssData,
                      },
                    },
                  })
                  configureMonacoTailwindcss(monaco, {
                    languageSelector: ['html', 'css'],
                    tailwindConfig: tailwindConfig,
                  })
                }}
                onChange={(value) => setBodyContent(value || '')}
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
