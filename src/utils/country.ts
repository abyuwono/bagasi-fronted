export const getCityCountryCode = (city: string): string => {
  const cityToCountry: { [key: string]: string } = {
    'Jakarta': 'ID',
    'Bogor': 'ID',
    'Bandung': 'ID',
    'Surabaya': 'ID',
    'Medan': 'ID',
    'Bali': 'ID',
    'Sydney': 'AU',
    'Melbourne': 'AU',
    'Brisbane': 'AU',
    'Perth': 'AU',
    'Singapore': 'SG',
    'Kuala Lumpur': 'MY',
    'Tokyo': 'JP',
    'Seoul': 'KR',
    'Hong Kong': 'HK',
    'Bangkok': 'TH',
  };

  // Try to find an exact match first
  const exactMatch = cityToCountry[city];
  if (exactMatch) return exactMatch;

  // If no exact match, try to find a partial match
  const cityLower = city.toLowerCase();
  for (const [knownCity, countryCode] of Object.entries(cityToCountry)) {
    if (cityLower.includes(knownCity.toLowerCase())) {
      return countryCode;
    }
  }

  // Default to ID if no match found
  return 'ID';
};
