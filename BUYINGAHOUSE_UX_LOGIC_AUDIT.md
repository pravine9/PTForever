# Buyingahouse Calculator - Option Logic & UX Interaction Audit

**Focus:** How form options interact with each other and the user experience implications

---

## 📊 Option Dependency Map

### Current Dependencies (Implemented)
```
Property Type (Residential)
  └─> Shows/Hides: "Residential Options" section
      ├─> "Will be main residence" (always visible if residential)
      └─> "Replacing main residence" (conditional - see below)

"Owns property at completion" (checked)
  └─> Shows: "Replacing main residence" option

Buyer Type (Married/Civil Partnership)
  └─> Shows/Hides: "Spouse Information" section
      ├─> "Spouse has ever owned property"
      └─> "Spouse owns property at completion"
```

### Missing Dependencies (Should Exist)
```
"Will be main residence" (unchecked)
  └─> Should hide or disable: "Replacing main residence" (logically can't replace if not main residence)

"Has ever owned property" (checked)
  └─> Should provide visual feedback: "You won't qualify for First-Time Buyer relief"

"Owns property at completion" (unchecked)
  └─> Should hide: "Replacing main residence" (already implemented ✅)
```

---

## 🔴 Critical UX Logic Issues

### 1. **"Replacing main residence" Logic Gap**
- **Issue**: "Replacing main residence" can be checked even if "Will be main residence" is unchecked
- **Current Behavior**: 
  - "Replacing main residence" only appears when "Owns property at completion" is checked
  - But "Will be main residence" can be unchecked independently
- **Problem**: If property won't be main residence, you can't be "replacing" your main residence
- **Impact**: User can create logically invalid state
- **Fix**: 
  ```javascript
  // In toggleReplacingResidence or add new function
  if (!domCache.willBeMainResidence?.checked && domCache.isReplacingMainResidence?.checked) {
      domCache.isReplacingMainResidence.checked = false;
  }
  // Also hide "Replacing main residence" if "Will be main residence" is unchecked
  ```

### 2. **"Will be main residence" Default State**
- **Issue**: Checked by default, but users buying second homes might not realize they need to uncheck it
- **Current**: `checked` attribute in HTML (line 81)
- **Impact**: Users might get incorrect calculations if they forget to uncheck
- **Recommendation**: 
  - Consider unchecked by default, OR
  - Add prominent tooltip/help text explaining what this means
  - Add visual indicator when unchecked (e.g., "This will be a second home - higher rates may apply")

### 3. **No Visual Feedback for FTB Eligibility**
- **Issue**: Users don't know why they're not getting FTB relief
- **Current**: Calculation happens silently, no explanation
- **Impact**: Confusing UX - user checks all FTB boxes but gets standard rates, no explanation
- **Fix**: Add real-time eligibility indicator
  ```javascript
  function checkFTBEligibility() {
      const isEligible = /* check all FTB conditions */;
      const reason = /* why not eligible if false */;
      // Show/hide indicator in UI
  }
  ```

### 4. **Missing Logical Validation**
- **Issue**: No validation for contradictory states
- **Examples**:
  - "Has ever owned property" = false, but "Owns property at completion" = true (possible but unusual)
  - "Will be main residence" = false, but "Replacing main residence" = true (impossible)
- **Impact**: Users can create invalid states without knowing
- **Fix**: Add validation with helpful messages

---

## 🟡 Medium Priority UX Issues

### 5. **Option Grouping & Visual Hierarchy**
- **Issue**: Related options aren't visually grouped
- **Current**: 
  - "Has ever owned property" and "Owns property at completion" are together (good)
  - But "Will be main residence" and "Replacing main residence" are in same section (could be clearer)
- **Recommendation**: 
  - Add visual separators or grouping
  - Use indentation or nested styling for conditional options

### 6. **Missing Contextual Help**
- **Issue**: No tooltips or explanations for complex options
- **Examples**:
  - "Replacing main residence" - what does this mean?
  - "Owns property at completion" - why does this matter?
  - "Spouse has ever owned property" - why is this relevant?
- **Impact**: Users might not understand what to select
- **Fix**: Add tooltips or expandable help text

### 7. **State Persistence Issues**
- **Issue**: When switching between "Individual" and "Married", spouse checkboxes are reset (good), but:
  - What if user switches back? Previous values are lost
  - No warning about data loss
- **Current**: Lines 320-321 reset spouse checkboxes
- **Impact**: Minor - users can re-enter, but could be annoying
- **Recommendation**: Consider storing in sessionStorage or showing a warning

