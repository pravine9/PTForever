// UK Stamp Duty Land Tax (SDLT) Calculator - Main Orchestrator
// This file coordinates the SDLT rates module and page-specific UI logic

// ============================================================================
// Initialization
// ============================================================================

// Initialize UI state on page load
document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements (from buyingahouse-page.js)
    cacheDOMElements();
    
    // Load saved form inputs
    loadBuyingHouseInputs();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize UI state
    togglePropertyType();
    toggleMarriedOptions();
    toggleOwnsPropertyAtCompletionVisibility();
    validateResidenceOptions();
    updateFTBIndicatorFromInputs();
    
    // Perform initial calculation
    calculateStampDuty();
    
    // Render saved calculations
    renderSavedCalculations();
    
    // Initialize counter on page load
    const savedCalculations = loadSavedCalculations();
    updateSavedCalculationsCounter(savedCalculations.length);
});
