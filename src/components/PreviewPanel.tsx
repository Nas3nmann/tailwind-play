import { LoadingBar } from './LoadingBar'

type PreviewPanelProps = {
  fullHtml: string
  previewKey: number
  isCompiling: boolean
}

export function PreviewPanel({
  fullHtml,
  previewKey,
  isCompiling,
}: PreviewPanelProps) {
  return (
    <div className="h-full flex flex-col">
      {isCompiling && <LoadingBar />}
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
  )
}
