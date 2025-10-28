# Thaali Gold Calculator - API Setup Guide

## Current Configuration

The thaali calculator uses **FREE** APIs that require no signup:

### Primary APIs:
1. **Metals.dev API** (Gold Prices)
   - Current: Using DEMO key
   - Limit: Limited requests
   - Data: Live 24k gold prices per troy ounce

2. **ExchangeRate-API** (Currency Conversion)
   - Current: Free tier (no key needed)
   - Limit: 1,500 requests/month
   - Data: USD to GBP conversion rates

## Getting Your Own Free API Keys (Optional but Recommended)

### Option 1: Metals.dev (Recommended)
**Features:** 500 requests/month free, reliable, updated frequently

1. Visit: https://metals.dev
2. Sign up for free account
3. Get your API key from dashboard
4. Update `js/thaali.js`:
   ```javascript
   // Line ~28, replace:
   const goldResponse = await fetch('https://api.metals.dev/v1/latest?api_key=DEMO&currency=USD&unit=toz');
   // With:
   const goldResponse = await fetch('https://api.metals.dev/v1/latest?api_key=YOUR_API_KEY&currency=USD&unit=toz');
   ```

### Option 2: GoldAPI.io
**Features:** 100 requests/month free, very accurate

1. Visit: https://goldapi.io
2. Sign up for free account
3. Get your API key
4. Update `js/thaali.js` (replace the entire `loadGoldPrice` function):
   ```javascript
   async function loadGoldPrice() {
       try {
           showLoading();
           
           const goldResponse = await fetch('https://www.goldapi.io/api/XAU/USD', {
               headers: {
                   'x-access-token': 'YOUR_GOLDAPI_KEY_HERE'
               }
           });
           
           if (!goldResponse.ok) throw new Error('Failed to fetch gold price');
           
           const goldData = await goldResponse.json();
           
           const exchangeResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
           if (!exchangeResponse.ok) throw new Error('Failed to fetch exchange rate');
           
           const exchangeData = await exchangeResponse.json();
           
           currentGoldPriceUSD = goldData.price_gram_24k;
           currentExchangeRate = exchangeData.rates.GBP;
           
           displayPrices(goldData, exchangeData);
           calculateThaali();
           
       } catch (error) {
           console.error('Error loading gold price:', error);
           showError('Unable to fetch live prices. Please try again later.');
           useFallbackPrices();
       }
   }
   ```

### Option 3: Metals-API.com
**Features:** 50 requests/month free

1. Visit: https://metals-api.com
2. Sign up for free
3. Get your API key
4. Update API endpoint accordingly

## Alternative: Fallback Prices

If APIs fail or rate limits are exceeded, the calculator automatically uses fallback prices that you can update manually:

In `js/thaali.js`, find the `useFallbackPrices()` function (~line 70) and update:

```javascript
function useFallbackPrices() {
    // Update these values periodically (check current gold prices online)
    currentGoldPriceUSD = 65;      // ~$65 per gram of 24k gold
    currentExchangeRate = 0.79;     // ~0.79 GBP per USD
    
    // Rest of function...
}
```

## Updating Fallback Prices

Check current gold prices at:
- https://www.goldprice.org
- https://www.kitco.com/charts/livegold.html
- https://www.investing.com/commodities/gold

**Recommended:** Update fallback prices monthly

## Troubleshooting

### "Unable to fetch live prices" error
- Check your internet connection
- Verify API key is correct (if using one)
- Check if you've hit rate limits
- Try refreshing after a few minutes

### CORS Errors in Browser Console
- Some APIs don't work with file:// protocol
- Use a local server (Python: `python3 -m http.server`)
- Or deploy to GitHub Pages / web hosting

### Prices seem outdated
- Click the refresh button on the page
- Check if API is still active
- Consider getting your own API key for more frequent updates

## Rate Limit Management

To avoid hitting rate limits:
1. Don't refresh too frequently (once per session is usually enough)
2. Consider implementing localStorage caching (cache for 1 hour)
3. Use your own API keys for higher limits

## Cost Calculation Details

**Sovereign Specifications:**
- Total weight: 7.98 grams
- Purity: 22 karat (91.67% pure gold)
- Pure gold content: 7.32 grams

The calculator uses the pure gold content (7.32g) multiplied by the 24k gold price to give you the most accurate material cost estimate.

**Note:** Actual jeweler prices will include:
- Making charges (10-25% typical)
- GST/VAT
- Store markup
- Design complexity charges

## Security Note

API keys are exposed in client-side code. This is acceptable for free-tier keys with low limits. For production apps with sensitive keys, use a backend server to proxy API requests.

## Support

For issues or questions about the APIs:
- Metals.dev: support@metals.dev
- GoldAPI.io: contact via their website
- ExchangeRate-API: Free tier support via documentation

---

**Last Updated:** October 2025
**Page:** thaali.html
**Script:** js/thaali.js

