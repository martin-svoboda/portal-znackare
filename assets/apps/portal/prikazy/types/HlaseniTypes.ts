export interface FileAttachment {
	id: string;
	fileName: string;
	fileSize: number;
	fileType: string;
	uploadedAt: Date;
	uploadedBy: string;
	url?: string;
	thumbnailUrl?: string;
	rotation?: number;
}

export interface TravelSegment {
	id: string;
	startDate: Date;
	endDate: Date;
	startTime: string;
	endTime: string;
	startPlace: string;
	endPlace: string;
	transportType: "AUV" | "AUV-Z" | "AUV-Z-VYSSI" | "veřejná doprava" | "pěšky" | "kolo";
	kilometers: number;
	ticketCosts: number;
	attachments: FileAttachment[];
	vehicleRegistration?: string; // Pro druhého řidiče
	memberIndex?: number; // Pro kterého člena skupiny
}

export interface Accommodation {
	id: string;
	place: string;
	facility: string;
	date: Date;
	amount: number;
	paidByMember: number; // Index člena skupiny (1-3)
	attachments: FileAttachment[];
}

export interface AdditionalExpense {
	id: string;
	description: string;
	date: Date;
	amount: number;
	paidByMember: number; // Index člena skupiny (1-3)
	attachments: FileAttachment[];
}

export interface TimItemStatus {
	itemId: string;
	status: 1 | 2 | 3 | 4; // 1-Nová, 2-Zachovalá, 3-Nevyhovující, 4-Zcela chybí
	yearOfProduction?: number;
	arrowOrientation?: "L" | "P"; // Pro směrovky
	comment?: string;
}

export interface TimReport {
	timId: string; // EvCi_TIM
	structuralComment: string; // Komentář k nosnému prvku
	structuralAttachments: FileAttachment[];
	centerRuleCompliant?: boolean; // Splňuje středové pravidlo
	centerRuleComment?: string;
	itemStatuses: TimItemStatus[]; // Stavy jednotlivých tabulek/směrovek
	generalComment?: string;
	photos: FileAttachment[];
}

export interface RouteSegmentReport {
	segmentId: string;
	comment: string;
	attachments: FileAttachment[];
	mapCompliant?: boolean; // Souhlasí s mapou
	mapComment?: string;
	mapAttachments: FileAttachment[];
}

export interface HlaseniFormData {
	// Část A - Provedení
	executionDate: Date;
	travelSegments: TravelSegment[];
	primaryDriver: string; // Jméno hlavního řidiče
	vehicleRegistration: string; // RZ hlavního vozidla
	higherKmRate: boolean; // Vyšší sazba kilometrovného
	accommodations: Accommodation[];
	additionalExpenses: AdditionalExpense[];
	partACompleted: boolean;
	
	// Část B - Stav TIM (pouze pro ZPO)
	timReports: Record<string, TimReport>; // Key = EvCi_TIM
	routeComment: string;
	routeAttachments?: FileAttachment[];
	partBCompleted: boolean;
	
	// Přesměrování výplat
	paymentRedirects: Record<number, number>; // Key = člen který posílá, Value = člen který dostává
	
	// Metadata
	createdAt?: Date;
	updatedAt?: Date;
	submittedAt?: Date;
	status?: "draft" | "submitted" | "approved" | "rejected";
}

export interface PriceListItem {
	type: string;
	description: string;
	price: number;
	unit: string;
	validFrom: Date;
	validTo?: Date;
}

export interface PriceList {
	transport: PriceListItem[];
	work: PriceListItem[];
	other: PriceListItem[];
}

export interface CompensationCalculation {
	transportCosts: number;
	workCompensation: number;
	accommodationCosts: number;
	additionalExpenses: number;
	total: number;
	breakdown: {
		member: number;
		name: string;
		transportCosts: number;
		workCompensation: number;
		accommodationCosts: number;
		additionalExpenses: number;
		total: number;
		redirectedTo?: number;
	}[];
}