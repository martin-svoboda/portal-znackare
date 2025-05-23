import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap, Popup } from "react-leaflet";
import { Box, Loader, Text } from "@mantine/core";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Mapy.cz API klíč
const MAPY_API_KEY = "67fA8acT3ISVkTZEz3CYnTiXVo32Xvh1k1obif0B3d4";

// SVG jako string pro marker (použiješ IconSignLeftFilled, můžeš nahradit svg kódem nebo cestou na SVG soubor)
const signSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="#000" d="M11 21v-3H6.825q-.4 0-.763-.15t-.637-.425L3.7 15.7q-.3-.3-.3-.7t.3-.7l1.725-1.725q.275-.275.638-.425t.762-.15H11v-2H5q-.425 0-.712-.288T4 9V5q0-.425.288-.712T5 4h6V3q0-.425.288-.712T12 2t.713.288T13 3v1h4.175q.4 0 .763.15t.637.425L20.3 6.3q.3.3.3.7t-.3.7l-1.725 1.725q-.275.275-.638.425t-.762.15H13v2h6q.425 0 .713.288T20 13v4q0 .425-.288.713T19 18h-6v3q0 .425-.288.713T12 22t-.712-.288T11 21"/></svg>
`);
const signIcon = new L.DivIcon({
	className: "",
	iconSize: [28, 28],
	html: `<img src="data:image/svg+xml;utf8,${signSvg}" style="display:block"/>`
});

// FitBounds podle bodů
function FitBounds({ points }) {
	const map = useMap();
	useEffect(() => {
		if (!points.length) return;
		const bounds = L.latLngBounds(points.map(({ lat, lon }) => [lat, lon]));
		map.fitBounds(bounds, { padding: [40, 40] });
	}, [points, map]);
	return null;
}

// Tvorba správné URL pro routing API
function buildMapyRouteUrl(body, apiKey) {
	if (body.length < 2) throw new Error("Musí být alespoň dva body!");

	const [start, ...rest] = body;
	const end = rest.length ? rest[rest.length - 1] : start;
	const waypoints = rest.length > 1 ? rest.slice(0, -1) : [];

	const url = new URL("https://api.mapy.cz/v1/routing/route");
	url.searchParams.append("start", `${start.lon}`);
	url.searchParams.append("start", `${start.lat}`);
	url.searchParams.append("end", `${end.lon}`);
	url.searchParams.append("end", `${end.lat}`);
	url.searchParams.append("routeType", "foot_fast");
	url.searchParams.append("lang", "cs");
	url.searchParams.append("format", "geojson");
	url.searchParams.append("avoidToll", "false");
	url.searchParams.append("apikey", apiKey);

	waypoints.forEach(({ lat, lon }) => {
		url.searchParams.append("waypoints", `${lon},${lat}`);
	});

	return url.toString();
}

export function MapaTrasy({ body }) {
	const [routeCoords, setRouteCoords] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!body || body.length < 2) return;
		setLoading(true);
		setError(null);

		const url = buildMapyRouteUrl(body, MAPY_API_KEY);

		fetch(url)
			.then(r => {
				if (!r.ok) throw new Error("Chyba API");
				return r.json();
			})
			.then(data => {
				let coords = [];
				if (
					data?.geometry?.geometry?.type === "LineString" &&
					Array.isArray(data.geometry.geometry.coordinates)
				) {
					coords = data.geometry.geometry.coordinates.map(
						([lon, lat]) => [lat, lon]
					);
				}
				setRouteCoords(coords);
				setLoading(false);
			})
			.catch(e => {
				setError("Nepodařilo se načíst trasu.");
				setRouteCoords([]);
				setLoading(false);
			});
	}, [JSON.stringify(body)]);

	const center = body[0] ? [body[0].lat, body[0].lon] : [49.8, 14.8];
	const height = window.innerWidth > 768 ? 500 : 350;

	return (
		<Box style={{ minHeight: height, width: "100%", position: "relative" }}>
			{loading && <Loader />}
			<MapContainer
				style={{ height: height, width: "100%", zIndex: 1 }}
				center={center}
				zoom={13}
				scrollWheelZoom={false}
			>
				<TileLayer
					url={`https://api.mapy.cz/v1/maptiles/outdoor/256/{z}/{x}/{y}?apikey=${MAPY_API_KEY}`}
					attribution='Mapové podklady © <a href="https://www.seznam.cz/">Seznam.cz, a.s.</a> a další'
				/>
				{body.map((point, i) => (
					<Marker
						key={i}
						position={[point.lat, point.lon]}
						icon={signIcon}
					>
						<Popup>{point.content}</Popup>
					</Marker>
				))}
				{routeCoords.length > 1 && (
					<Polyline positions={routeCoords} color="#2266cc" weight={5} />
				)}
				<FitBounds points={body} />
			</MapContainer>
			{error && <Text c="red">{error}</Text>}
		</Box>
	);
}

export default MapaTrasy;
