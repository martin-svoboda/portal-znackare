import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../utils/apiClient";
import { notifications } from "@mantine/notifications";

export type Term = {
	id: number;
	slug: string;
	name: string;
	description?: string;
	term_id?: number; // kvůli kompatibilitě (někde v API může být)
};
type TermsContextType = {
	terms: Term[];
	loadingTerms: boolean;
	error?: string;
};

const MetodikaTermsContext = createContext<TermsContextType | undefined>(undefined);

export const useMetodikaTerms = () => {
	const ctx = useContext(MetodikaTermsContext);
	if (!ctx) throw new Error("useMetodikaTerms must be used within MetodikaTermsProvider");
	return ctx;
};

export const MetodikaTermsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [terms, setTerms] = useState<Term[]>([]);
	const [loadingTerms, setLoadingTerms] = useState(true);
	const [error, setError] = useState<string | undefined>(undefined);

	const fetchData = async () => {
		setLoadingTerms(true);
		setError(null);
		try {
			const fetchedTerms = await apiRequest("/metodika-terms", "GET");
			setTerms(fetchedTerms);
		} catch (err: any) {
			setError(err?.message || "Chyba při načítání kategorií metodiky");
			notifications.show({
				color: "red",
				title: "Chyba metodiky",
				message: err?.message || "Chyba při načítání kategorií metodiky",
				autoClose: 6000,
			});
			setTerms([]);
		} finally {
			setLoadingTerms(false);
		}
	};

	useEffect(() => { fetchData(); }, []);

	return (
		<MetodikaTermsContext.Provider value={{ terms, loadingTerms, error }}>
			{children}
		</MetodikaTermsContext.Provider>
	);
};
