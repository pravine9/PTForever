// Thaali Gold Price Calculator

// ============================================
// CONFIGURATION - ADD YOUR API KEY HERE
// ============================================
// RECOMMENDED: Gold-API.com - UNLIMITED FREE REQUESTS!
// Get your free API key from: https://gold-api.com/
// Sign up (free) and get your API key from dashboard
// 
// Alternative: GoldAPI.io (1,000 requests/month)
// Get key from: https://goldapi.io/
const GOLD_API_KEY = ''; // Add your API key here (leave empty to use fallback)

// Constants
const GRAMS_PER_TROY_OUNCE = 31.1034768;
const PURE_GOLD_PER_SOVEREIGN = 7.32; // grams of pure gold in one sovereign

// Global state
let currentGoldPriceUSD = 0;
let currentExchangeRate = 0;

// LocalStorage keys
const CACHE_KEY_GOLD_PRICE = 'thaali_gold_price';
const CACHE_KEY_EXCHANGE_RATE = 'thaali_exchange_rate';
const CACHE_KEY_TIMESTAMP = 'thaali_cache_timestamp';
const CACHE_KEY_LAST_FETCH = 'thaali_last_fetch';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const RATE_LIMIT = 60 * 1000; // 1 minute between refreshes

// Track fetch status
let lastFetchWasSuccessful = false;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadGoldPrice();
});

// Save gold price to localStorage
function saveToCache(goldPrice, exchangeRate) {
    try {
        localStorage.setItem(CACHE_KEY_GOLD_PRICE, goldPrice.toString());
        localStorage.setItem(CACHE_KEY_EXCHANGE_RATE, exchangeRate.toString());
        localStorage.setItem(CACHE_KEY_TIMESTAMP, Date.now().toString());
        localStorage.setItem(CACHE_KEY_LAST_FETCH, Date.now().toString());
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
    }
}

// Check if rate limited
function isRateLimited() {
    try {
        const lastFetch = localStorage.getItem(CACHE_KEY_LAST_FETCH);
        if (lastFetch) {
            const timeSinceLastFetch = Date.now() - parseInt(lastFetch);
            return timeSinceLastFetch < RATE_LIMIT;
        }
    } catch (e) {
        console.error('Failed to check rate limit:', e);
    }
    return false;
}

// Get seconds until next allowed refresh
function getSecondsUntilRefresh() {
    try {
        const lastFetch = localStorage.getItem(CACHE_KEY_LAST_FETCH);
        if (lastFetch) {
            const timeSinceLastFetch = Date.now() - parseInt(lastFetch);
            const timeRemaining = RATE_LIMIT - timeSinceLastFetch;
            return Math.ceil(timeRemaining / 1000);
        }
    } catch (e) {
        console.error('Failed to calculate refresh time:', e);
    }
    return 0;
}

// Load gold price from localStorage
function loadFromCache() {
    try {
        const cachedGoldPrice = localStorage.getItem(CACHE_KEY_GOLD_PRICE);
        const cachedExchangeRate = localStorage.getItem(CACHE_KEY_EXCHANGE_RATE);
        const cachedTimestamp = localStorage.getItem(CACHE_KEY_TIMESTAMP);
        
        if (cachedGoldPrice && cachedExchangeRate && cachedTimestamp) {
            const age = Date.now() - parseInt(cachedTimestamp);
            const goldPrice = parseFloat(cachedGoldPrice);
            const exchangeRate = parseFloat(cachedExchangeRate);
            
            if (!isNaN(goldPrice) && !isNaN(exchangeRate) && goldPrice > 0 && exchangeRate > 0) {
                return {
                    goldPrice,
                    exchangeRate,
                    age,
                    isExpired: age > CACHE_DURATION
                };
            }
        }
    } catch (e) {
        console.error('Failed to load from localStorage:', e);
    }
    return null;
}

