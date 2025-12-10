// UK Stamp Duty Land Tax (SDLT) Calculator

// ============================================================================
// Configuration (current rates from April 2025)
// ============================================================================

const SDLT_CONFIG = {
    ftbPriceLimit: 500000,
    minPropertyValueForSurcharge: 40000,
    maxPrice: 100000000, // £100M limit

    standardRates: [
        { lower: 0, upper: 125000, rate: 0 },
        { lower: 125000, upper: 250000, rate: 0.02 },
        { lower: 250000, upper: 925000, rate: 0.05 },
        { lower: 925000, upper: 1500000, rate: 0.10 },
        { lower: 1500000, upper: Infinity, rate: 0.12 },
    ],

    ftbRates: [
        { lower: 0, upper: 300000, rate: 0 },
        { lower: 300000, upper: 500000, rate: 0.05 },
    ],

    higherRates: [
        { lower: 0, upper: 125000, rate: 0.05 },
        { lower: 125000, upper: 250000, rate: 0.07 },
        { lower: 250000, upper: 925000, rate: 0.10 },
        { lower: 925000, upper: 1500000, rate: 0.15 },
        { lower: 1500000, upper: Infinity, rate: 0.17 },
    ],
};

// ============================================================================
// Memory Keys for Form Inputs
// ============================================================================

const MEMORY_KEY_PROPERTY_PRICE = 'buyingahouse_property_price';
const MEMORY_KEY_PROPERTY_TYPE = 'buyingahouse_property_type';
const MEMORY_KEY_WILL_BE_MAIN_RESIDENCE = 'buyingahouse_will_be_main_residence';
const MEMORY_KEY_IS_REPLACING_MAIN_RESIDENCE = 'buyingahouse_is_replacing_main_residence';
const MEMORY_KEY_BUYER_TYPE = 'buyingahouse_buyer_type';
const MEMORY_KEY_HAS_EVER_OWNED_PROPERTY = 'buyingahouse_has_ever_owned_property';
const MEMORY_KEY_OWNS_PROPERTY_AT_COMPLETION = 'buyingahouse_owns_property_at_completion';
const MEMORY_KEY_SPOUSE_HAS_EVER_OWNED_PROPERTY = 'buyingahouse_spouse_has_ever_owned_property';
const MEMORY_KEY_SPOUSE_OWNS_PROPERTY_AT_COMPLETION = 'buyingahouse_spouse_owns_property_at_completion';

// ============================================================================
// DOM Element Cache
// ============================================================================

let domCache = {};

function cacheDOMElements() {
    domCache = {
        propertyPrice: document.getElementById('propertyPrice'),
        propertyTypeResidential: document.getElementById('propertyTypeResidential'),
        propertyTypeNonResidential: document.getElementById('propertyTypeNonResidential'),
        willBeMainResidence: document.getElementById('willBeMainResidence'),
        isReplacingMainResidence: document.getElementById('isReplacingMainResidence'),
        isReplacingMainResidenceMarried: document.getElementById('isReplacingMainResidenceMarried'),
        buyerTypeIndividual: document.getElementById('buyerTypeIndividual'),
        buyerTypeMarried: document.getElementById('buyerTypeMarried'),
        hasEverOwnedProperty: document.getElementById('hasEverOwnedProperty'),
        ownsPropertyAtCompletion: document.getElementById('ownsPropertyAtCompletion'),
        eitherHasEverOwnedProperty: document.getElementById('eitherHasEverOwnedProperty'),
        eitherOwnsPropertyAtCompletion: document.getElementById('eitherOwnsPropertyAtCompletion'),
        residentialOptions: document.getElementById('residentialOptions'),
        replacingResidenceRow: document.getElementById('replacingResidenceRow'),
        replacingResidenceRowMarried: document.getElementById('replacingResidenceRowMarried'),
        marriedOptions: document.getElementById('marriedOptions'),
        buyerOptionsGroup: document.getElementById('buyerOptionsGroup'),
        totalSDLT: document.getElementById('totalSDLT'),
        taxRegime: document.getElementById('taxRegime'),
        effectiveRate: document.getElementById('effectiveRate'),
        breakdownContainer: document.getElementById('breakdownContainer'),
        breakdownBody: document.getElementById('breakdownBody'),
        explanationContainer: document.getElementById('explanationContainer'),
        explanationContent: document.getElementById('explanationContent'),
        errorMessage: document.getElementById('errorMessage'),
        ftbIndicator: document.getElementById('ftbIndicator'),
    };
}

// ============================================================================
// Validation Functions
// ============================================================================

function validatePrice(price) {
    if (isNaN(price) || price === '' || price === null) {
        return { valid: false, error: 'Please enter a valid property price' };
    }
    if (price < 0) {
        return { valid: false, error: 'Price cannot be negative' };
    }
    if (price === 0) {
        return { valid: false, error: 'Price must be greater than £0' };
    }
    if (price > SDLT_CONFIG.maxPrice) {
        return { valid: false, error: `Price exceeds maximum of £${SDLT_CONFIG.maxPrice.toLocaleString()}. Please contact support.` };
    }
    return { valid: true };
}

function showError(message) {
    if (domCache.errorMessage) {
        domCache.errorMessage.textContent = message;
        domCache.errorMessage.style.display = 'block';
        domCache.errorMessage.setAttribute('aria-live', 'assertive');
    }
}

function hideError() {
    if (domCache.errorMessage) {
        domCache.errorMessage.style.display = 'none';
    }
}

// ============================================================================
// Core Calculation Functions
// ============================================================================

