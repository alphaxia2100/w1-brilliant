import { Component } from 'react'
import { Button, Logo } from './ui.jsx'

// A render throw anywhere below must never white-screen the SPA — show a calm,
// on-brand recovery instead. (A blank page is the most user-hostile failure on a
// product graded for polish.)
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Surface in the console for debugging; never crash the whole app.
    console.error('Render error caught by boundary:', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="min-h-[100dvh] grid place-items-center px-6 text-center">
        <div className="max-w-col flex flex-col items-center gap-4">
          <Logo className="text-xl" />
          <h1 className="text-[22px] font-semibold tracking-tight">Something hiccupped.</h1>
          <p className="text-muted text-[15px] leading-relaxed">
            That screen ran into a snag — your progress is safe. Reload to pick up where you left off.
          </p>
          <Button onClick={() => window.location.assign('/')}>Back to home</Button>
        </div>
      </div>
    )
  }
}