// Load gold price from API
async function loadGoldPrice() {
    try {
        showLoading();
        
        // Try multiple API sources in order of preference
        // 1. GoldAPI.io (requires free API key but very reliable)
        // 2. Metals.live (free, no auth needed)
        // 3. Fallback to approximate prices
        
        let goldPricePerOunce = null;
        let exchangeRate = null;
        
        // First, get exchange rate (this usually works)
        try {
            const exchangeResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            if (exchangeResponse.ok) {
                const exchangeData = await exchangeResponse.json();
                exchangeRate = exchangeData.rates.GBP;
            }
        } catch (e) {
            console.error('Exchange rate fetch failed:', e);
        }
        
        // Try to get gold price from Gold-API.com (UNLIMITED free requests!)
        if (GOLD_API_KEY) {
            try {
                // Gold-API.com format: https://www.gold-api.com/api/{symbol}/{currency}/{api_key}
                const goldResponse = await fetch(`https://www.gold-api.com/api/XAU/USD/${GOLD_API_KEY}`);
                
                if (goldResponse.ok) {
                    const goldData = await goldResponse.json();
                    // Gold-API.com returns price per troy ounce
                    goldPricePerOunce = goldData.price;
                } else {
                    console.warn('Gold-API returned error status:', goldResponse.status);
                }
            } catch (e) {
                console.error('Gold-API fetch failed, trying alternative:', e);
            }
        }
        
        // If no API key or Gold-API failed, try GoldAPI.io
        if (!goldPricePerOunce && GOLD_API_KEY) {
            try {
                const goldResponse = await fetch('https://www.goldapi.io/api/XAU/USD', {
                    headers: {
                        'x-access-token': GOLD_API_KEY,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (goldResponse.ok) {
                    const goldData = await goldResponse.json();
                    goldPricePerOunce = goldData.price;
                }
            } catch (e) {
                console.error('GoldAPI.io fetch failed:', e);
            }
        }
        
        // If gold API failed, try alternative source
        if (!goldPricePerOunce) {
            // Use a CORS proxy to access gold price data
            try {
                const response = await fetch('https://data-asg.goldprice.org/dbXRates/USD');
                if (response.ok) {
                    const data = await response.json();
                    // GoldPrice.org returns price per troy ounce
                    if (data && data.items && data.items.length > 0) {
                        goldPricePerOunce = parseFloat(data.items[0].xauPrice);
                    }
                }
            } catch (e) {
                console.error('Alternative gold price fetch failed:', e);
            }
        }
        
        // If we got data, use it and cache it
        if (goldPricePerOunce && exchangeRate) {
            const pricePerGramUSD = goldPricePerOunce / GRAMS_PER_TROY_OUNCE;
            
            currentGoldPriceUSD = pricePerGramUSD;
            currentExchangeRate = exchangeRate;
            lastFetchWasSuccessful = true;
            
            // Save to cache for future use
            saveToCache(pricePerGramUSD, exchangeRate);
            
            // Display without cached label (fresh data)
            displayPrices({
                price: goldPricePerOunce,
                price_gram_24k: pricePerGramUSD
            }, { rates: { GBP: exchangeRate } }, false);
            
            calculateThaali();
        } else {
            throw new Error('Unable to fetch live prices from any source');
        }
        
    } catch (error) {
        console.error('Error loading gold price:', error);
        lastFetchWasSuccessful = false;
        
        // Try to use cached data first
        const cachedData = loadFromCache();
        if (cachedData) {
            currentGoldPriceUSD = cachedData.goldPrice;
            currentExchangeRate = cachedData.exchangeRate;
            
            const pricePerOunce = cachedData.goldPrice * GRAMS_PER_TROY_OUNCE;
            const ageHours = Math.floor(cachedData.age / (60 * 60 * 1000));
            const ageMinutes = Math.floor(cachedData.age / (60 * 1000));
            
            // Only show cached label and error if cache is actually old (more than 1 minute)
            const showAsCached = ageMinutes > 1;
            
            if (showAsCached) {
                let ageText;
                if (ageHours > 0) {
                    ageText = `${ageHours} hour${ageHours !== 1 ? 's' : ''}`;
                } else {
                    ageText = `${ageMinutes} minute${ageMinutes !== 1 ? 's' : ''}`;
                }
                
                showError(`Unable to fetch live prices. Using cached data from ${ageText} ago.`);
            }
            
            // Get the cache timestamp for display
            const cacheTimestamp = parseInt(localStorage.getItem(CACHE_KEY_TIMESTAMP));
            
            // Show with cached label only if data is old
            displayPrices({
                price: pricePerOunce,
                price_gram_24k: cachedData.goldPrice
            }, { rates: { GBP: cachedData.exchangeRate } }, showAsCached, cacheTimestamp);
            
            calculateThaali();
        } else {
            // No cache available, use hardcoded fallback
            showError('Unable to fetch live prices. Using approximate fallback data.');
            useFallbackPrices();
        }
    }
}

// Display gold prices
function displayPrices(goldData, exchangeData, isCached = false, cacheTimestamp = null) {
    const pricePerOunce = goldData.price;
    const pricePerGramUSD = goldData.price_gram_24k;
    const pricePerGramGBP = pricePerGramUSD * exchangeData.rates.GBP;
    
    if (isCached) {
        document.getElementById('priceUSD').innerHTML = `$${pricePerOunce.toFixed(2)}<br><span class="cached-label">(cached)</span>`;
        document.getElementById('priceGramUSD').innerHTML = `$${pricePerGramUSD.toFixed(2)}<br><span class="cached-label">(cached)</span>`;
        document.getElementById('priceGramGBP').innerHTML = `£${pricePerGramGBP.toFixed(2)}<br><span class="cached-label">(cached)</span>`;
    } else {
        document.getElementById('priceUSD').textContent = `$${pricePerOunce.toFixed(2)}`;
        document.getElementById('priceGramUSD').textContent = `$${pricePerGramUSD.toFixed(2)}`;
        document.getElementById('priceGramGBP').textContent = `£${pricePerGramGBP.toFixed(2)}`;
    }
    
    // Use cache timestamp if provided and it's cached data, otherwise use current time
    const timestamp = (isCached && cacheTimestamp) ? new Date(cacheTimestamp) : new Date();
    const lastUpdated = timestamp.toLocaleString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
    document.getElementById('lastUpdated').textContent = lastUpdated;
    document.getElementById('exchangeRate').textContent = `1 USD = £${exchangeData.rates.GBP.toFixed(4)}`;
}

// Fallback prices if API fails and no cache available
function useFallbackPrices() {
    // Updated realistic fallback values (as of Oct 2025)
    const fallbackPricePerOunce = 2650; // ~$2,650 per troy ounce (realistic for 2025)
    currentGoldPriceUSD = fallbackPricePerOunce / GRAMS_PER_TROY_OUNCE; // ~$85 per gram
    currentExchangeRate = 0.77; // ~0.77 GBP per USD (realistic for 2025)
    
    document.getElementById('priceUSD').innerHTML = `$${fallbackPricePerOunce.toFixed(2)}<br><span class="cached-label">(est.)</span>`;
    document.getElementById('priceGramUSD').innerHTML = `$${currentGoldPriceUSD.toFixed(2)}<br><span class="cached-label">(est.)</span>`;
    document.getElementById('priceGramGBP').innerHTML = `£${(currentGoldPriceUSD * currentExchangeRate).toFixed(2)}<br><span class="cached-label">(est.)</span>`;
    document.getElementById('lastUpdated').textContent = 'Using fallback data';
    document.getElementById('exchangeRate').textContent = `1 USD = £${currentExchangeRate.toFixed(4)}`;
    
    calculateThaali();
}

// Calculate thaali cost based on sovereigns
function calculateThaali() {
    const sovereignCount = parseFloat(document.getElementById('sovereignCount').value) || 0;
    const makingChargesPercent = parseFloat(document.getElementById('makingCharges').value) || 0;
    const vatIncluded = document.getElementById('vatIncluded').checked;
    
    if (sovereignCount < 0) {
        document.getElementById('sovereignCount').value = 0;
        return;
    }
    
    // Calculate total weight
    const totalPureGold = sovereignCount * PURE_GOLD_PER_SOVEREIGN;
    
    // Calculate base gold cost
    const baseCostUSD = totalPureGold * currentGoldPriceUSD;
    const baseCostGBP = baseCostUSD * currentExchangeRate;
    
    // Calculate making charges
    const makingCostGBP = baseCostGBP * (makingChargesPercent / 100);
    
    // Calculate subtotal
    const subtotalGBP = baseCostGBP + makingCostGBP;
    
    // Calculate VAT if included
    const vatCostGBP = vatIncluded ? subtotalGBP * 0.20 : 0;
    
    // Calculate total
    const totalCostGBP = subtotalGBP + vatCostGBP;
    const totalCostUSD = totalCostGBP / currentExchangeRate;
    const costPerSovereignGBP = sovereignCount > 0 ? totalCostGBP / sovereignCount : 0;
    
    // Display results
    document.getElementById('totalWeight').textContent = `${totalPureGold.toFixed(2)}g`;
    document.getElementById('baseCostGBP').textContent = `£${baseCostGBP.toFixed(2)}`;
    document.getElementById('makingCostGBP').textContent = `£${makingCostGBP.toFixed(2)} (${makingChargesPercent}%)`;
    document.getElementById('totalCostUSD').textContent = `$${totalCostUSD.toFixed(2)}`;
    document.getElementById('totalCostGBP').textContent = `£${totalCostGBP.toFixed(2)}`;
    document.getElementById('costPerSovereign').textContent = sovereignCount > 0 ? `£${costPerSovereignGBP.toFixed(2)}` : '£0.00';
    
    // Show/hide VAT row
    const vatRow = document.getElementById('vatRow');
    if (vatIncluded) {
        vatRow.style.display = 'flex';
        document.getElementById('vatCostGBP').textContent = `£${vatCostGBP.toFixed(2)}`;
    } else {
        vatRow.style.display = 'none';
    }
    
    // Update toggle text
    document.getElementById('vatText').textContent = vatIncluded ? 'Included' : 'Excluded';
}

// Adjust sovereign count
function adjustSovereigns(delta) {
    const input = document.getElementById('sovereignCount');
    const currentValue = parseFloat(input.value) || 0;
    const newValue = Math.max(0, currentValue + delta);
    input.value = newValue;
    calculateThaali();
}

// Set specific number of sovereigns
function setSovereigns(count) {
    document.getElementById('sovereignCount').value = count;
    calculateThaali();
}

// Adjust making charges
function adjustMakingCharges(delta) {
    const input = document.getElementById('makingCharges');
    const currentValue = parseFloat(input.value) || 0;
    const newValue = Math.max(0, Math.min(100, currentValue + delta));
    input.value = newValue;
    calculateThaali();
}

// Set specific making charges percentage
function setMakingCharges(percent) {
    document.getElementById('makingCharges').value = percent;
    calculateThaali();
}

// Hide sovereign info banner
function hideSovereignInfo() {
    document.getElementById('sovereignInfo').style.display = 'none';
}

// Refresh gold price
async function refreshGoldPrice() {
    // Check rate limit
    if (isRateLimited()) {
        const seconds = getSecondsUntilRefresh();
        showError(`Please wait ${seconds} second${seconds !== 1 ? 's' : ''} before refreshing again.`);
        return;
    }
    
    const refreshBtn = document.querySelector('.refresh-icon');
    refreshBtn.style.animation = 'spin 1s linear';
    
    // Clear any existing error messages before fetching
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    await loadGoldPrice();
    
    setTimeout(() => {
        refreshBtn.style.animation = '';
    }, 1000);
}

// Show loading state
function showLoading() {
    document.getElementById('priceUSD').textContent = 'Loading...';
    document.getElementById('priceGramUSD').textContent = 'Loading...';
    document.getElementById('priceGramGBP').textContent = 'Loading...';
}

// Show error message
function showError(message) {
    const priceCard = document.querySelector('.gold-price-card');
    
    // Remove any existing error message first
    const existingError = priceCard.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    priceCard.appendChild(errorDiv);
    
    // Only auto-remove if it's a rate limit message
    if (message.includes('wait')) {
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }
}