function calculateSDLTFromBands(price, bands) {
    let tax = 0;
    const breakdown = [];

    for (const band of bands) {
        if (price > band.lower) {
            const upperLimit = band.upper === Infinity ? price : Math.min(price, band.upper);
            const taxableSlice = upperLimit - band.lower;
            const sliceTax = taxableSlice * band.rate;

            if (taxableSlice > 0) {
                tax += sliceTax;
                breakdown.push({
                    band: `£${band.lower.toLocaleString()} - £${
                        band.upper === Infinity ? "∞" : band.upper.toLocaleString()
                    }`,
                    taxable: taxableSlice,
                    rate: band.rate,
                    tax: sliceTax,
                });
            }
        }
    }

    return { tax, breakdown };
}

function calculateSDLT(input, config = SDLT_CONFIG) {
    const {
        price,
        isResidential,
        willBeMainResidence,
        allBuyersAreIndividuals,
        allPurchasersAreFirstTimeBuyers,
        anyBuyerOrTheirSpouseHasOwnedPropertyBefore,
        anyBuyerOrTheirSpouseOwnsAnotherDwellingAtCompletion,
        isReplacingMainResidence,
    } = input;

    const { ftbPriceLimit, standardRates, ftbRates, higherRates } = config;

    // Validation
    if (price <= 0) {
        throw new Error("Price must be positive");
    }

    // Safety check for division by zero
    const safeEffectiveRate = (tax, price) => price > 0 ? tax / price : 0;

    // Non-residential (simplified - extend as needed)
    if (!isResidential) {
        const { tax, breakdown } = calculateSDLTFromBands(price, standardRates);
        return {
            tax,
            regime: "NON_RESIDENTIAL",
            effectiveRate: safeEffectiveRate(tax, price),
            breakdown,
        };
    }

    // Check for additional dwelling (higher rates)
    const isAdditionalDwelling =
        anyBuyerOrTheirSpouseOwnsAnotherDwellingAtCompletion &&
        !isReplacingMainResidence;

    if (isAdditionalDwelling) {
        const { tax, breakdown } = calculateSDLTFromBands(price, higherRates);
        return {
            tax,
            regime: "HIGHER_RATES",
            effectiveRate: safeEffectiveRate(tax, price),
            breakdown,
        };
    }

    // Check for First-Time Buyer relief
    const ftbEligible =
        allBuyersAreIndividuals &&
        willBeMainResidence &&
        price <= ftbPriceLimit &&
        allPurchasersAreFirstTimeBuyers &&
        !anyBuyerOrTheirSpouseHasOwnedPropertyBefore &&
        !anyBuyerOrTheirSpouseOwnsAnotherDwellingAtCompletion;

    if (ftbEligible) {
        const { tax, breakdown } = calculateSDLTFromBands(price, ftbRates);
        return {
            tax,
            regime: "FTB",
            effectiveRate: safeEffectiveRate(tax, price),
            breakdown,
        };
    }

    // Standard rates
    const { tax, breakdown } = calculateSDLTFromBands(price, standardRates);
    return {
        tax,
        regime: "STANDARD",
        effectiveRate: safeEffectiveRate(tax, price),
        breakdown,
    };
}

// ============================================================================
// Helper: Derive Economic Unit Flags
// ============================================================================

function deriveEconomicUnitFlags(persons) {
    const purchasers = persons.filter((p) => p.isPurchaser);

    if (purchasers.length === 0) {
        throw new Error("At least one purchaser required");
    }

    let allFTB = true;
    let anyOwnedBefore = false;
    let anyOwnsAnotherAtCompletion = false;

    for (const p of purchasers) {
        // Include spouse data if married/civil partnership and living together
        const spouseEverOwned =
            p.isMarriedOrCivilPartner && p.livesWithSpouse
                ? p.spouseHasEverOwnedProperty ?? false
                : false;

        const spouseOwnsAtCompletion =
            p.isMarriedOrCivilPartner && p.livesWithSpouse
                ? p.spouseOwnsPropertyAtCompletion ?? false
                : false;

        // Economic unit = purchaser + spouse
        const unitEverOwned = p.hasEverOwnedProperty || spouseEverOwned;
        const unitOwnsAtCompletion = p.ownsPropertyAtCompletion || spouseOwnsAtCompletion;

        if (unitEverOwned) {
            allFTB = false;
            anyOwnedBefore = true;
        }

        if (unitOwnsAtCompletion) {
            anyOwnsAnotherAtCompletion = true;
        }
    }

    return {
        allPurchasersAreFirstTimeBuyers: allFTB,
        anyBuyerOrTheirSpouseHasOwnedPropertyBefore: anyOwnedBefore,
        anyBuyerOrTheirSpouseOwnsAnotherDwellingAtCompletion: anyOwnsAnotherAtCompletion,
    };
}

// ============================================================================
// Convenience wrapper
// ============================================================================

function calculateSDLTForPersons(
    persons,
    price,
    isResidential,
    willBeMainResidence,
    isReplacingMainResidence,
    config = SDLT_CONFIG
) {
    const flags = deriveEconomicUnitFlags(persons);
    const allBuyersAreIndividuals = persons
        .filter((p) => p.isPurchaser)
        .every(() => true); // Extend if you need company logic

    const input = {
        price,
        isResidential,
        willBeMainResidence,
        allBuyersAreIndividuals,
        ...flags,
        isReplacingMainResidence,
    };

    return calculateSDLT(input, config);
}

// ============================================================================
// Memory Functions (Save/Load Form Inputs)
// ============================================================================

