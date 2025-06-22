declare module 'wmlandscape' {
	export interface MapView {
		// Define types based on the wmlandscape library
		[key: string]: any;
	}

	export interface MapStyles {
		[key: string]: any;
	}

	export interface Defaults {
		[key: string]: any;
	}

	export interface UnifiedConverter {
		[key: string]: any;
	}

	export function useUnifiedMapState(): any;

	export function ModKeyPressedProvider({ children }: { children: React.ReactNode }): JSX.Element;

	export function FeatureSwitchesProvider({ children }: { children: React.ReactNode }): JSX.Element;

	export interface FeatureSwitches {
		[key: string]: any;
	}
}

declare module 'dom-to-image-more' {
	export function toPng(node: HTMLElement, options?: any): Promise<string>;
	export function toSvg(node: HTMLElement, options?: any): Promise<string>;
	export function toBlob(node: HTMLElement, options?: any): Promise<Blob>;
}
