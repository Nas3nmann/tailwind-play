import { createFileRoute } from '@tanstack/react-router'
import DOMPurify from 'dompurify'
import type {
  CssCompilerResult,
  TailwindHandler,
} from 'monaco-tailwind/TailwindHandler'
import { useCallback, useEffect, useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { EditorPanel, type TabType } from '../components/EditorPanel'
import { PreviewPanel } from '../components/PreviewPanel'
import {
  defaultBodyContent,
  defaultTailwindConfig,
  wrapWithHtmlTemplate,
} from '../lib/templates'

export const Route = createFileRoute('/')({
  component: App,
})

const PREVIEW_REFRESH_DELAY = 3000
const DEFAULT_TAB: TabType = 'html'

const DOMPURIFY_CONFIG = {
  ADD_TAGS: ['script', 'style', 'link'],
  ADD_ATTR: ['onclick', 'onload', 'onerror', 'class', 'id', 'href', 'src'],
}

function extractAllClasses(bodyContent: string): string[] {
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
  const [activeTab, setActiveTab] = useState<TabType>(DEFAULT_TAB)
  const [tailwindHandler, setTailwindHandler] = useState<TailwindHandler>()
  const [fullHtml, setFullHtml] = useState('')
  const [isCompiling, setIsCompiling] = useState(false)

  useEffect(() => {
    let isMounted = true

    const compileHtml = async () => {
      setIsCompiling(true)

      const sanitizedBody = DOMPurify.sanitize(bodyContent, DOMPURIFY_CONFIG)

      let compiledCss: CssCompilerResult | undefined
      try {
        const allClasses = extractAllClasses(bodyContent)
        compiledCss = await tailwindHandler?.buildCss(
          tailwindConfig,
          allClasses,
          {},
        )
      } catch (error) {
        console.error('Failed to compile CSS:', error)
      }

      if (isMounted) {
        setFullHtml(wrapWithHtmlTemplate(sanitizedBody, compiledCss?.css ?? ''))
        setIsCompiling(false)
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
    }, PREVIEW_REFRESH_DELAY)

    return () => clearTimeout(timer)
  }, [fullHtml])

  const handleTailwindHandlerReady = useCallback((handler: TailwindHandler) => {
    setTailwindHandler(handler)
  }, [])

  return (
    <div className="flex flex-col h-screen">
      <PanelGroup direction="horizontal" className="flex-1">
        <Panel defaultSize={50} minSize={20}>
          <EditorPanel
            activeTab={activeTab}
            bodyContent={bodyContent}
            tailwindConfig={tailwindConfig}
            onTabChange={setActiveTab}
            onBodyContentChange={setBodyContent}
            onTailwindConfigChange={setTailwindConfig}
            onTailwindHandlerReady={handleTailwindHandlerReady}
          />
        </Panel>
        <PanelResizeHandle className="w-1 bg-gray-700 hover:bg-blue-500 transition-colors" />
        <Panel defaultSize={50} minSize={20}>
          <PreviewPanel
            fullHtml={fullHtml}
            previewKey={previewKey}
            isCompiling={isCompiling}
          />
        </Panel>
      </PanelGroup>
    </div>
  )
}
