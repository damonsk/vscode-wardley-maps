declare module 'dom-to-image-more' {
	export function toPng(node: HTMLElement, options?: any): Promise<string>;
	export function toSvg(node: HTMLElement, options?: any): Promise<string>;
	export function toBlob(node: HTMLElement, options?: any): Promise<Blob>;
}
