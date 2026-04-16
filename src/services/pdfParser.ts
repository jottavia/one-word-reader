import * as pdfjs from 'pdfjs-dist';

// Configure worker - Vite/Rollup friendly approach
// Note: You might need to adjust this depending on strict CSP or specific Vite configs,
// but usually this standard dynamic import works.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

export class PdfParser {
    data: ArrayBuffer;
    doc: pdfjs.PDFDocumentProxy | null = null;
    pageCount: number = 0;

    constructor(data: ArrayBuffer) {
        this.data = data;
    }

    async init() {
        this.doc = await pdfjs.getDocument({ data: this.data }).promise;
        this.pageCount = this.doc.numPages;
    }

    async getPageText(pageIndex: number): Promise<string> {
        if (!this.doc) await this.init();
        // pdf.js uses 1-based indexing
        const page = await this.doc!.getPage(pageIndex + 1);
        const content = await page.getTextContent();

        // Simple extraction: join all strings. 
        // PDF text items often have weird spacing, might need better heuristics later.
        return content.items.map((item: any) => item.str).join(' ');
    }

    async getPageData(pageIndex: number): Promise<{ type: 'text' | 'image', value: string, cfi: string }[]> {
        if (!this.doc) await this.init();
        const page = await this.doc!.getPage(pageIndex + 1);
        const content = await page.getTextContent();

        // For PDF, "CFI" isn't standard. We'll use "pageIndex:itemIndex" as a pseudo-CFI
        // to check correctness, but true sync requires visual mapping which is complex.
        // For MVP: We just return tokens. Syncing to visual location is harder (requires finding coordinates).

        const tokens: { type: 'text' | 'image', value: string, cfi: string }[] = [];

        content.items.forEach((item: any, idx) => {
            // item.str is the text
            const text = item.str || "";
            // We use a custom cfi format: "pdf:page:index"
            // Note: This won't "highlight" in the PDF canvas easily without custom coordinate mapping logic.
            const cfi = `pdf:${pageIndex}:${idx}`;

            if (text.trim()) {
                // Split words
                const regex = /\S+/g;
                let match;
                while ((match = regex.exec(text)) !== null) {
                    tokens.push({ type: 'text', value: match[0], cfi });
                }
            }
        });

        return tokens;
    }

    async renderTo(container: HTMLElement, pageIndex: number) {
        if (!this.doc) await this.init();
        const page = await this.doc!.getPage(pageIndex + 1);

        // Create Canvas
        const canvas = document.createElement('canvas');
        container.innerHTML = '';
        container.appendChild(canvas);

        const viewport = page.getViewport({ scale: 1.5 }); // Reasonable scale
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: canvas.getContext('2d')!,
            viewport: viewport
        };

        await page.render(renderContext as any).promise;

        // Style nicely to fit
        canvas.style.maxWidth = '100%';
        canvas.style.height = 'auto';
        canvas.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
    }

    destroy() {
        if (this.doc) {
            this.doc.destroy();
            this.doc = null;
        }
    }
}