function saveBuyingHouseInputs() {
    try {
        localStorage.setItem(MEMORY_KEY_PROPERTY_PRICE, domCache.propertyPrice?.value || '');
        localStorage.setItem(MEMORY_KEY_PROPERTY_TYPE, domCache.propertyTypeResidential?.checked ? 'residential' : 'non-residential');
        localStorage.setItem(MEMORY_KEY_WILL_BE_MAIN_RESIDENCE, (domCache.willBeMainResidence?.checked || false).toString());
        localStorage.setItem(MEMORY_KEY_IS_REPLACING_MAIN_RESIDENCE, (domCache.isReplacingMainResidence?.checked || false).toString());
        localStorage.setItem(MEMORY_KEY_BUYER_TYPE, domCache.buyerTypeIndividual?.checked ? 'individual' : 'married');
        
        // Save based on buyer type
        const isMarried = domCache.buyerTypeMarried?.checked || false;
        if (isMarried) {
            localStorage.setItem(MEMORY_KEY_HAS_EVER_OWNED_PROPERTY, (domCache.eitherHasEverOwnedProperty?.checked || false).toString());
            localStorage.setItem(MEMORY_KEY_OWNS_PROPERTY_AT_COMPLETION, (domCache.eitherOwnsPropertyAtCompletion?.checked || false).toString());
        } else {
            localStorage.setItem(MEMORY_KEY_HAS_EVER_OWNED_PROPERTY, (domCache.hasEverOwnedProperty?.checked || false).toString());
            localStorage.setItem(MEMORY_KEY_OWNS_PROPERTY_AT_COMPLETION, (domCache.ownsPropertyAtCompletion?.checked || false).toString());
        }
        
        // Keep old keys for backward compatibility (but don't use them)
        localStorage.setItem(MEMORY_KEY_SPOUSE_HAS_EVER_OWNED_PROPERTY, 'false');
        localStorage.setItem(MEMORY_KEY_SPOUSE_OWNS_PROPERTY_AT_COMPLETION, 'false');
    } catch (e) {
        console.error('Failed to save buying house inputs:', e);
    }
}

function loadBuyingHouseInputs() {
    try {
        const savedPropertyPrice = localStorage.getItem(MEMORY_KEY_PROPERTY_PRICE);
        const savedPropertyType = localStorage.getItem(MEMORY_KEY_PROPERTY_TYPE);
        const savedWillBeMainResidence = localStorage.getItem(MEMORY_KEY_WILL_BE_MAIN_RESIDENCE);
        const savedIsReplacingMainResidence = localStorage.getItem(MEMORY_KEY_IS_REPLACING_MAIN_RESIDENCE);
        const savedBuyerType = localStorage.getItem(MEMORY_KEY_BUYER_TYPE);
        const savedHasEverOwnedProperty = localStorage.getItem(MEMORY_KEY_HAS_EVER_OWNED_PROPERTY);
        const savedOwnsPropertyAtCompletion = localStorage.getItem(MEMORY_KEY_OWNS_PROPERTY_AT_COMPLETION);
        const savedSpouseHasEverOwnedProperty = localStorage.getItem(MEMORY_KEY_SPOUSE_HAS_EVER_OWNED_PROPERTY);
        const savedSpouseOwnsPropertyAtCompletion = localStorage.getItem(MEMORY_KEY_SPOUSE_OWNS_PROPERTY_AT_COMPLETION);
        
        if (savedPropertyPrice !== null && domCache.propertyPrice) {
            domCache.propertyPrice.value = savedPropertyPrice;
        }
        if (savedPropertyType !== null) {
            if (savedPropertyType === 'residential' && domCache.propertyTypeResidential) {
                domCache.propertyTypeResidential.checked = true;
            } else if (savedPropertyType === 'non-residential' && domCache.propertyTypeNonResidential) {
                domCache.propertyTypeNonResidential.checked = true;
            }
        }
        if (savedWillBeMainResidence !== null && domCache.willBeMainResidence) {
            domCache.willBeMainResidence.checked = savedWillBeMainResidence === 'true';
        }
        if (savedIsReplacingMainResidence !== null && domCache.isReplacingMainResidence) {
            domCache.isReplacingMainResidence.checked = savedIsReplacingMainResidence === 'true';
        }
        if (savedBuyerType !== null) {
            if (savedBuyerType === 'individual' && domCache.buyerTypeIndividual) {
                domCache.buyerTypeIndividual.checked = true;
            } else if (savedBuyerType === 'married' && domCache.buyerTypeMarried) {
                domCache.buyerTypeMarried.checked = true;
            }
        }
        
        // Load based on buyer type
        const isMarried = savedBuyerType === 'married';
        if (isMarried) {
            if (savedHasEverOwnedProperty !== null && domCache.eitherHasEverOwnedProperty) {
                domCache.eitherHasEverOwnedProperty.checked = savedHasEverOwnedProperty === 'true';
            }
            if (savedOwnsPropertyAtCompletion !== null && domCache.eitherOwnsPropertyAtCompletion) {
                domCache.eitherOwnsPropertyAtCompletion.checked = savedOwnsPropertyAtCompletion === 'true';
            }
        } else {
            if (savedHasEverOwnedProperty !== null && domCache.hasEverOwnedProperty) {
                domCache.hasEverOwnedProperty.checked = savedHasEverOwnedProperty === 'true';
            }
            if (savedOwnsPropertyAtCompletion !== null && domCache.ownsPropertyAtCompletion) {
                domCache.ownsPropertyAtCompletion.checked = savedOwnsPropertyAtCompletion === 'true';
            }
        }
    } catch (e) {
        console.error('Failed to load buying house inputs:', e);
    }
}

