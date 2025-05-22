# Portál značkaře

**Portál značkaře** je interní aplikace značkařú Klubu českých turistů (KČT) pro digitální správu metodiky a značkařských dokumentů.  
Projekt je založen na WordPressu (plugin) a Reactu (SPA frontend), běží kompletně v rámci jednoho pluginu.

---
## Hlavní vlastnosti

* **Metodika:** Správa článků v oddílech (dílech) metodiky, stromová navigace, TOC, soubory ke stažení.
* **Moderní UI:** Využívá [Mantine UI](https://mantine.dev/) a React SPA (routing pouze na frontendu).
* **Interní sekce:** Přihlášení, příkazy, vlastní API, uživatelské role.
* **WP Backend:** Custom Post Type `metodika`, taxonomie (díly metodiky), REST API endpointy.
* **Propojení s INSYS:** Backend obsahuje napojení na externí MSSQL databázi INSYS (KČT) pomocí PDO (`pdo_sqlsrv`).
  > **Na serveru je nutné mít k dispozici rozšíření `pdo_sqlsrv`!**

---

## Rychlý start (vývoj)

1. **Požadavky:**

	* PHP >= 8.1
	* Node.js >= 18.20.8
	* Composer
	* pdo\_sqlsrv (pro připojení k INSYS)
2. **Instalace:**

   ```bash
   composer install
   npm install
   ```
3. **Vývojové příkazy:**

   ```bash
   npm run start     # Vývojový server s hot reloadem
   npm run build     # Produkční build
   composer cs       # Kontrola coding standards (phpcs)
   ```
4. **Autorizace externích služeb:**

	plugin pro správné fungování vyžaduje přístupové udáje externích služeb. 
	* Vytvořte `.env` soubor s potřebnými údaji v rootu instalace WP. např.:
   ```dotenv
	  INSYS_DB_HOST=sql.example.cz
	  INSYS_DB_NAME=example
	  INSYS_DB_USER=example
	  INSYS_DB_PASS=example
   ```

5. **Použití:**

	* Plugin se instaluje do WordPressu (doporučeno pomocí [Bedrock](https://roots.io/bedrock/) nebo podobného prostředí).
	* Aktivuj plugin přes administraci WP.
	* Frontend (React app) je součástí pluginu a builduje se do `/build`.

---

## Důležité poznámky

* Po aktivaci pluginu a změně struktury url vždy ulož permalinky v administraci WordPressu (Nastavení > Trvalé odkazy).
* Každý článek metodiky (CPT metodika) musí být přiřazen pod konkrétní taxonomii (díl metodiky).
* Pokud je článek bez přiřazené taxonomie, nebude dostupný na správné URL a může způsobit chyby v aplikaci.
* Prázdné kategorie (bez článků) se jednoduše nezobrazí.
* Permalinky odpovídají struktuře /metodika/{term}/{slug} (oddíl/článek).

---

## Použité technologie

* WordPress 6+ (plugin-based, headless)
* PHP 8.1+, Composer, WPify balíčky, DI, WPify Scoper
* React 18+, TypeScript, Mantine, react-router-dom, mantine-react-table
* Externí databáze: MSSQL (INSYS, KČT) přes pdo_sqlsrv
* Dev nástroje: WPify Scripts, PHP CodeSniffer, WPCS

---

## Autor

[Martin Svoboda](https://martin-svoboda.cz/)

Projekt je určen pouze pro interní potřeby KČT. Pokud potřebujete přispívat nebo řešit support, kontaktujte autora.
