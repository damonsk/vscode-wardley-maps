import React, { useState, useEffect, useRef } from 'react';
import { hot } from 'react-hot-loader/root';
import { MapView, MapStyles, Defaults } from 'wmlandscape';
import { Converter } from 'wmlandscape';
import { ModKeyPressedProvider } from 'wmlandscape';

const App = () => {
	const [mapText, setMapText] = useState('');
	const [mapTitle, setMapTitle] = useState('Untitled Map');
	const [mapComponents, setMapComponents] = useState([]);
	const [mapSubMaps, setMapSubMaps] = useState([]);
	const [mapMarkets, setMarkets] = useState([]);
	const [mapEcosystems, setEcosystems] = useState([]);
	const [mapEvolved, setMapEvolved] = useState([]);
	const [mapPipelines, setMapPipelines] = useState([]);
	const [mapAnchors, setMapAnchors] = useState([]);
	const [mapNotes, setMapNotes] = useState([]);
	const [mapUrls, setMapUrls] = useState([]);
	const [mapLinks, setMapLinks] = useState([]);
	const [mapAttitudes, setMapAttitudes] = useState([]);
	const [mapAnnotations, setMapAnnotations] = useState([]);
	const [mapMethods, setMapMethods] = useState([]);
	const [mapAnnotationsPresentation, setMapAnnotationsPresentation] = useState(
		[]
	);

	const [mapDimensions, setMapDimensions] = useState({
		width: 500,
		height: 500,
	});
	const [mapEvolutionStates, setMapEvolutionStates] = useState(
		Defaults.EvolutionStages
	);
	const [mapStyle, setMapStyle] = useState('plain');
	const [mapYAxis, setMapYAxis] = useState({});
	const [mapStyleDefs, setMapStyleDefs] = useState(MapStyles.Plain);
	const [highlightLine, setHighlightLine] = useState(0);
	const mapRef = useRef(null);
	const componentName = useRef(null);
	const [newComponentContext, setNewComponentContext] = useState(null);
	const [showAdd, setShowAdd] = useState(false);

	useEffect(() => {
		const handleEscape = (k) => {
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
	}, [newComponentContext]);

	useEffect(() => {
		if (showAdd) componentName.current.focus();
	}, [showAdd]);

	function addNewComponent() {
		if (componentName.current.value.trim().length === 0) return;
		setShowAdd(false);
		mutateMapText(
			mapText +
				`\r\ncomponent ${componentName.current.value} [${newComponentContext.y}, ${newComponentContext.x}]`
		);
	}
	function cancelShowAdd() {
		setShowAdd(false);
		setNewComponentContext(null);
	}

	const mutateMapTextIn = (newText) => {
		setMapText(newText);
	};

	const mutateMapText = (newText) => {
		setMapText(newText);
		window.postMessage({ command: 'updateText', val: newText });
	};

	const getHeight = () => {
		var winHeight = window.innerHeight;
		return winHeight - 120;
	};
	const getWidth = function () {
		return document.getElementById('map').clientWidth - 50;
	};

	function debounce(fn, ms) {
		let timer;
		return () => {
			clearTimeout(timer);
			timer = setTimeout(() => {
				timer = null;
				fn.apply(this, arguments);
			}, ms);
		};
	}

	const launchUrl = (urlId) => {
		if (mapUrls.find((u) => u.name === urlId)) {
			const urlToLaunch = mapUrls.find((u) => u.name === urlId).url;
			window.open(urlToLaunch);
		}
	};

	React.useEffect(() => {
		const debouncedHandleResize = debounce(() => {
			setMapDimensions({ width: getWidth(), height: getHeight() });
		}, 1000);

		const initialLoad = () => {
			setMapDimensions({ width: getWidth(), height: getHeight() });
		};

		window.addEventListener('resize', debouncedHandleResize);
		window.addEventListener('load', initialLoad);

		return function cleanup() {
			window.removeEventListener('resize', debouncedHandleResize);
			window.removeEventListener('load', initialLoad);
		};
	});

	React.useEffect(() => {
		try {
			var r = new Converter().parse(mapText);
			setMapTitle(r.title);
			setMapAnnotations(r.annotations);
			setMapAnchors(r.anchors);
			setMapNotes(r.notes);
			setMapComponents(r.elements);
			setMapSubMaps(r.submaps);
			setMarkets(r.markets);
			setEcosystems(r.ecosystems);
			setMapEvolved(r.evolved);
			setMapPipelines(r.pipelines);
			setMapLinks(r.links);
			setMapUrls(r.urls);
			setMapMethods(r.methods);
			setMapAttitudes(r.attitudes);
			setMapStyle(r.presentation.style);
			setMapYAxis(r.presentation.yAxis);
			setMapAnnotationsPresentation(r.presentation.annotations);
			setMapEvolutionStates({
				genesis: { l1: r.evolution[0].line1, l2: r.evolution[0].line2 },
				custom: { l1: r.evolution[1].line1, l2: r.evolution[1].line2 },
				product: { l1: r.evolution[2].line1, l2: r.evolution[2].line2 },
				commodity: { l1: r.evolution[3].line1, l2: r.evolution[3].line2 },
			});
		} catch (err) {
			console.log(`Invalid markup on line ${1 + err.line}, could not render.`);
		}
	}, [mapText]);

	useEffect(() => {
		window.postMessage({ command: 'highlightLine', val: highlightLine });
	}, [highlightLine]);

	useEffect(() => {
		const textChangeBinding = (e) => {
			const message = e.data;
			switch (message.command) {
				case 'text':
					mutateMapTextIn(message.val);
					break;
			}
		};
		window.addEventListener('message', (e) => textChangeBinding(e));
		return () =>
			window.removeEventListener('message', (e) => textChangeBinding(e));
	}, [mutateMapTextIn]);

	React.useEffect(() => {
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
				<ModKeyPressedProvider>
					<MapView
						mapTitle={mapTitle}
						mapComponents={mapComponents}
						mapMarkets={mapMarkets}
						mapEcosystems={mapEcosystems}
						mapSubMaps={mapSubMaps}
						mapEvolved={mapEvolved}
						mapPipelines={mapPipelines}
						mapAnchors={mapAnchors}
						mapLinks={mapLinks}
						mapAttitudes={mapAttitudes}
						launchUrl={launchUrl}
						mapNotes={mapNotes}
						mapAnnotations={mapAnnotations}
						mapAnnotationsPresentation={mapAnnotationsPresentation}
						mapMethods={mapMethods}
						mapStyleDefs={mapStyleDefs}
						mapYAxis={mapYAxis}
						mapDimensions={mapDimensions}
						mapEvolutionStates={mapEvolutionStates}
						mapRef={mapRef}
						mapText={mapText}
						mutateMapText={mutateMapText}
						setMetaText={() => console.log('set meta text not implemented')}
						metaText={() => console.log('meta text not implemented')}
						evolutionOffsets={Defaults.EvoOffsets}
						setHighlightLine={setHighlightLine}
						setNewComponentContext={setNewComponentContext}
					/>
				</ModKeyPressedProvider>
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

export default hot(App);
