import React from 'react';

// Vlastní SVG ikony
const BusIcon = ({size = 10}: { size?: number }) => (
	<svg width={Math.round(size * 1.7)} height={size} viewBox="0 0 30 16" version="1.1"
		 xmlns="http://www.w3.org/2000/svg">
		<circle fill="currentColor" cx="6.737" cy="12.873" r="2.794"/>
		<circle fill="currentColor" cx="23.458" cy="12.873" r="2.794"/>
		<path fill="currentColor"
			  d="M2.909,12.875l-2.918,-0c-0,-0 0.019,-8.987 -0,-11.051c-0.009,-0.892 0.363,-1.411 1.066,-1.443c2.429,-0.109 25.689,0 25.689,0c-0,0 0.491,0.11 0.875,0.878c0.445,0.89 1.724,3.349 2.213,4.228c0.161,0.289 0.175,0.995 0.175,0.995l0,6.393l-2.77,-0l-0,-0.002c-0,-2.1 -1.705,-3.804 -3.805,-3.804c-2.099,-0 -3.804,1.704 -3.804,3.804l0,0.002l-9.112,-0l-0,-0.002c-0,-2.1 -1.705,-3.804 -3.804,-3.804c-2.1,-0 -3.805,1.704 -3.805,3.804l0,0.002Zm23.608,-10.936l-3.686,-0l0,4.164l5.736,0l-2.05,-4.164Zm-19.063,-0l-6.091,-0l0,3.911l6.091,-0l-0,-3.911Zm7.156,-0l-6.091,-0l0,3.911l6.091,-0l-0,-3.911Zm7.156,-0l-6.091,-0l0,3.911l6.091,-0l-0,-3.911Z"/>
	</svg>
);

const TrainIcon = ({size = 10}: { size?: number }) => (
	<svg width={Math.round(size * 1.7)} height={size} viewBox="0 0 30 16" version="1.1"
		 xmlns="http://www.w3.org/2000/svg">
		<path fill="currentColor"
			  d="M25.162,12.904l-6.052,0c-0.071,-1.527 -1.333,-2.745 -2.878,-2.745c-1.544,-0 -2.807,1.218 -2.878,2.745l-1.574,0c-0.071,-1.527 -1.333,-2.745 -2.877,-2.745c-1.287,-0 -2.377,0.844 -2.747,2.009c-0.074,0.234 -0.247,0.736 -0.247,0.736l0,1.703l-1.18,0l-0,-0.926l-2.412,-0.001l-0.002,-10.676l-2.326,0l0,-2.252l9.417,0l-0,2.622l6.018,-0l-0,-2.549l2.237,0l-0,2.549l6.493,-0l-0,-3.444l3.051,0l0,3.444l1.012,-0l-0,0.53l0.908,0l0,5.985l-0.908,0l-0,1.563l1.794,0l-0,1.452l-3.659,0l-0,2.142l-1.19,0l-0,-2.142Zm-16.654,-9.965l-5.09,-0l0,3.074l5.09,0l-0,-3.074Z"/>
		<circle fill="currentColor" cx="8.871" cy="13.36" r="2.492"/>
		<circle fill="currentColor" cx="16.252" cy="13.36" r="2.492"/>
		<circle fill="currentColor" cx="23.207" cy="14.587" r="1.483"/>
		<circle fill="currentColor" cx="28.293" cy="14.587" r="1.483"/>
	</svg>
);

const LanIcon = ({size = 10}: { size?: number }) => (
	<svg width={size} height={size} viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg">
		<path fill="currentColor" d="M3 1v2h2V1M0 1v1l8-1V0M4 4v2h1V4M1 4v2h6V4M0 8V3h8v5"/>
	</svg>
)

const ParkIcon = ({size = 10}: { size?: number }) => (
	<svg width={size} height={size} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
		<g fill="currentColor">
			<path d="M9 8H7V6h2a1 1 0 0 1 0 2"/>
			<path d="M1 1h14v14H1zm8 3H5v8h2v-2h2a3 3 0 1 0 0-6"/>
		</g>
	</svg>
)

// Mapování textových klíčů na funkce vracející ikony
const iconMap: Record<string, (size: number) => React.ReactElement> = {
	'BUS': (size) => <BusIcon size={size}/>,
	'ŽST': (size) => <TrainIcon size={size}/>,
	'VLAK': (size) => <TrainIcon size={size}/>,
	'LAN': (size) => <LanIcon size={size}/>,
	'PARK': (size) => <ParkIcon size={size}/>,
};

/**
 * Nahradí textové značky začínající & příslušnými ikonami
 * @param text - Vstupní text obsahující značky ve formátu &TAG nebo &TAG1,TAG2,TAG3
 * @param iconSize - Velikost ikon (výchozí 16)
 * @returns React fragment s textem a ikonami
 */
export const replaceTextWithIcons = (text: string, iconSize: number = 16): React.ReactNode => {
	if (!text) return text;

	// Najdi všechny výskyty &NĚCO nebo &NĚCO,NĚCO2,NĚCO3
	const parts = text.split(/(&[A-ZÁĚŠČŘŽÝÚŮÍÓ.,]+)/i);

	if (parts.length === 1) return text;

	return (
		<span style={{display: 'inline-flex', gap: '4px', flexWrap: 'wrap'}}>
			{parts.map((part, i) => {
				if (part.startsWith('&')) {
					// Odstraň & a rozděl podle čárek
					const iconKeys = part.slice(1).split(',').map(key => key.trim());

					return iconKeys.map((iconKey, j) => {
						const normalizedKey = iconKey.toUpperCase().replace(/[.,]/g, ''); // Normalizuj klíč
						const iconFactory = iconMap[normalizedKey];

						if (iconFactory) {
							return <span style={{display: 'flex', alignItems: 'center'}}>{iconFactory(iconSize)}</span>;
						} else {
							return iconKey;
						}
					});
				}
				return <span key={i}>{part}</span>;
			})}
		</span>
	)
};
