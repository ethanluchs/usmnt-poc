// ISO 3166-1 numeric country codes mapping
// Used to ensure consistent country codes in player career data

const COUNTRY_CODE_MAP = {
  // North & Central America
  'USA': '840',
  'United States': '840',
  'Mexico': '484',
  'Canada': '124',
  'Costa Rica': '188',
  'Panama': '591',
  'Jamaica': '388',
  'Honduras': '340',
  'El Salvador': '222',
  'Trinidad and Tobago': '780',
  
  // South America
  'Argentina': '032',
  'Brazil': '076',
  'Uruguay': '858',
  'Colombia': '170',
  'Chile': '152',
  'Ecuador': '218',
  'Peru': '604',
  'Paraguay': '600',
  'Venezuela': '862',
  'Bolivia': '068',
  
  // Europe - Major Football Nations
  'England': '826',
  'United Kingdom': '826',
  'UK': '826',
  'Germany': '276',
  'Spain': '724',
  'France': '250',
  'Italy': '380',
  'Netherlands': '528',
  'Portugal': '620',
  'Belgium': '056',
  'Switzerland': '756',
  'Austria': '040',
  'Denmark': '208',
  'Sweden': '752',
  'Norway': '578',
  'Poland': '616',
  'Czech Republic': '203',
  'Croatia': '191',
  'Serbia': '688',
  'Scotland': '826',
  'Wales': '826',
  'Northern Ireland': '826',
  'Greece': '300',
  'Turkey': '792',
  'Russia': '643',
  'Ukraine': '804',
  'Romania': '642',
  'Slovakia': '703',
  'Hungary': '348',
  'Bulgaria': '100',
  'Slovenia': '705',
  'Bosnia and Herzegovina': '070',
  'Finland': '246',
  'Ireland': '372',
  'Iceland': '352',
  'Monaco': '377',
  
  // Asia & Oceania
  'Japan': '392',
  'South Korea': '410',
  'Korea': '410',
  'Australia': '036',
  'Saudi Arabia': '682',
  'Iran': '364',
  'Qatar': '634',
  'United Arab Emirates': '784',
  'UAE': '784',
  'China': '156',
  'India': '356',
  'Thailand': '764',
  'Vietnam': '704',
  'Indonesia': '360',
  'New Zealand': '554',
  
  // Africa
  'South Africa': '710',
  'Nigeria': '566',
  'Egypt': '818',
  'Morocco': '504',
  'Tunisia': '788',
  'Algeria': '012',
  'Ghana': '288',
  'Senegal': '686',
  'Cameroon': '120',
  'Ivory Coast': '384',
  'Kenya': '404',
};

/**
 * Get ISO 3166-1 numeric country code from country name
 * @param {string} countryName - The country name to lookup
 * @returns {string|null} - The 3-digit numeric country code or null if not found
 */
function getCountryCode(countryName) {
  if (!countryName) return null;
  
  // Direct lookup
  if (COUNTRY_CODE_MAP[countryName]) {
    return COUNTRY_CODE_MAP[countryName];
  }
  
  // Case-insensitive lookup
  const normalized = countryName.trim();
  const match = Object.keys(COUNTRY_CODE_MAP).find(
    key => key.toLowerCase() === normalized.toLowerCase()
  );
  
  return match ? COUNTRY_CODE_MAP[match] : null;
}

/**
 * Get all available countries in the mapping
 * @returns {string[]} - Array of country names
 */
function getAvailableCountries() {
  return Object.keys(COUNTRY_CODE_MAP).sort();
}

module.exports = {
  COUNTRY_CODE_MAP,
  getCountryCode,
  getAvailableCountries,
};
