'use client';

import { Component, type ReactNode } from 'react';
import Link from 'next/link';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

/**
 * Error Boundary — Catches render errors in its subtree and shows a
 * fallback UI instead of crashing the entire app.
 * 
 * Usage:
 *   <ErrorBoundary>
 *     <YourComponent />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="empty-state" style={{ minHeight: '40vh' }}>
                    <div className="empty-state-icon" style={{ fontSize: '2rem' }}>⚠️</div>
                    <div className="empty-state-title">Something went wrong</div>
                    <div className="empty-state-text">
                        {this.state.error?.message || 'An unexpected error occurred.'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => this.setState({ hasError: false, error: undefined })}
                        >
                            Try Again
                        </button>
                        <Link href="/" className="btn btn-ghost">
                            Go Home
                        </Link>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
