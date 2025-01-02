const axios = require('axios');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const API_URL = 'https://api.bagasi.id/api';
const SITEMAP_PATH = path.join(__dirname, '../public/sitemap.xml');

// Month translations
const monthTranslations = {
  'january': 'januari',
  'february': 'februari',
  'march': 'maret',
  'april': 'april',
  'may': 'mei',
  'june': 'juni',
  'july': 'juli',
  'august': 'agustus',
  'september': 'september',
  'october': 'oktober',
  'november': 'november',
  'december': 'desember'
};

async function getExistingUrls() {
  try {
    const sitemapXml = fs.readFileSync(SITEMAP_PATH, 'utf-8');
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(sitemapXml);
    
    // Extract all existing ad URLs
    const urls = result.urlset.url
      .map(url => url.loc[0])
      .filter(url => url.includes('/ads/'));
    
    return urls;
  } catch (error) {
    console.error('Error reading existing sitemap:', error);
    return [];
  }
}

async function getAllAds() {
  try {
    // Get all ads including expired ones
    const response = await axios.get(`${API_URL}/ads`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ads:', error);
    return [];
  }
}

function normalizeUrl(url) {
  // Convert to lowercase
  let normalized = url.toLowerCase();
  
  // Replace English month names with Indonesian ones
  Object.entries(monthTranslations).forEach(([english, indonesian]) => {
    normalized = normalized.replace(
      new RegExp(`-${english}-`, 'g'), 
      `-${indonesian}-`
    );
  });
  
  return normalized;
}

async function updateSitemap() {
  try {
    // Get existing URLs
    const existingUrls = await getExistingUrls();
    console.log(`Found ${existingUrls.length} existing ad URLs in sitemap`);
    const normalizedExistingUrls = existingUrls.map(url => normalizeUrl(url));

    // Get all ads from API
    const ads = await getAllAds();
    console.log(`Found ${ads.length} ads from API`);

    // Read existing sitemap
    const sitemapXml = fs.readFileSync(SITEMAP_PATH, 'utf-8');
    const parser = new xml2js.Parser();
    const sitemap = await parser.parseStringPromise(sitemapXml);

    // Find new ads not in sitemap
    let newAdsCount = 0;
    for (const ad of ads) {
      const departureDate = new Date(ad.departureDate);
      const month = departureDate.toLocaleString('default', { month: 'long' }).toLowerCase();
      const indonesianMonth = monthTranslations[month] || month;
      const formattedDate = `${departureDate.getDate()}-${indonesianMonth}-${departureDate.getFullYear()}`;
      const slug = `jastip-${ad.departureCity.toLowerCase()}-${ad.arrivalCity.toLowerCase()}`;
      const adUrl = `https://market.bagasi.id/ads/${slug}/${formattedDate}/${ad._id}`;
      const normalizedAdUrl = normalizeUrl(adUrl);

      // Check if this ad URL already exists
      if (!normalizedExistingUrls.includes(normalizedAdUrl)) {
        // Add new URL to sitemap
        sitemap.urlset.url.push({
          loc: [adUrl],
          lastmod: [new Date(ad.updatedAt || ad.createdAt).toISOString()],
          changefreq: ['daily'],
          priority: ['0.7']
        });
        newAdsCount++;
        console.log(`Adding new ad: ${adUrl}`);
      }
    }

    if (newAdsCount > 0) {
      // Convert back to XML and write to file
      const builder = new xml2js.Builder();
      const updatedXml = builder.buildObject(sitemap);
      fs.writeFileSync(SITEMAP_PATH, updatedXml);
      console.log(`Added ${newAdsCount} new ads to sitemap`);
    } else {
      console.log('No new ads to add to sitemap');
    }

  } catch (error) {
    console.error('Error updating sitemap:', error);
  }
}

updateSitemap();
