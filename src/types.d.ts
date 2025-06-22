// wmlandscape@2.441.0+ now ships with its own TypeScript definitions
// in dist/index.d.ts, so we no longer need local type declarations

declare module 'dom-to-image-more' {
	export function toPng(node: HTMLElement, options?: any): Promise<string>;
	export function toSvg(node: HTMLElement, options?: any): Promise<string>;
	export function toBlob(node: HTMLElement, options?: any): Promise<Blob>;
}
