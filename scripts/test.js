#!/usr/bin/env node

/**
 * Test script to validate helper functions without API calls
 */

const { getCountryCode, getAvailableCountries } = require('./countryCodeMap');
const { geocodeCity } = require('./geocoding');

console.log('🧪 Testing Player Data Generation Helpers\n');

// Test 1: Country Code Mapping
console.log('1️⃣  Testing Country Code Mapping...');
const testCountries = ['USA', 'Germany', 'Italy', 'England', 'Brazil', 'Argentina'];
testCountries.forEach(country => {
  const code = getCountryCode(country);
  console.log(`   ${country.padEnd(12)} → ${code || '❌ NOT FOUND'}`);
});

// Test case sensitivity
console.log('\n   Testing case-insensitivity:');
console.log(`   "united states" → ${getCountryCode('united states')}`);
console.log(`   "GERMANY"       → ${getCountryCode('GERMANY')}`);

console.log(`\n   ✅ ${getAvailableCountries().length} countries in mapping\n`);

// Test 2: Geocoding (single test to avoid rate limits)
console.log('2️⃣  Testing Geocoding API...');
console.log('   Note: This makes a real API call to OpenStreetMap\n');

(async () => {
  try {
    console.log('   Geocoding: Dallas, USA');
    const coords = await geocodeCity('Dallas', 'USA');
    
    if (coords) {
      console.log(`   ✅ Latitude:  ${coords.lat}`);
      console.log(`   ✅ Longitude: ${coords.lng}`);
      console.log('\n   Expected: ~32.77°N, ~96.79°W');
      
      // Validate ranges
      const latValid = coords.lat >= -90 && coords.lat <= 90;
      const lngValid = coords.lng >= -180 && coords.lng <= 180;
      
      if (latValid && lngValid) {
        console.log('   ✅ Coordinates are valid!\n');
      } else {
        console.log('   ❌ Coordinates out of range!\n');
      }
    } else {
      console.log('   ❌ Geocoding failed\n');
    }
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }
  
  // Test 3: Player ID Generation
  console.log('3️⃣  Testing Player ID Generation...');
  const testNames = [
    'Weston McKennie',
    'Christian Pulisic',
    'Lionel Messi',
    'Kylian Mbappé',
  ];
  
  testNames.forEach(name => {
    const id = generatePlayerId(name);
    console.log(`   ${name.padEnd(20)} → ${id}`);
  });
  
  console.log('\n✅ All tests completed!\n');
  console.log('Next steps:');
  console.log('1. Set your OPENAI_API_KEY environment variable');
  console.log('2. Run: npm run generate-players');
  console.log('3. Follow the prompts to generate player data\n');
})();

/**
 * Generate player ID from name (copied from main script for testing)
 */
function generatePlayerId(name) {
  const parts = name.toLowerCase().split(' ');
  if (parts.length >= 2) {
    const lastName = parts[parts.length - 1];
    const firstName = parts[0];
    return `${lastName}-${firstName}-loc`;
  }
  return `${parts[0]}-loc`;
}
