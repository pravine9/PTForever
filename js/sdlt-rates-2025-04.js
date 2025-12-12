// UK Stamp Duty Land Tax (SDLT) Rates - Effective from April 2025
// This file contains SDLT rate configurations and calculation logic for rates effective from April 2025.
// For future rate changes, create new files like sdlt-rates-YYYY-MM.js

// ============================================================================
// Configuration (current rates from April 2025)
// ============================================================================

const SDLT_RATES_2025_04 = {
    // Rate configuration
    config: {
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
    },

    // Regime name constants
    REGIME_NAMES: {
        'STANDARD': 'Standard',
        'FTB': 'First-Time Buyer',
        'HIGHER_RATES': 'Higher Rates',
        'NON_RESIDENTIAL': 'Non-Residential'
    },

    REGIME_NAMES_DETAILED: {
        'STANDARD': 'Standard Rates',
        'FTB': 'First-Time Buyer',
        'HIGHER_RATES': 'Higher Rates (Additional Dwelling)',
        'NON_RESIDENTIAL': 'Non-Residential'
    },

    // ============================================================================
    // Core Calculation Functions
    // ============================================================================

    /**
     * Calculate SDLT from rate bands
     * @param {number} price - Property price
     * @param {Array} bands - Array of rate bands with {lower, upper, rate}
     * @returns {Object} {tax, breakdown}
     */
    calculateSDLTFromBands(price, bands) {
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
    },

    /**
     * Calculate SDLT based on input parameters
     * @param {Object} input - Calculation input parameters
     * @param {number} input.price - Property price
     * @param {boolean} input.isResidential - Whether property is residential
     * @param {boolean} input.willBeMainResidence - Whether property will be main residence
     * @param {boolean} input.allBuyersAreIndividuals - Whether all buyers are individuals
     * @param {boolean} input.allPurchasersAreFirstTimeBuyers - Whether all purchasers are first-time buyers
     * @param {boolean} input.anyBuyerOrTheirSpouseHasOwnedPropertyBefore - Whether any buyer/spouse has owned property
     * @param {boolean} input.anyBuyerOrTheirSpouseOwnsAnotherDwellingAtCompletion - Whether any buyer/spouse owns another dwelling
     * @param {boolean} input.isReplacingMainResidence - Whether replacing main residence
     * @returns {Object} {tax, regime, effectiveRate, breakdown}
     */
    calculateSDLT(input) {
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

        const { ftbPriceLimit, standardRates, ftbRates, higherRates } = this.config;

        // Validation
        if (price <= 0) {
            throw new Error("Price must be positive");
        }

        // Safety check for division by zero
        const safeEffectiveRate = (tax, price) => price > 0 ? tax / price : 0;

        // Non-residential (simplified - extend as needed)
        if (!isResidential) {
            const { tax, breakdown } = this.calculateSDLTFromBands(price, standardRates);
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
            const { tax, breakdown } = this.calculateSDLTFromBands(price, higherRates);
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
            const { tax, breakdown } = this.calculateSDLTFromBands(price, ftbRates);
            return {
                tax,
                regime: "FTB",
                effectiveRate: safeEffectiveRate(tax, price),
                breakdown,
            };
        }

        // Standard rates
        const { tax, breakdown } = this.calculateSDLTFromBands(price, standardRates);
        return {
            tax,
            regime: "STANDARD",
            effectiveRate: safeEffectiveRate(tax, price),
            breakdown,
        };
    },

    // ============================================================================
    // Helper: Derive Economic Unit Flags
    // ============================================================================

    /**
     * Derive economic unit flags from person array
     * @param {Array} persons - Array of person objects
     * @returns {Object} Flags for calculation
     */
    deriveEconomicUnitFlags(persons) {
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
    },

    /**
     * Convenience wrapper to calculate SDLT for persons array
     * @param {Array} persons - Array of person objects
     * @param {number} price - Property price
     * @param {boolean} isResidential - Whether property is residential
     * @param {boolean} willBeMainResidence - Whether property will be main residence
     * @param {boolean} isReplacingMainResidence - Whether replacing main residence
     * @returns {Object} Calculation result
     */
    calculateSDLTForPersons(
        persons,
        price,
        isResidential,
        willBeMainResidence,
        isReplacingMainResidence
    ) {
        const flags = this.deriveEconomicUnitFlags(persons);
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

        return this.calculateSDLT(input);
    },
};

