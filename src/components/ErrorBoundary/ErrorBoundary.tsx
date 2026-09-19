import { Component, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    error: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
    state: State = { error: null };

    static getDerivedStateFromError(error: unknown): State {
        return { error: error instanceof Error ? error.message : 'Something went wrong.' };
    }

    componentDidCatch(error: unknown): void {
        console.error(error);
    }

    render(): ReactNode {
        if (this.state.error) {
            return (
                <div role="alert" style={{ padding: '2rem', textAlign: 'center' }}>
                    <h1>Something went wrong</h1>
                    <p style={{ opacity: 0.7 }}>{this.state.error}</p>
                    <button
                        onClick={() => {
                            this.setState({ error: null });
                            window.location.reload();
                        }}
                        style={{ cursor: 'pointer', padding: '8px 16px' }}
                    >
                        Reload
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
