import Editor from '@monaco-editor/react'
import { configureMonacoTailwindcss, tailwindcssData } from 'monaco-tailwind'
import type { TailwindHandler } from 'monaco-tailwind/TailwindHandler'
import { useCallback } from 'react'
import { TabButton } from './TabButton'

export type TabType = 'html' | 'config'

const EDITOR_OPTIONS = {
  minimap: { enabled: true },
  fontSize: 14,
  lineNumbers: 'on' as const,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  wordWrap: 'on' as const,
  tabSize: 2,
}

type EditorPanelProps = {
  activeTab: TabType
  bodyContent: string
  tailwindConfig: string
  onTabChange: (tab: TabType) => void
  onBodyContentChange: (value: string) => void
  onTailwindConfigChange: (value: string) => void
  onTailwindHandlerReady: (handler: TailwindHandler) => void
}

export function EditorPanel({
  activeTab,
  bodyContent,
  tailwindConfig,
  onTabChange,
  onBodyContentChange,
  onTailwindConfigChange,
  onTailwindHandlerReady,
}: EditorPanelProps) {
  const editorValue = activeTab === 'html' ? bodyContent : tailwindConfig
  const editorLanguage = activeTab === 'html' ? 'html' : 'javascript'

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      const newValue = value ?? ''
      if (activeTab === 'html') {
        onBodyContentChange(newValue)
      } else {
        onTailwindConfigChange(newValue)
      }
    },
    [activeTab, onBodyContentChange, onTailwindConfigChange],
  )

  const handleEditorBeforeMount = useCallback(
    (monaco: any) => {
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
      onTailwindHandlerReady(monacoTailwind)
    },
    [onTailwindHandlerReady],
  )

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-800 text-white flex border-b border-gray-700">
        <TabButton
          isActive={activeTab === 'html'}
          onClick={() => onTabChange('html')}
        >
          HTML
        </TabButton>
        <TabButton
          isActive={activeTab === 'config'}
          onClick={() => onTabChange('config')}
        >
          CSS
        </TabButton>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          language={editorLanguage}
          value={editorValue}
          beforeMount={handleEditorBeforeMount}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={EDITOR_OPTIONS}
        />
      </div>
    </div>
  )
}
