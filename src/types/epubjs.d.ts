declare module 'epubjs' {
  export interface SpineItem {
    load(bind: unknown): Promise<Document>;
    cfiFromRange(range: Range): string;
  }
  export interface Spine {
    get(index: number): SpineItem | undefined;
  }
  export interface Rendition {
    // minimal surface used by the app; epubjs has no bundled types
    [key: string]: unknown;
  }
  export interface Book {
    ready: Promise<unknown>;
    spine: Spine;
    load(...args: unknown[]): unknown;
    renderTo(target: Element, options?: Record<string, unknown>): Rendition;
    coverUrl(): Promise<string | null>;
    destroy(): void;
    package: { metadata: Record<string, unknown> };
  }
  export default function ePub(data: ArrayBuffer | string): Book;
}
