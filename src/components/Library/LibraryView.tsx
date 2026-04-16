import { type ChangeEvent, useState } from 'react';
import { saveBook } from '../../services/storage';
import { useReaderStore } from '../../store/useReaderStore';

export const LibraryView = () => {
    const setCurrentBookId = useReaderStore(state => state.setCurrentBookId);
    const [loading, setLoading] = useState(false);

    const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setLoading(true);
        try {
            const id = await saveBook(e.target.files[0]);
            setCurrentBookId(id);
        } catch (error) {
            console.error(error);
            alert('Failed to load book');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="library-container" style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>One Word Reader</h1>
            <p>Upload an EPUB integration test</p>
            <div style={{ marginTop: '2rem' }}>
                <input
                    type="file"
                    accept=".epub,.pdf"
                    onChange={handleUpload}
                    disabled={loading}
                    style={{ fontSize: '1.2rem' }}
                />
            </div>
            {loading && <p>Parsing book...</p>}
        </div>
    );
};