// ============================================================================
// UI Functions
// ============================================================================

function togglePropertyType() {
    const propertyType = (domCache.propertyTypeResidential?.checked) ? 'residential' : 'non-residential';
    
    if (propertyType === 'residential') {
        domCache.residentialOptions?.classList.remove('hidden');
    } else {
        domCache.residentialOptions?.classList.add('hidden');
        domCache.replacingResidenceRow?.classList.add('hidden');
        if (domCache.willBeMainResidence) domCache.willBeMainResidence.checked = false;
        if (domCache.isReplacingMainResidence) domCache.isReplacingMainResidence.checked = false;
    }
    validateResidenceOptions();
    saveBuyingHouseInputs();
    debouncedCalculate();
}

function toggleMarriedOptions() {
    const buyerType = (domCache.buyerTypeMarried?.checked) ? 'married' : 'individual';
    
    // Get the parent input-section of buyerOptionsGroup
    const buyerOptionsSection = domCache.buyerOptionsGroup?.parentElement;
    
    if (buyerType === 'married') {
        domCache.marriedOptions?.classList.remove('hidden');
        domCache.buyerOptionsGroup?.classList.add('hidden');
        // Hide the border of the parent section when content is hidden
        if (buyerOptionsSection) {
            buyerOptionsSection.classList.add('content-hidden');
        }
    } else {
        domCache.marriedOptions?.classList.add('hidden');
        domCache.buyerOptionsGroup?.classList.remove('hidden');
        // Show the border again when content is visible
        if (buyerOptionsSection) {
            buyerOptionsSection.classList.remove('content-hidden');
        }
        // Reset married couple checkboxes
        if (domCache.eitherHasEverOwnedProperty) domCache.eitherHasEverOwnedProperty.checked = false;
        if (domCache.eitherOwnsPropertyAtCompletion) domCache.eitherOwnsPropertyAtCompletion.checked = false;
    }
    validateResidenceOptions();
    saveBuyingHouseInputs();
    debouncedCalculate();
}

function toggleReplacingResidence() {
    validateResidenceOptions();
    saveBuyingHouseInputs();
    debouncedCalculate();
}

// Validate residence options to prevent contradictory states
function validateResidenceOptions() {
    const willBeMainResidence = domCache.willBeMainResidence?.checked || false;
    const ownsPropertyAtCompletion = domCache.ownsPropertyAtCompletion?.checked || false;
    const eitherOwnsPropertyAtCompletion = domCache.eitherOwnsPropertyAtCompletion?.checked || false;
    const isMarried = domCache.buyerTypeMarried?.checked || false;
    
    // Check if user owns property (either individual or married)
    const ownsProperty = isMarried ? eitherOwnsPropertyAtCompletion : ownsPropertyAtCompletion;
    
    // If "Will be main residence" is unchecked, can't replace main residence
    if (!willBeMainResidence) {
        if (domCache.isReplacingMainResidence?.checked) {
            domCache.isReplacingMainResidence.checked = false;
        }
        if (domCache.isReplacingMainResidenceMarried?.checked) {
            domCache.isReplacingMainResidenceMarried.checked = false;
        }
        domCache.replacingResidenceRow?.classList.add('hidden');
        domCache.replacingResidenceRowMarried?.classList.add('hidden');
        return;
    }
    
    // Show/hide "Replacing main residence" option in the appropriate section
    if (ownsProperty && willBeMainResidence) {
        if (isMarried) {
            domCache.replacingResidenceRowMarried?.classList.remove('hidden');
            domCache.replacingResidenceRow?.classList.add('hidden');
        } else {
            domCache.replacingResidenceRow?.classList.remove('hidden');
            domCache.replacingResidenceRowMarried?.classList.add('hidden');
        }
    } else {
        domCache.replacingResidenceRow?.classList.add('hidden');
        domCache.replacingResidenceRowMarried?.classList.add('hidden');
        if (domCache.isReplacingMainResidence) {
            domCache.isReplacingMainResidence.checked = false;
        }
        if (domCache.isReplacingMainResidenceMarried) {
            domCache.isReplacingMainResidenceMarried.checked = false;
        }
    }
}


// Debouncing for price input
let calculationTimeout;
function debouncedCalculate() {
    clearTimeout(calculationTimeout);
    calculationTimeout = setTimeout(calculateStampDuty, 300);
}

