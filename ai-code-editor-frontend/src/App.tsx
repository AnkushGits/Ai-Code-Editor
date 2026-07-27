import { EditorProvider, useEditor } from './context/EditorContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import EditorPanel from './components/EditorPanel'
import IntentModePanel from './components/IntentModePanel'
import ReviewModePanel from './components/ReviewModePanel'
import MemoryModePanel from './components/MemoryModePanel'

function ModePanel() {
  const { activeMode } = useEditor()

  switch (activeMode) {
    case 'intent':
      return <IntentModePanel />
    case 'review':
      return <ReviewModePanel />
    case 'memory':
      return <MemoryModePanel />
  }
}

function AppLayout() {
  return (
    <div className="flex h-screen flex-col bg-[#1e1e1e]">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 flex-col overflow-hidden">
          <EditorPanel />
        </main>
        <aside className="w-80 flex-shrink-0 overflow-y-auto border-l border-[#1e1e1e]">
          <ModePanel />
        </aside>
      </div>
    </div>
  )
}

function App() {
  return (
    <EditorProvider>
      <AppLayout />
    </EditorProvider>
  )
}

export default App

