type TabButtonProps = {
  isActive: boolean
  onClick: () => void
  children: React.ReactNode
}

export function TabButton({ isActive, onClick, children }: TabButtonProps) {
  return (
    <button
      className={`px-4 py-2 text-sm transition-colors ${
        isActive
          ? 'bg-gray-700 border-b-2 border-blue-500'
          : 'hover:bg-gray-700'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
