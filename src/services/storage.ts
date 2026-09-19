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
  await bookStore.setItem(id, arrayBuffer);

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

export const loadBook = async (id: string): Promise<ArrayBuffer | null> => {
  return await bookStore.getItem<ArrayBuffer>(id);
};

export const saveProgress = async (bookId: string, cfi: string) => {
  await progressStore.setItem(bookId, cfi);
};

export const loadProgress = async (bookId: string): Promise<string | null> => {
  return await progressStore.getItem<string>(bookId);
};