function calculateStampDuty() {
    hideError();
    
    try {
        // Get and validate price
        const priceValue = domCache.propertyPrice.value;
        
        // Handle empty string explicitly
        if (priceValue === '' || priceValue === null || priceValue === undefined) {
            showError('Please enter a valid property price');
            updateResultsError();
            return;
        }
        
        // Round price to nearest pound (SDLT is calculated on whole pounds)
        const price = Math.round(parseFloat(priceValue));
        
        const validation = validatePrice(price);
        if (!validation.valid) {
            showError(validation.error);
            updateResultsError();
            return;
        }

        // Get property details
        const propertyType = (domCache.propertyTypeResidential?.checked) ? 'residential' : 'non-residential';
        const isResidential = propertyType === 'residential';
        const willBeMainResidence = domCache.willBeMainResidence?.checked || false;
        // Check the visible checkbox (individual or married)
        const isMarried = domCache.buyerTypeMarried?.checked || false;
        const isReplacingMainResidence = isMarried 
            ? (domCache.isReplacingMainResidenceMarried?.checked || false)
            : (domCache.isReplacingMainResidence?.checked || false);

        // Get buyer information
        const buyerType = (domCache.buyerTypeMarried?.checked) ? 'married' : 'individual';
        const isMarried = buyerType === 'married';
        
        // For married couples, use "either" options; for individuals, use individual options
        let hasEverOwnedProperty, ownsPropertyAtCompletion, spouseHasEverOwnedProperty, spouseOwnsPropertyAtCompletion;
        
        if (isMarried) {
            // Married couples: use "either" options
            // If "either" is checked, we set both buyer and spouse to true (economic unit)
            const eitherHasEverOwned = domCache.eitherHasEverOwnedProperty?.checked || false;
            const eitherOwnsAtCompletion = domCache.eitherOwnsPropertyAtCompletion?.checked || false;
            
            hasEverOwnedProperty = eitherHasEverOwned;
            ownsPropertyAtCompletion = eitherOwnsAtCompletion;
            spouseHasEverOwnedProperty = eitherHasEverOwned;
            spouseOwnsPropertyAtCompletion = eitherOwnsAtCompletion;
        } else {
            // Individual buyers: use individual options
            hasEverOwnedProperty = domCache.hasEverOwnedProperty?.checked || false;
            ownsPropertyAtCompletion = domCache.ownsPropertyAtCompletion?.checked || false;
            spouseHasEverOwnedProperty = undefined;
            spouseOwnsPropertyAtCompletion = undefined;
        }

        // Build person array
        const persons = [{
            isPurchaser: true,
            hasEverOwnedProperty: hasEverOwnedProperty,
            ownsPropertyAtCompletion: ownsPropertyAtCompletion,
            isMarriedOrCivilPartner: isMarried,
            livesWithSpouse: isMarried, // Assuming they live together if married
            spouseHasEverOwnedProperty: isMarried ? spouseHasEverOwnedProperty : undefined,
            spouseOwnsPropertyAtCompletion: isMarried ? spouseOwnsPropertyAtCompletion : undefined,
        }];

        // Calculate SDLT
        const result = calculateSDLTForPersons(
            persons,
            price,
            isResidential,
            willBeMainResidence,
            isReplacingMainResidence
        );

        // Add input context for explanations
        result.inputContext = {
            price,
            isResidential,
            willBeMainResidence,
            isReplacingMainResidence,
            isMarried,
            hasEverOwnedProperty,
            ownsPropertyAtCompletion,
            spouseHasEverOwnedProperty,
            spouseOwnsPropertyAtCompletion,
        };

        // Update UI
        updateResults(result);
        
        // Save inputs after successful calculation
        saveBuyingHouseInputs();

    } catch (error) {
        console.error('Error calculating SDLT:', error);
        showError('An error occurred during calculation. Please check your inputs and try again.');
        updateResultsError();
    }
}

function updateResults(result) {
    // Update main results
    domCache.totalSDLT.textContent = `£${result.tax.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    // Format regime name (simple text, no badge)
    const regimeNames = {
        'STANDARD': 'Standard Rates',
        'FTB': 'First-Time Buyer',
        'HIGHER_RATES': 'Higher Rates (Additional Dwelling)',
        'NON_RESIDENTIAL': 'Non-Residential'
    };
    domCache.taxRegime.textContent = regimeNames[result.regime] || result.regime;
    
    // Effective rate as percentage
    const effectiveRatePercent = (result.effectiveRate * 100).toFixed(2);
    domCache.effectiveRate.textContent = `${effectiveRatePercent}%`;

    // Update breakdown table
    if (result.breakdown && result.breakdown.length > 0) {
        domCache.breakdownBody.innerHTML = '';
        result.breakdown.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.band}</td>
                <td>£${item.taxable.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>${(item.rate * 100).toFixed(1)}%</td>
                <td>£${item.tax.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            `;
            domCache.breakdownBody.appendChild(row);
        });
        domCache.breakdownContainer.classList.remove('hidden');
    } else {
        domCache.breakdownContainer.classList.add('hidden');
    }
    
    // Update explanation
    updateExplanation(result);
    
    // Update FTB indicator
    updateFTBIndicator(result);
}

function updateResultsError() {
    domCache.totalSDLT.textContent = '£0.00';
    domCache.taxRegime.textContent = '-';
    domCache.effectiveRate.textContent = '0.00%';
    domCache.breakdownContainer.classList.add('hidden');
    domCache.explanationContainer.classList.add('hidden');
}

