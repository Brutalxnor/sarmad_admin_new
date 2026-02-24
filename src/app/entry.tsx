import { AppProviders } from './providers/AppProviders'
import { Router } from './router/router'

export default function App() {
    return (
        <AppProviders>
            <Router />
        </AppProviders>
    )
}
