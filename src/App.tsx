import { useReaderStore } from './store/useReaderStore';
import { LibraryView } from './components/Library/LibraryView';
import { ReaderView } from './components/Reader/ReaderView';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import './index.css';

function App() {
  const currentBookId = useReaderStore(state => state.currentBookId);

  return (
    <div className="app-container">
      <ErrorBoundary>
        {currentBookId ? <ReaderView /> : <LibraryView />}
      </ErrorBoundary>
    </div>
  );
}

export default App;