// Update FTB indicator from current inputs (without calculation)
function updateFTBIndicatorFromInputs() {
    if (!domCache.ftbIndicator) return;
    
    const price = parseFloat(domCache.propertyPrice?.value) || 0;
    const isResidential = domCache.propertyTypeResidential?.checked || false;
    const willBeMainResidence = domCache.willBeMainResidence?.checked || false;
    const isMarried = domCache.buyerTypeMarried?.checked || false;
    
    const hasEverOwned = isMarried 
        ? (domCache.eitherHasEverOwnedProperty?.checked || false)
        : (domCache.hasEverOwnedProperty?.checked || false);
    
    const ownsAtCompletion = isMarried
        ? (domCache.eitherOwnsPropertyAtCompletion?.checked || false)
        : (domCache.ownsPropertyAtCompletion?.checked || false);
    
    if (price === 0 || !isResidential) {
        domCache.ftbIndicator.classList.add('hidden');
        return;
    }
    
    domCache.ftbIndicator.classList.remove('hidden');
    
    // FTB eligibility check - matches the calculation logic
    // For married couples, FTB can apply if both meet criteria (neither has ever owned, neither owns at completion)
    const ftbEligible = isResidential && 
                       willBeMainResidence && 
                       price > 0 &&
                       price <= SDLT_CONFIG.ftbPriceLimit &&
                       !hasEverOwned &&
                       !ownsAtCompletion;
    
    if (ftbEligible) {
        domCache.ftbIndicator.className = 'ftb-indicator eligible';
        domCache.ftbIndicator.innerHTML = '<strong>You may qualify for First-Time Buyer relief!</strong>';
    } else {
        domCache.ftbIndicator.className = 'ftb-indicator not-eligible';
        const reasons = [];
        if (!willBeMainResidence) {
            reasons.push('Not your main residence');
        }
        if (price > SDLT_CONFIG.ftbPriceLimit) {
            reasons.push(`Price exceeds £${SDLT_CONFIG.ftbPriceLimit.toLocaleString()} limit`);
        }
        if (hasEverOwned) {
            reasons.push('Previously owned property');
        }
        if (ownsAtCompletion) {
            reasons.push('Will own another property at completion');
        }
        // Don't add "Married couples need to check spouse options" - married couples can qualify for FTB
        
        if (reasons.length > 0) {
            domCache.ftbIndicator.innerHTML = `<strong>First-Time Buyer relief not available:</strong> ${reasons.join(', ')}`;
        } else {
            domCache.ftbIndicator.innerHTML = '<strong>First-Time Buyer relief not available</strong>';
        }
    }
}

// Check and update FTB eligibility indicator based on calculation result
function updateFTBIndicator(result) {
    if (!domCache.ftbIndicator) return;
    
    const ctx = result.inputContext || {};
    const price = ctx.price || parseFloat(domCache.propertyPrice?.value) || 0;
    const isResidential = ctx.isResidential !== undefined ? ctx.isResidential : (domCache.propertyTypeResidential?.checked || false);
    
    if (price === 0 || !isResidential) {
        domCache.ftbIndicator.classList.add('hidden');
        return;
    }
    
    domCache.ftbIndicator.classList.remove('hidden');
    
    // Use the actual calculation result to determine status
    if (result.regime === 'FTB') {
        domCache.ftbIndicator.className = 'ftb-indicator eligible';
        domCache.ftbIndicator.innerHTML = '<strong>You qualify for First-Time Buyer relief!</strong>';
    } else {
        // Not eligible - show why based on actual inputs
        const willBeMainResidence = ctx.willBeMainResidence !== undefined ? ctx.willBeMainResidence : (domCache.willBeMainResidence?.checked || false);
        const isMarried = ctx.isMarried !== undefined ? ctx.isMarried : (domCache.buyerTypeMarried?.checked || false);
        
        const hasEverOwned = isMarried 
            ? (domCache.eitherHasEverOwnedProperty?.checked || false)
            : (domCache.hasEverOwnedProperty?.checked || false);
        
        const ownsAtCompletion = isMarried
            ? (domCache.eitherOwnsPropertyAtCompletion?.checked || false)
            : (domCache.ownsPropertyAtCompletion?.checked || false);
        
        domCache.ftbIndicator.className = 'ftb-indicator not-eligible';
        const reasons = [];
        if (!willBeMainResidence) {
            reasons.push('Not your main residence');
        }
        if (price > SDLT_CONFIG.ftbPriceLimit) {
            reasons.push(`Price exceeds £${SDLT_CONFIG.ftbPriceLimit.toLocaleString()} limit`);
        }
        if (hasEverOwned) {
            reasons.push('Previously owned property');
        }
        if (ownsAtCompletion) {
            reasons.push('Will own another property at completion');
        }
        
        if (reasons.length > 0) {
            domCache.ftbIndicator.innerHTML = `<strong>First-Time Buyer relief not available:</strong> ${reasons.join(', ')}`;
        } else {
            domCache.ftbIndicator.innerHTML = '<strong>First-Time Buyer relief not available</strong>';
        }
    }
}

