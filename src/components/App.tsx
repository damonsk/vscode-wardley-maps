/*
 * TODO: Major refactoring needed for this component
 * Issues to address:
 * 1. ✅ wmlandscape package exports are now properly typed and imported
 * 2. Component is too large (432+ lines) and should be broken down
 * 3. Mixed concerns: map rendering, state management, export functionality
 * 4. Null reference issues with DOM manipulation
 * 5. Event handler types need proper typing
 *
 * Recommended approach:
 * - Break into smaller components (MapRenderer, ExportHandlers, etc.)
 * - ✅ Create proper TypeScript definitions for wmlandscape imports
 * - Implement proper error boundaries
 * - Add unit tests for individual functions
 */
/* eslint-disable @typescript-eslint/ban-ts-comment, no-undef */
import React, {
	useState,
	useEffect,
	useRef,
	useCallback,
	useMemo,
} from 'react';
import {
	MapView,
	MapStyles,
	Defaults,
	UnifiedConverter,
	useUnifiedMapState,
	ModKeyPressedProvider,
	FeatureSwitchesProvider,
	UnifiedWardleyMap,
	createEmptyMap,
	useFeatureSwitches
} from 'wmlandscape';
import domtoimage from 'dom-to-image-more';

// Types
interface NewComponentContext {
	x: number;
	y: number;
}

interface WardleyMapUrl {
	name: string;
	url: string;
}

