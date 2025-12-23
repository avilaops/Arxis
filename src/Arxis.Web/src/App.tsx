import { useState } from 'react'
import './App.css'
import ProjectList from './components/ProjectList'

function App() {
  const [activeModule, setActiveModule] = useState('projects')

  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'projects', name: 'Projects', icon: '🏗️' },
    { id: 'timeline', name: 'Timeline 4D', icon: '📅' },
    { id: 'model', name: 'Model 3D', icon: '🏢' },
    { id: 'tasks', name: 'Tasks & Workflow', icon: '✓' },
    { id: 'field', name: 'Field', icon: '👷' },
    { id: 'issues', name: 'Issues & RFI', icon: '⚠️' },
    { id: 'costs', name: 'Costs & Budget', icon: '💰' },
    { id: 'procurement', name: 'Procurement', icon: '📦' },
    { id: 'documents', name: 'Documents', icon: '📄' },
    { id: 'quality', name: 'Quality & Safety', icon: '🛡️' },
    { id: 'analytics', name: 'Analytics', icon: '📈' },
    { id: 'integrations', name: 'Integrations', icon: '🔗' },
    { id: 'automations', name: 'Automations', icon: '🤖' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
  ]

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'projects':
        return <ProjectList />
      case 'dashboard':
        return (
          <div className="module-placeholder">
            <h2>Dashboard</h2>
            <p>Visão geral da obra com KPIs, alertas e próximos eventos</p>
          </div>
        )
      default:
        return (
          <div className="module-placeholder">
            <h2>{modules.find(m => m.id === activeModule)?.name}</h2>
            <p>Módulo em desenvolvimento</p>
          </div>
        )
    }
  }

  return (
    <div className="arxis-app">
      <header className="top-bar">
        <div className="logo">ARXIS</div>
        <nav className="top-nav">
          <button>Workspace</button>
          <button>Project</button>
          <button>View</button>
          <button>Data</button>
          <button>Field</button>
          <button>Tools</button>
          <button>Admin</button>
          <button>Help</button>
        </nav>
        <div className="top-actions">
          <button>🔍</button>
          <button>🔔</button>
          <button>👤</button>
        </div>
      </header>

      <div className="main-container">
        <aside className="activity-bar">
          {modules.map(module => (
            <button
              key={module.id}
              className={`module-btn ${activeModule === module.id ? 'active' : ''}`}
              onClick={() => setActiveModule(module.id)}
              title={module.name}
            >
              <span className="icon">{module.icon}</span>
            </button>
          ))}
        </aside>

        <main className="content">
          {renderModuleContent()}
        </main>
      </div>
    </div>
  )
}

export default App