// Generate dynamic explanation based on calculation result
function updateExplanation(result) {
    if (!domCache.explanationContent) return;
    
    const ctx = result.inputContext || {};
    const explanations = [];
    
    // Regime-specific explanations
    if (result.regime === 'FTB') {
        explanations.push('<strong>First-Time Buyer Relief Applied</strong>');
        explanations.push('You qualify for First-Time Buyer relief because:');
        const reasons = [];
        if (ctx.willBeMainResidence) reasons.push('• This will be your main residence');
        if (ctx.price <= SDLT_CONFIG.ftbPriceLimit) reasons.push(`• Property price (£${ctx.price.toLocaleString()}) is within the £${SDLT_CONFIG.ftbPriceLimit.toLocaleString()} limit`);
        // For married couples, we check the "either" value; for individuals, check individual value
        const neverOwned = ctx.isMarried 
            ? (!ctx.hasEverOwnedProperty && !ctx.spouseHasEverOwnedProperty)
            : !ctx.hasEverOwnedProperty;
        if (neverOwned) {
            reasons.push('• ' + (ctx.isMarried ? 'Neither you nor your spouse' : 'You') + ' have never owned a property before');
        }
        
        const noOtherProperty = ctx.isMarried
            ? (!ctx.ownsPropertyAtCompletion && !ctx.spouseOwnsPropertyAtCompletion)
            : !ctx.ownsPropertyAtCompletion;
        if (noOtherProperty) {
            reasons.push('• ' + (ctx.isMarried ? 'Neither you nor your spouse' : 'You') + ' will not own another property at completion');
        }
        explanations.push(...reasons);
        explanations.push(`<br>With First-Time Buyer relief, you pay 0% on the first £300,000 and 5% on the portion between £300,000 and £500,000.`);
    } else if (result.regime === 'HIGHER_RATES') {
        explanations.push('<strong>Additional Dwelling Surcharge Applied</strong>');
        explanations.push('Higher rates apply because:');
        const reasons = [];
        if (ctx.ownsPropertyAtCompletion || ctx.spouseOwnsPropertyAtCompletion) {
            reasons.push('• ' + (ctx.isMarried ? 'Either you or your spouse' : 'You') + ' will still own another property at completion');
        }
        if (!ctx.isReplacingMainResidence) {
            reasons.push('• You are not replacing your main residence');
        }
        explanations.push(...reasons);
        explanations.push(`<br>The additional dwelling surcharge adds 3% to each standard rate band.`);
    } else if (result.regime === 'STANDARD') {
        explanations.push('<strong>Standard Rates Applied</strong>');
        // Check if they might have qualified for FTB
        const neverOwned = ctx.isMarried 
            ? (!ctx.hasEverOwnedProperty && !ctx.spouseHasEverOwnedProperty)
            : !ctx.hasEverOwnedProperty;
        const noOtherProperty = ctx.isMarried
            ? (!ctx.ownsPropertyAtCompletion && !ctx.spouseOwnsPropertyAtCompletion)
            : !ctx.ownsPropertyAtCompletion;
            
        if (ctx.price <= SDLT_CONFIG.ftbPriceLimit && ctx.willBeMainResidence && neverOwned && noOtherProperty) {
            explanations.push('Note: You may have qualified for First-Time Buyer relief, but:');
            if (ctx.price > SDLT_CONFIG.ftbPriceLimit) {
                explanations.push(`• Property price (£${ctx.price.toLocaleString()}) exceeds the £${SDLT_CONFIG.ftbPriceLimit.toLocaleString()} limit for FTB relief`);
            }
            const hasOtherProperty = ctx.isMarried
                ? (ctx.ownsPropertyAtCompletion || ctx.spouseOwnsPropertyAtCompletion)
                : ctx.ownsPropertyAtCompletion;
            if (hasOtherProperty) {
                explanations.push('• ' + (ctx.isMarried ? 'Either you or your spouse' : 'You') + ' will own another property at completion');
            }
        } else {
            explanations.push('Standard SDLT rates apply to this purchase.');
        }
    } else if (result.regime === 'NON_RESIDENTIAL') {
        explanations.push('<strong>Non-Residential Property</strong>');
        explanations.push('Non-residential properties use standard SDLT rates. First-Time Buyer relief and additional dwelling surcharge do not apply.');
    }
    
    // Additional context
    if (ctx.isReplacingMainResidence && result.regime !== 'HIGHER_RATES') {
        explanations.push(`<br>You are replacing your main residence, which exempts you from the additional dwelling surcharge.`);
    }
    
    if (explanations.length > 0) {
        domCache.explanationContent.innerHTML = '<p>' + explanations.join('</p><p>') + '</p>';
        domCache.explanationContainer.classList.remove('hidden');
    } else {
        domCache.explanationContainer.classList.add('hidden');
    }
}

// ============================================================================
// Event Listeners Setup
// ============================================================================

function setupEventListeners() {
    // Price input with debouncing
    domCache.propertyPrice.addEventListener('input', debouncedCalculate);
    domCache.propertyPrice.addEventListener('blur', calculateStampDuty); // Calculate immediately on blur
    
    // Property type radio buttons
    domCache.propertyTypeResidential?.addEventListener('change', togglePropertyType);
    domCache.propertyTypeNonResidential?.addEventListener('change', togglePropertyType);
    
    // Residential options
    domCache.willBeMainResidence?.addEventListener('change', () => {
        validateResidenceOptions();
        debouncedCalculate();
        updateFTBIndicatorFromInputs();
    });
    domCache.isReplacingMainResidence?.addEventListener('change', debouncedCalculate);
    
    // Buyer type radio buttons
    domCache.buyerTypeIndividual?.addEventListener('change', toggleMarriedOptions);
    domCache.buyerTypeMarried?.addEventListener('change', toggleMarriedOptions);
    
    // Buyer options (individual)
    domCache.hasEverOwnedProperty?.addEventListener('change', () => {
        debouncedCalculate();
        updateFTBIndicatorFromInputs();
    });
    domCache.ownsPropertyAtCompletion?.addEventListener('change', toggleReplacingResidence);
    
    // Married couple options
    domCache.eitherHasEverOwnedProperty?.addEventListener('change', () => {
        debouncedCalculate();
        updateFTBIndicatorFromInputs();
    });
    domCache.eitherOwnsPropertyAtCompletion?.addEventListener('change', toggleReplacingResidence);
    
    // Price input - update FTB indicator
    domCache.propertyPrice?.addEventListener('input', () => {
        updateFTBIndicatorFromInputs();
    });
    
    // Property type - update FTB indicator
    domCache.propertyTypeResidential?.addEventListener('change', () => {
        updateFTBIndicatorFromInputs();
    });
    domCache.propertyTypeNonResidential?.addEventListener('change', () => {
        updateFTBIndicatorFromInputs();
    });
    
    // Buyer type - update FTB indicator
    domCache.buyerTypeIndividual?.addEventListener('change', () => {
        updateFTBIndicatorFromInputs();
    });
    domCache.buyerTypeMarried?.addEventListener('change', () => {
        updateFTBIndicatorFromInputs();
    });
    
    // Setup tooltips
    setupTooltips();
}

