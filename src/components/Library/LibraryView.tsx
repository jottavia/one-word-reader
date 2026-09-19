import { type ChangeEvent, useCallback, useEffect, useState } from 'react';
import { saveBook, listBooks, deleteBook, loadReaderProgress, type BookMetadata } from '../../services/storage';
import { useReaderStore } from '../../store/useReaderStore';

export const LibraryView = () => {
    const setCurrentBookId = useReaderStore(state => state.setCurrentBookId);
    const [books, setBooks] = useState<BookMetadata[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [progressById, setProgressById] = useState<Record<string, number>>({});

    const refresh = useCallback(async () => {
        setRefreshing(true);
        try {
            const items = await listBooks();
            setBooks(items);
            const progressEntries = await Promise.all(
                items.map(async (b) => {
                    const p = await loadReaderProgress(b.id).catch(() => null);
                    return [b.id, p?.wordIndex ?? 0] as const;
                })
            );
            setProgressById(Object.fromEntries(progressEntries));
        } catch (e) {
            console.error(e);
            setError('Could not load your library.');
        } finally {
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        // Data fetch on mount — sets state after async storage read.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void refresh();
    }, [refresh]);

    const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setLoading(true);
        setError(null);
        try {
            const id = await saveBook(file);
            setCurrentBookId(id);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Failed to load book');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (deletingId === id) {
            try {
                await deleteBook(id);
                setBooks(prev => prev.filter(b => b.id !== id));
            } catch (e) {
                console.error(e);
                setError('Failed to delete book.');
            } finally {
                setDeletingId(null);
            }
        } else {
            setDeletingId(id);
            window.setTimeout(() => {
                setDeletingId(prev => (prev === id ? null : prev));
            }, 4000);
        }
    };

    return (
        <div className="library-container" style={{ padding: '2rem', textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
            <h1>One Word Reader</h1>
            <p>Upload an EPUB or PDF to start speed reading</p>
            <div style={{ marginTop: '2rem' }}>
                <input
                    type="file"
                    accept=".epub,.pdf"
                    onChange={handleUpload}
                    disabled={loading}
                    style={{ fontSize: '1.2rem' }}
                    aria-label="Upload book"
                />
            </div>
            {loading && <p>Parsing book...</p>}
            {error && <p role="alert" style={{ color: '#b00020' }}>{error}</p>}

            <div style={{ marginTop: '2.5rem', textAlign: 'left' }}>
                <h2 style={{ fontSize: '1.1rem' }}>Your library</h2>
                {refreshing && <p>Loading...</p>}
                {!refreshing && books.length === 0 && <p style={{ opacity: 0.7 }}>No books yet. Upload one above.</p>}
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {books.map((b) => (
                        <li
                            key={b.id}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                border: '1px solid #ccc', borderRadius: '8px', padding: '10px 12px',
                            }}
                        >
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {b.title}
                                </div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                    {b.type.toUpperCase()} · {new Date(b.addedAt).toLocaleDateString()}
                                    {(progressById[b.id] ?? 0) > 0 && ` · word ${progressById[b.id]}`}
                                </div>
                            </div>
                            <button
                                onClick={() => setCurrentBookId(b.id)}
                                style={{ cursor: 'pointer', padding: '6px 12px' }}
                            >
                                Open
                            </button>
                            <button
                                onClick={() => void handleDelete(b.id)}
                                style={{
                                    cursor: 'pointer', padding: '6px 12px',
                                    background: deletingId === b.id ? '#d32f2f' : 'transparent',
                                    color: deletingId === b.id ? '#fff' : 'inherit',
                                }}
                                aria-label={deletingId === b.id ? `Confirm delete ${b.title}` : `Delete ${b.title}`}
                            >
                                {deletingId === b.id ? 'Sure?' : 'Delete'}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