### 8. **Non-Residential Property Options**
- **Issue**: When "Non-residential" is selected, residential options are hidden (good), but:
  - "Will be main residence" is unchecked (line 306) - makes sense
  - But user might wonder: "Can a non-residential property be a main residence?"
- **Impact**: Minor confusion
- **Recommendation**: Add help text explaining non-residential properties use standard rates only

### 9. **Price-Based Option Visibility**
- **Issue**: No indication that FTB relief is price-limited
- **Current**: FTB only applies up to £500k, but no UI indication
- **Impact**: User might think they're FTB eligible but price is too high
- **Fix**: Show message when FTB conditions met but price > £500k

---

## 🟢 Low Priority / Enhancement Opportunities

### 10. **Progressive Disclosure**
- **Current**: All options shown at once (except conditional ones)
- **Enhancement**: Could use progressive disclosure:
  - Step 1: Property details (type, price)
  - Step 2: Buyer details (type, ownership history)
  - Step 3: Results
- **Impact**: Could reduce cognitive load, but might also add friction

### 11. **Smart Defaults Based on Selections**
- **Enhancement**: Auto-set related options based on user input
  - If "Has ever owned property" = true, could pre-check "Owns property at completion" (with option to change)
  - If "Has ever owned property" = false, could suggest FTB might apply
- **Risk**: Could be too presumptuous, might need user confirmation

### 12. **Visual State Indicators**
- **Enhancement**: Color-code or icon indicators for:
  - ✅ FTB eligible
  - ⚠️ Higher rates will apply
  - ℹ️ Standard rates
- **Impact**: Immediate visual feedback

### 13. **Option Dependency Visualization**
- **Enhancement**: Show why certain options appear/disappear
  - "This option appears because you selected 'Owns property at completion'"
  - Fade out/in animations for appearing/disappearing options

### 14. **Validation Messages**
- **Enhancement**: Real-time validation with helpful messages
  - "If this won't be your main residence, you can't be replacing it"
  - "First-time buyer relief requires this to be your main residence"

---

## 📋 Specific Code Improvements

### Priority 1: Fix "Replacing main residence" Logic
```javascript
// Add to setupEventListeners or create new function
function validateResidenceOptions() {
    // If "Will be main residence" is unchecked, uncheck and hide "Replacing main residence"
    if (!domCache.willBeMainResidence?.checked) {
        if (domCache.isReplacingMainResidence?.checked) {
            domCache.isReplacingMainResidence.checked = false;
        }
        domCache.replacingResidenceRow?.classList.add('hidden');
    } else if (domCache.ownsPropertyAtCompletion?.checked) {
        // Show "Replacing main residence" only if both conditions met
        domCache.replacingResidenceRow?.classList.remove('hidden');
    }
}

// Add event listener
domCache.willBeMainResidence?.addEventListener('change', () => {
    validateResidenceOptions();
    debouncedCalculate();
});
```

### Priority 2: Add FTB Eligibility Indicator
```javascript
function updateFTBIndicator() {
    const price = parseFloat(domCache.propertyPrice.value) || 0;
    const isResidential = domCache.propertyTypeResidential?.checked;
    const willBeMainResidence = domCache.willBeMainResidence?.checked;
    const hasEverOwned = domCache.hasEverOwnedProperty?.checked;
    const ownsAtCompletion = domCache.ownsPropertyAtCompletion?.checked;
    const isMarried = domCache.buyerTypeMarried?.checked;
    const spouseHasEverOwned = domCache.spouseHasEverOwnedProperty?.checked || false;
    
    const ftbEligible = isResidential && 
                       willBeMainResidence && 
                       price <= SDLT_CONFIG.ftbPriceLimit &&
                       !hasEverOwned &&
                       !ownsAtCompletion &&
                       (!isMarried || (!spouseHasEverOwned && !domCache.spouseOwnsPropertyAtCompletion?.checked));
    
    // Show/hide indicator in UI
    const indicator = document.getElementById('ftbIndicator');
    if (indicator) {
        if (ftbEligible) {
            indicator.textContent = '✅ You may qualify for First-Time Buyer relief';
            indicator.className = 'ftb-indicator eligible';
        } else {
            indicator.textContent = 'ℹ️ First-Time Buyer relief not available';
            indicator.className = 'ftb-indicator not-eligible';
        }
    }
}
```

### Priority 3: Add Tooltips/Help Text
```html
<!-- In buyingahouse.html -->
<label class="checkbox-option">
    <input type="checkbox" id="willBeMainResidence" checked>
    <span>Will be main residence</span>
    <span class="help-icon" title="This property will be your primary residence. Required for First-Time Buyer relief.">ℹ️</span>
</label>

<label class="checkbox-option">
    <input type="checkbox" id="isReplacingMainResidence">
    <span>Replacing main residence</span>
    <span class="help-icon" title="You're selling your current main residence and buying this as your new main residence. This exempts you from the additional dwelling surcharge.">ℹ️</span>
</label>
```

