export function LoadingBar() {
  return (
    <div className="w-full h-1 bg-gray-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-blue-500 animate-[loading_1s_ease-in-out_infinite]" />
    </div>
  )
}
