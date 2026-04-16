import ePub, { Book } from 'epubjs';

export class BookParser {
    book: Book;

    constructor(data: ArrayBuffer | string) {
        this.book = ePub(data);
    }

    async getMetadata() {
        await this.book.ready;
        return (this.book as any).package.metadata;
    }

    async getCoverUrl() {
        await this.book.ready;
        return await this.book.coverUrl();
    }

    /**
     * Extracts text from the spine item at the given index.
     * Naive implementation: loads the document and grabs innerText.
     */
    async getChapterText(spineIndex: number): Promise<string> {
        await this.book.ready;
        const spineItem = (this.book.spine as any).get(spineIndex);
        if (!spineItem) return "";

        // Load the document for this chapter
        // Note: 'load' is internal but we need the content
        // epub.js 'load' returns the document context
        const doc: Document = await spineItem.load(this.book.load.bind(this.book));

        // Basic extraction - later we can use standard DOM traversal to ignore footers/nav
        return doc.body.innerText;
    }
    /**
     * Extracts text and generates CFIs for each word.
     */
    async getChapterData(spineIndex: number): Promise<{ type: 'text' | 'image', value: string, cfi: string }[]> {
        await this.book.ready;
        const spineItem = (this.book.spine as any).get(spineIndex);
        if (!spineItem) return [];

        const doc: Document = await spineItem.load(this.book.load.bind(this.book));
        const data: { type: 'text' | 'image', value: string, cfi: string }[] = [];

        const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ALL, {
            acceptNode: (node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    return (node.textContent || "").trim().length > 0
                        ? NodeFilter.FILTER_ACCEPT
                        : NodeFilter.FILTER_REJECT;
                }
                if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'IMG') {
                    return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_SKIP;
            }
        });

        let node: Node | null;

        while (node = walker.nextNode()) {
            if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'IMG') {
                // Handle Image
                const img = node as HTMLImageElement;
                const src = img.src; // epub.js should have resolved this to a blob/url
                const range = doc.createRange();
                range.selectNode(node);
                const cfi = spineItem.cfiFromRange(range);

                data.push({ type: 'image', value: src, cfi });
            } else if (node.nodeType === Node.TEXT_NODE) {
                // Handle Text
                const text = node.textContent || "";
                const regex = /\S+/g;
                let match;
                while ((match = regex.exec(text)) !== null) {
                    const range = doc.createRange();
                    range.setStart(node, match.index);
                    range.setEnd(node, match.index + match[0].length);

                    const cfi = spineItem.cfiFromRange(range);
                    data.push({ type: 'text', value: match[0], cfi });
                }
            }
        }
        return data;
    }
}
