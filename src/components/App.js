import React, {useState, useEffect, useRef} from 'react';
import { hot } from 'react-hot-loader/root';
import {MapView, MapStyles, Defaults} from 'wmlandscape';
import {Converter} from 'wmlandscape';


const App = props => {

    const [mapText, setMapText] = useState("");
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

	const [mapDimensions, setMapDimensions] = useState(Defaults.MapDimensions);
	const [mapEvolutionStates, setMapEvolutionStates] = useState(
		Defaults.EvolutionStages
	);
	const [mapStyle, setMapStyle] = useState('plain');
	const [mapYAxis, setMapYAxis] = useState({});
	const [mapStyleDefs, setMapStyleDefs] = useState(MapStyles.Plain);
	const [saveOutstanding, setSaveOutstanding] = useState(false);
	const [toggleToolbar, setToggleToolbar] = useState(true);

	const [highlightLine, setHighlightLine] = useState(0);
	const mapRef = useRef(null);
	const [mainViewHeight, setMainViewHeight] = useState(100);

    const mutateMapText = newText => {
		setMapText(newText);
    };

    const getHeight = () => {
		var winHeight = window.innerHeight;
		var topNavHeight = document.getElementById('top-nav-wrapper').clientHeight;
		var titleHeight = document.getElementById('title').clientHeight;
		return winHeight - topNavHeight - titleHeight - 85;
	};
	const getWidth = function() {
		return document.getElementById('map').clientWidth - 50;
	};

    
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
        const textChangeBinding = (e) => {
            const message = e.data;
            switch (message.command) {
                case 'text':
                    console.log("message", message);
                    mutateMapText(message.val);
                    break;
            }
        }
        window.addEventListener('message', (e) => textChangeBinding(e));
        return () => window.removeEventListener('message', (e) => textChangeBinding(e));
    }, [mutateMapText]);

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
            <div style={{background: "white", padding: "15px"}}>
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
                    launchUrl={() => console.log('launchUrl not implemented')}
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
                />
            </div>
            <pre>{mapText}</pre>
        </React.Fragment>
    )
}

export default hot(App);