import localforage from 'localforage';

export const bookStore = localforage.createInstance({
  name: 'one_word_reader',
  storeName: 'books'
});

export const metadataStore = localforage.createInstance({
  name: 'one_word_reader',
  storeName: 'metadata'
});

export const progressStore = localforage.createInstance({
  name: 'one_word_reader',
  storeName: 'progress'
});

export interface BookMetadata {
  id: string;
  title: string;
  type: 'epub' | 'pdf';
  addedAt: number;
}

export interface ReaderProgress {
  cfi: string;
  wordIndex: number;
  updatedAt: number;
}

const newId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for non-secure contexts / older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const saveBook = async (file: File) => {
  const id = newId();
  const arrayBuffer = await file.arrayBuffer();
  try {
    await bookStore.setItem(id, arrayBuffer);
  } catch (error) {
    // Quota exceeded or storage unavailable — don't leave orphan metadata.
    throw new Error('Storage full or unavailable. Delete a book and try again.', { cause: error });
  }

  const type = file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'epub';
  const metadata: BookMetadata = {
    id,
    title: file.name,
    type,
    addedAt: Date.now()
  };
  await metadataStore.setItem(id, metadata);

  return id;
};

export const loadMetadata = async (id: string): Promise<BookMetadata | null> => {
  return await metadataStore.getItem<BookMetadata>(id);
};

export const listBooks = async (): Promise<BookMetadata[]> => {
  const items: BookMetadata[] = [];
  await metadataStore.iterate<BookMetadata, void>((value) => {
    if (value && typeof value.id === 'string') items.push(value);
  });
  return items.sort((a, b) => b.addedAt - a.addedAt);
};

export const deleteBook = async (id: string): Promise<void> => {
  await bookStore.removeItem(id);
  await metadataStore.removeItem(id);
  await progressStore.removeItem(id);
};

export const loadBook = async (id: string): Promise<ArrayBuffer | null> => {
  const data = await bookStore.getItem<ArrayBuffer | Blob>(id);
  // localforage/IndexedDB may round-trip as Blob on some browsers.
  if (data instanceof Blob) return await data.arrayBuffer();
  return (data as ArrayBuffer | null) ?? null;
};

export const getStorageEstimate = async (): Promise<{ usage?: number; quota?: number }> => {
  try {
    if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
      const { usage, quota } = await navigator.storage.estimate();
      return { usage, quota };
    }
  } catch {
    // ignore — estimate is best-effort
  }
  return {};
};

// Legacy progress was a bare CFI string; current shape carries wordIndex too.
export const saveProgress = async (bookId: string, cfi: string, wordIndex = 0) => {
  const value: ReaderProgress = { cfi, wordIndex, updatedAt: Date.now() };
  await progressStore.setItem(bookId, value);
};

export const loadProgress = async (bookId: string): Promise<string | null> => {
  const raw = await progressStore.getItem<ReaderProgress | string>(bookId);
  if (typeof raw === 'string') return raw;
  return raw?.cfi ?? null;
};

export const loadReaderProgress = async (bookId: string): Promise<ReaderProgress | null> => {
  const raw = await progressStore.getItem<ReaderProgress | string>(bookId);
  if (typeof raw === 'string') return { cfi: raw, wordIndex: 0, updatedAt: 0 };
  return raw ?? null;
};
