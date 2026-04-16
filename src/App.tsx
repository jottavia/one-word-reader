import { useReaderStore } from './store/useReaderStore';
import { LibraryView } from './components/Library/LibraryView';
import { ReaderView } from './components/Reader/ReaderView';
import './index.css';

function App() {
  const currentBookId = useReaderStore(state => state.currentBookId);

  return (
    <div className="app-container">
      {currentBookId ? <ReaderView /> : <LibraryView />}
    </div>
  );
}

export default App;