### Priority 4: Add Validation Messages
```javascript
function validateOptions() {
    const errors = [];
    
    // Can't replace main residence if it won't be main residence
    if (!domCache.willBeMainResidence?.checked && domCache.isReplacingMainResidence?.checked) {
        errors.push('You cannot replace your main residence if this property will not be your main residence.');
    }
    
    // Show errors if any
    if (errors.length > 0) {
        showError(errors.join(' '));
        return false;
    }
    return true;
}

// Call before calculation
function calculateStampDuty() {
    if (!validateOptions()) {
        return;
    }
    // ... rest of calculation
}
```

### Priority 5: Improve Option Grouping (CSS)
```css
/* In style.css */
.input-section {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.input-section:last-child {
    border-bottom: none;
}

.checkbox-group.nested {
    margin-left: 1.5rem;
    padding-left: 1rem;
    border-left: 2px solid var(--primary);
}

.help-icon {
    margin-left: 0.5rem;
    cursor: help;
    opacity: 0.6;
    font-size: 0.9em;
}

.ftb-indicator {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    margin-top: 0.5rem;
    font-size: 0.9rem;
}

.ftb-indicator.eligible {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.ftb-indicator.not-eligible {
    background: #f8f9fa;
    color: #6c757d;
    border: 1px solid #dee2e6;
}
```

---

## 🎯 Recommended Implementation Order

1. **Critical Fixes** (1-4): Fix replacing residence logic, add FTB indicator, add validation
2. **UX Improvements** (5-9): Tooltips, better grouping, contextual help
3. **Enhancements** (10-14): Progressive disclosure, smart defaults, visual indicators

---

## 📊 Option Logic Flow Diagram

```
START: User enters price
  │
  ├─> Property Type?
  │   ├─> Residential
  │   │   ├─> Will be main residence?
  │   │   │   ├─> Yes
  │   │   │   │   ├─> Owns property at completion?
  │   │   │   │   │   ├─> Yes → Show "Replacing main residence"
  │   │   │   │   │   └─> No → Hide "Replacing main residence"
  │   │   │   │   └─> Check FTB eligibility
  │   │   │   └─> No → Cannot replace main residence
  │   │   └─> Calculate: Standard or Higher rates
  │   └─> Non-Residential
  │       └─> Hide all residential options
  │       └─> Calculate: Standard rates only
  │
  ├─> Buyer Type?
  │   ├─> Individual
  │   │   └─> Hide spouse options
  │   └─> Married
  │       └─> Show spouse options
  │
  └─> Calculate SDLT
      ├─> Check: Additional dwelling? (Higher rates)
      ├─> Check: FTB eligible? (FTB rates)
      └─> Default: Standard rates
```

---

## 🔍 Edge Cases to Test

1. **Uncheck "Will be main residence" while "Replacing main residence" is checked**
   - Expected: "Replacing main residence" should be unchecked automatically

2. **Check "Owns property at completion" then uncheck "Will be main residence"**
   - Expected: "Replacing main residence" should be hidden and unchecked

3. **Switch from "Married" to "Individual" and back**
   - Expected: Spouse options should reset (currently works ✅)

4. **FTB conditions met but price > £500k**
   - Expected: Should show message explaining why FTB doesn't apply

5. **All FTB conditions met except "Will be main residence" unchecked**
   - Expected: Should show why FTB doesn't apply

6. **"Has ever owned property" = false, "Owns property at completion" = true**
   - Expected: Should work (sold previous property, buying new one)

---

## 💡 UX Best Practices Applied

✅ **Conditional Display**: Options appear/disappear based on selections  
✅ **State Reset**: Spouse options reset when switching buyer type  
✅ **Immediate Feedback**: Calculations update in real-time  
⚠️ **Missing**: Visual feedback for eligibility  
⚠️ **Missing**: Explanations for why options appear/disappear  
⚠️ **Missing**: Validation for contradictory states  

---

## 📝 Summary

The option logic is **mostly sound** but has some **UX gaps**:

1. **Logic Issues**: "Replacing main residence" can be checked when it shouldn't be
2. **Feedback Issues**: No indication of FTB eligibility or why certain rates apply
3. **Guidance Issues**: Missing tooltips and explanations
4. **Validation Issues**: No prevention of contradictory states

**Priority fixes**: Add validation for "replacing main residence", add FTB eligibility indicator, add tooltips for complex options.


