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

export const saveBook = async (file: File) => {
  const id = crypto.randomUUID();
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