const App = () => {
	const defaultFeatureSwitches = useFeatureSwitches();
	const vscodeFeatureSwitches = useMemo(
		() => ({
			...defaultFeatureSwitches,
			showToggleFullscreen: false,
			enableQuickAdd: false,
			showMapToolbar: false,
			showMiniMap: false,
			allowMapZoomMouseWheel: false,
			enableNewPipelines: true,
		}),
		[defaultFeatureSwitches],
	);

	const [mapText, setMapText] = useState('');
	const mapState = useUnifiedMapState();
	const wardleyMap = mapState.state.map;
	const setWardleyMap = mapState.actions.setMap;

	// Initialize with empty map to prevent undefined errors
	useEffect(() => {
		if (!wardleyMap || !wardleyMap.components) {
			setWardleyMap(createEmptyMap());
		}
	}, [wardleyMap, setWardleyMap]);

	const [mapDimensions, setMapDimensions] = useState({
		width: 800,
		height: 600,
	});
	const [mapCanvasDimensions, setMapCanvasDimensions] = useState({
		width: 800,
		height: 600,
	});
	const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
	const [mapStyle, setMapStyle] = useState('plain');
	const [mapStyleDefs, setMapStyleDefs] = useState(
		// @ts-ignore - MapStyles export needs verification
		MapStyles.Plain,
	);
	const [highlightLine, setHighlightLine] = useState<number>(0);
	const mapRef = useRef<HTMLDivElement>(null);
	const componentName = useRef<HTMLInputElement>(null);
	const [newComponentContext, setNewComponentContext] =
		useState<NewComponentContext | null>(null);
	const [showAdd, setShowAdd] = useState<boolean>(false);

	const cancelShowAdd = useCallback(() => {
		setShowAdd(false);
		setNewComponentContext(null);
	}, []);

	// Move debounce function before useEffects that use it to prevent temporal dead zone
	const debounce = useCallback((fn: (...args: any[]) => void, ms: number) => {
		let timer: NodeJS.Timeout | null = null;
		return (...args: any[]) => {
			if (timer) clearTimeout(timer);
			timer = setTimeout(() => {
				timer = null;
				fn(...args);
			}, ms);
		};
	}, []);

	useEffect(() => {
		const handleEscape = (k: KeyboardEvent) => {
			if (k.key === 'Escape') {
				document.removeEventListener('keyup', handleEscape);
				cancelShowAdd();
			}
		};

		if (newComponentContext) {
			setShowAdd(true);
			document.addEventListener('keyup', handleEscape);
		}
		return function cleanup() {
			document.removeEventListener('keyup', handleEscape);
		};
	}, [newComponentContext, cancelShowAdd]);

	useEffect(() => {
		if (showAdd && componentName.current) {
			componentName.current.focus();
		}
	}, [showAdd]);

	useEffect(() => {
		setMapDimensions({
			width: mapSize.width > 0 ? mapSize.width : 500,
			height: mapSize.height > 0 ? mapSize.height : 500,
		});
		setMapCanvasDimensions({
			width: mapSize.width > 0 ? mapSize.width * 0.92 : 500,
			height: mapSize.height > 0 ? mapSize.height : 500,
		});
	}, [mapSize]);

	useEffect(() => {
		const debouncedHandleResize = debounce(() => {
			const dimensions = {
				width: mapSize.width > 0 ? mapSize.width : 100 + getWidth(),
				height: mapSize.height > 0 ? mapSize.height : getHeight(),
			};
			setMapDimensions(dimensions);
		}, 1);

		window.addEventListener('resize', debouncedHandleResize);
		debouncedHandleResize();

		return function cleanup() {
			window.removeEventListener('resize', debouncedHandleResize);
		};
	}, [mapSize, debounce]);

	function addNewComponent() {
		if (
			!componentName.current ||
			componentName.current.value.trim().length === 0
		)
			return;
		if (!newComponentContext) return;
		setShowAdd(false);
		mutateMapText(
			`${mapText}\r\ncomponent ${componentName.current.value} [${newComponentContext.y}, ${newComponentContext.x}]`,
		);
	}

	const mutateMapTextIn = (newText: string) => {
		setMapText(newText);
	};

	const mutateMapText = (newText: string) => {
		setMapText(newText);
		window.postMessage({ command: 'updateText', val: newText });
	};

	const getHeight = () => {
		const winHeight = window.innerHeight;
		return winHeight - 140;
	};
	const getWidth = function () {
		const mapElement = document.getElementById('map');
		return mapElement ? mapElement.clientWidth - 70 : 500;
	};

	const launchUrl = (urlId: string) => {
		if (wardleyMap?.urls?.find((u: WardleyMapUrl) => u.name === urlId)) {
			const urlToLaunch = wardleyMap.urls.find(
				(u: WardleyMapUrl) => u.name === urlId,
			)?.url;
			if (urlToLaunch) {
				window.open(urlToLaunch);
			}
		}
	};

	function exportToPng() {
		const createData = (): Promise<void> =>
			new Promise((resolve) => {
				const mapNode = mapRef.current;
				if (!mapNode) {
					console.error('Map node not found');
					resolve();
					return;
				}

				const scale = 3;
				const style = {
					transform: 'scale(' + scale + ')',
					transformOrigin: 'top left',
					width: mapNode.offsetWidth + 'px',
					height: mapNode.offsetHeight + 'px',
					backgroundColor: 'white',
				};
				const param = {
					height: mapNode.offsetHeight * scale,
					width: mapNode.offsetWidth * scale,
					quality: 1,
					style,
				};
				domtoimage
					.toBlob(mapNode, param)
					.then((blob: Blob | null) => {
						if (!blob) {
							console.error('Failed to generate blob');
							resolve();
							return;
						}
						const reader = new FileReader();
						reader.onloadend = () => {
							const arrayBuffer = reader.result;
							// Send the arrayBuffer back to the extension
							window.postMessage({
								command: 'didExportAsPng',
								val: arrayBuffer,
							});
							resolve();
						};
						reader.readAsArrayBuffer(blob);
					})
					.catch((error: Error) => {
						console.error('Error generating image:', error);
						resolve();
					});
			});

		createData();
	}

	function exportToSvg() {
		if (!mapRef.current) return;

		const svgMapText = mapRef.current
			.getElementsByTagName('svg')[0]
			.outerHTML.replace(/&nbsp;/g, ' ');
		window.postMessage({
			command: 'didExportAsSvg',
			val: `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">${svgMapText}`,
		});
	}

	useEffect(() => {
		const messageHandler = (e: MessageEvent) => {
			const message = e.data;
			console.log('[[App.js::messageHandler', message);
			switch (message.command) {
				case 'text':
					mutateMapTextIn(message.val);
					break;
				case 'exportAsSvg':
					exportToSvg();
					break;
				case 'exportAsPng':
					exportToPng();
					break;
			}
		};

		//window.addEventListener('message', (e) => messageHandler(e));
		//window.removeEventListener('message', (e) => messageHandler(e));

		const initialLoad = () => {
			setMapCanvasDimensions({
				width: getWidth(),
				height: getHeight(),
			});
		};

		const debouncedHandleCanvasResize = debounce(() => {
			setMapCanvasDimensions({
				width: getWidth(),
				height: getHeight(),
			});
		}, 500);

		window.addEventListener('message', (e) => messageHandler(e));
		window.addEventListener('load', initialLoad);
		window.addEventListener('resize', debouncedHandleCanvasResize);

		return function cleanup() {
			window.removeEventListener('resize', debouncedHandleCanvasResize);
			window.removeEventListener('load', initialLoad);
			window.removeEventListener('message', (e) => messageHandler(e));
		};
	}, [debounce]);

	useEffect(() => {
		try {
			if (!mapText.trim()) {
				// If mapText is empty, use empty map
				setWardleyMap(createEmptyMap());
				setMapSize({ width: 0, height: 0 });
				setMapStyle('plain');
				return;
			}

			const converter = new UnifiedConverter(vscodeFeatureSwitches);
			const parsedMap = converter.parse(mapText);

			// Ensure parsedMap is valid before setting
			if (parsedMap && parsedMap.components) {
				setWardleyMap(parsedMap);
				setMapSize(parsedMap.presentation?.size || { width: 0, height: 0 });
				setMapStyle(parsedMap.presentation?.style || 'plain');
			} else {
				console.warn('Parsed map is invalid, using empty map');
				setWardleyMap(createEmptyMap());
				setMapSize({ width: 0, height: 0 });
				setMapStyle('plain');
			}
		} catch (err) {
			const error = err as any; // Type assertion for legacy error handling
			console.log(
				`Invalid markup on line ${1 + (error.line || 0)}, could not render.`,
				err,
			);
			// On error, fallback to empty map
			setWardleyMap(createEmptyMap());
			setMapSize({ width: 0, height: 0 });
			setMapStyle('plain');
		}
	}, [mapText, setWardleyMap, vscodeFeatureSwitches]);

	useEffect(() => {
		window.postMessage({ command: 'highlightLine', val: highlightLine });
	}, [highlightLine]);

	useEffect(() => {
		switch (mapStyle) {
			case 'colour':
			case 'color':
				setMapStyleDefs(MapStyles.Colour);
				break;
			case 'wardley':
				setMapStyleDefs(MapStyles.Wardley);
				break;
			case 'handwritten':
				setMapStyleDefs(MapStyles.Handwritten);
				break;
			default:
				setMapStyleDefs(MapStyles.Plain);
		}
	}, [mapStyle]);

	return (
		<React.Fragment>
			<div>
				<FeatureSwitchesProvider value={vscodeFeatureSwitches}>
					<ModKeyPressedProvider>
						<MapView
							wardleyMap={
								wardleyMap && wardleyMap.components
									? wardleyMap
									: createEmptyMap()
							}
							launchUrl={launchUrl}
							mapStyleDefs={mapStyleDefs}
							mapDimensions={mapDimensions}
							mapCanvasDimensions={mapCanvasDimensions}
							mapEvolutionStates={Defaults.EvolutionStages}
							mapRef={mapRef}
							mapText={mapText}
							mutateMapText={mutateMapText}
							setMetaText={() => console.log('set meta text not implemented')}
							metaText={() => console.log('meta text not implemented')}
							evolutionOffsets={Defaults.EvoOffsets}
							setHighlightLine={setHighlightLine}
							setNewComponentContext={setNewComponentContext}
							showLinkedEvolved={false}
							mapAnnotationsPresentation={
								wardleyMap?.presentation?.annotations || {
									visibility: 0.5,
									maturity: 0.5,
								}
							}
						/>
					</ModKeyPressedProvider>
				</FeatureSwitchesProvider>

				{showAdd ? (
					<>
						<div id="create-element">
							<span id="close">
								<div id="cross" onClick={cancelShowAdd}>
									<svg className="svg-icon" viewBox="0 0 20 20">
										<path
											fill="none"
											d="M8.55,7.968l7.301-7.301c0.153-0.152,0.153-0.399,0-0.551c-0.152-0.152-0.397-0.152-0.55,0L8,7.417
									L0.699,0.116c-0.152-0.152-0.399-0.152-0.551,0s-0.152,0.399,0,0.551l7.301,7.301L0.147,15.27c-0.152,0.151-0.152,0.398,0,0.55
									c0.152,0.153,0.399,0.153,0.551,0L8,8.519l7.301,7.301c0.152,0.153,0.397,0.153,0.55,0c0.153-0.151,0.153-0.398,0-0.55L8.55,7.968z
									"
										></path>
									</svg>
								</div>
							</span>
							<div id="create-entry">
								<input
									placeholder="Type to add"
									ref={componentName}
									onKeyPress={(e) => {
										if (e.key === 'Enter') addNewComponent();
									}}
								/>
								<span>Press Enter to add, Escape to cancel.</span>
								<div id="add" onClick={addNewComponent}>
									<div id="done">
										<svg className="svg-icon" viewBox="0 0 20 20">
											<path
												fill="none"
												d="M7.629,14.566c0.125,0.125,0.291,0.188,0.456,0.188c0.164,0,0.329-0.062,0.456-0.188l8.219-8.221c0.252-0.252,0.252-0.659,0-0.911c-0.252-0.252-0.659-0.252-0.911,0l-7.764,7.763L4.152,9.267c-0.252-0.251-0.66-0.251-0.911,0c-0.252,0.252-0.252,0.66,0,0.911L7.629,14.566z"
											></path>
										</svg>
									</div>
								</div>
							</div>
						</div>
					</>
				) : null}
			</div>
		</React.Fragment>
	);
};

//export default hot(App);
export default App;