// Setup tooltips for form elements
function setupTooltips() {
    // Create single reusable tooltip element
    let tooltip = document.getElementById('global-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'global-tooltip';
        tooltip.className = 'tooltip';
        tooltip.setAttribute('role', 'tooltip');
        tooltip.style.display = 'none';
        document.body.appendChild(tooltip);
    }
    
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    let currentTooltipIcon = null;
    
    // Position tooltip with boundary detection
    function positionTooltip(iconRect, tooltipText) {
        tooltip.textContent = tooltipText;
        tooltip.style.display = 'block';
        
        // Get tooltip dimensions (need to measure after display)
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const spacing = 10;
        
        // Determine best position
        let left, top;
        let placement = 'right'; // default: right side
        
        // Check if there's space on the right
        const spaceRight = viewportWidth - iconRect.right - spacing;
        const spaceLeft = iconRect.left - spacing;
        const spaceBelow = viewportHeight - iconRect.bottom - spacing;
        const spaceAbove = iconRect.top - spacing;
        
        // Mobile: prefer below or above
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // On mobile, prefer below, then above
            if (spaceBelow >= tooltipRect.height) {
                placement = 'below';
                left = iconRect.left + (iconRect.width / 2) - (tooltipRect.width / 2);
                top = iconRect.bottom + spacing;
            } else if (spaceAbove >= tooltipRect.height) {
                placement = 'above';
                left = iconRect.left + (iconRect.width / 2) - (tooltipRect.width / 2);
                top = iconRect.top - tooltipRect.height - spacing;
            } else {
                // Fallback to right
                placement = 'right';
                left = iconRect.right + spacing;
                top = iconRect.top;
            }
        } else {
            // Desktop: prefer right, then left, then below, then above
            if (spaceRight >= tooltipRect.width) {
                placement = 'right';
                left = iconRect.right + spacing;
                top = iconRect.top + (iconRect.height / 2) - (tooltipRect.height / 2);
            } else if (spaceLeft >= tooltipRect.width) {
                placement = 'left';
                left = iconRect.left - tooltipRect.width - spacing;
                top = iconRect.top + (iconRect.height / 2) - (tooltipRect.height / 2);
            } else if (spaceBelow >= tooltipRect.height) {
                placement = 'below';
                left = iconRect.left + (iconRect.width / 2) - (tooltipRect.width / 2);
                top = iconRect.bottom + spacing;
            } else if (spaceAbove >= tooltipRect.height) {
                placement = 'above';
                left = iconRect.left + (iconRect.width / 2) - (tooltipRect.width / 2);
                top = iconRect.top - tooltipRect.height - spacing;
            } else {
                // Fallback: center on screen
                placement = 'center';
                left = (viewportWidth - tooltipRect.width) / 2;
                top = (viewportHeight - tooltipRect.height) / 2;
            }
        }
        
        // Ensure tooltip stays within viewport
        left = Math.max(spacing, Math.min(left, viewportWidth - tooltipRect.width - spacing));
        top = Math.max(spacing, Math.min(top, viewportHeight - tooltipRect.height - spacing));
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
        tooltip.setAttribute('data-placement', placement);
    }
    
    function showTooltip(e, tooltipText) {
        const tooltipIcon = e.currentTarget;
        currentTooltipIcon = tooltipIcon;
        const iconRect = tooltipIcon.getBoundingClientRect();
        
        // Use requestAnimationFrame to ensure tooltip is measured correctly
        requestAnimationFrame(() => {
            positionTooltip(iconRect, tooltipText);
        });
    }
    
    function hideTooltip() {
        tooltip.style.display = 'none';
        currentTooltipIcon = null;
    }
    
    // Handle window resize and scroll
    function handleResizeOrScroll() {
        if (currentTooltipIcon && tooltip.style.display !== 'none') {
            const tooltipText = tooltip.textContent;
            const iconRect = currentTooltipIcon.getBoundingClientRect();
            positionTooltip(iconRect, tooltipText);
        }
    }
    
    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll, true);
    
    // Setup tooltips for each element
    tooltipElements.forEach(element => {
        const tooltipText = element.getAttribute('data-tooltip');
        const tooltipIcon = element.parentElement?.querySelector('.tooltip-icon');
        
        if (tooltipIcon && tooltipText) {
            tooltipIcon.addEventListener('mouseenter', (e) => showTooltip(e, tooltipText));
            tooltipIcon.addEventListener('mouseleave', hideTooltip);
            tooltipIcon.addEventListener('focus', (e) => showTooltip(e, tooltipText));
            tooltipIcon.addEventListener('blur', hideTooltip);
            
            // Also show on click for mobile
            tooltipIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (tooltip.style.display === 'none' || currentTooltipIcon !== tooltipIcon) {
                    showTooltip(e, tooltipText);
                } else {
                    hideTooltip();
                }
            });
        }
    });
    
    // Hide tooltip when clicking outside
    document.addEventListener('click', (e) => {
        if (currentTooltipIcon && !currentTooltipIcon.contains(e.target) && !tooltip.contains(e.target)) {
            hideTooltip();
        }
    });
}

// Initialize UI state on page load
document.addEventListener('DOMContentLoaded', () => {
    cacheDOMElements();
    loadBuyingHouseInputs();
    setupEventListeners();
    togglePropertyType();
    toggleMarriedOptions();
    validateResidenceOptions();
    updateFTBIndicatorFromInputs();
    calculateStampDuty();
});
