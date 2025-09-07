**Overview**
- **Goal:** Make exploration efficient and engaging by guiding players toward non‑empty tiles without removing uncertainty.
- **Scope:** Scanner mechanics (tiers, signals, hints), reveal rules, UI cues, and Light Drive AP scaling for 1–5 hex moves.

**Player States**
- **Unknown:** Never scanned/visited.
- **Scanned:** Shows noisy probability P̂ and optional direction hint. No content reveal.
- **Visited:** Ground truth revealed (resource/system/empty).
- **Claimed:** Same as visited + ownership visuals.

**Signal Model**
- **Hidden Field F:** Continuous “signal” over the grid reflecting proximity to real sites/systems.
  - **Definition:** `F(h) = Σ_j w(type_j) · exp(-d(h,j)^2 / (2·σ_site^2))`, clamped to [0,1].
  - **Weights:** Systems > resource sites; adjust via `w(type)`.
  - **Falloff:** `σ_site ≈ 2–3` hexes (tunable per content density).
  - **Computation:** Lazy, cached in a Map keyed by `hexId` within a radius (~10 hex) around player.

**Readout & Uncertainty**
- **Noisy Reading:** `P̂(h) = clamp(F(h) + ε)`, with ε ~ Normal(0, σ_noise).
- **Bounds:** Never show certainty (bound to [5%, 95%]).
- **Direction Hint:** Pick neighbor n maximizing `F(n) + δ` (small directional noise), show strength by gradient magnitude.
- **Mislead Chance:** Small chance to suggest a suboptimal neighbor; reduced at higher tiers.

**Scanner Tiers (by Ship Class)**
- **scout1 (Basic):**
  - **Quick Scan:** 1 AP; current hex only. P̂ + basic hint (weak/medium).
  - **Noise:** σ_high; **Mislead:** ~15%.
- **scout2 (Improved):**
  - **Quick Scan** (σ_medium, ~10% mislead).
  - **Sweep Scan:** 2 AP; radius 2; P̂ for current + ring‑1 neighbors; primary direction hint (medium/strong).
- **scout3 (Advanced):**
  - **Quick + Sweep** (σ_low, ~7% mislead).
  - **Focused Scan:** 2 AP; choose hex; halves σ for that hex (tighter P̂; may upgrade hint strength).
  - **Optional:** Weak type category hint when P̂ > 75% (e.g., metallic/organic).
- **scout4 (Elite):**
  - All above (σ_very_low, ~5% mislead).
  - **Optional:** Cone Scan (3 AP) forward 3–5 hexes, low‑res P̂ grid.

**Dev Tools**
- **Unlock All Scans:** Dev toggle grants access to all scans regardless of ship class.
- **Debug Overlay:** Optional “Show Signal Field” to visualize F as a heatmap for testing.

**Reveal Rules**
- **Popup:** Resource/system details only when hex is visited or claimed (no spoilers on scanned).
- **Map Art:** Resource/system visuals gated to visited/claimed. Scanned may show generic overlays (arrows), not content art.

**UI Cues**
- **Quick Scan:**
  - **Popup:** “Scan: 62% chance of something here.” “Hint: NE (medium).”
  - **Overlay:** Small arrow on suggested edge (fades after ~5s).
- **Sweep Scan:**
  - **Neighbors:** Tiny per‑neighbor indicators (pips/arrows), highlighted suggested direction.
- **Focused Scan:**
  - **Popup:** Refined P̂ (e.g., 62% → 74%), updated hint strength.

**Light Drive AP Scaling**
- **Range:** Up to 5 hexes (cube distance).
- **Cost:** Linear scaling from 2 AP at 1 hex to 6 AP at 5 hexes.
  - **Formula:** `AP = 1 + distance` for `1 ≤ distance ≤ 5`.
  - **Validation:** Disallow `distance > 5` (disable button / show tooltip).
- **UI:** Button text shows dynamic AP cost; disabled if insufficient AP.

**Data Model**
- **Scan Capabilities:** `SCAN_UNLOCKS = { scout1:['quick'], scout2:['quick','sweep'], scout3:['quick','sweep','focus'], scout4:['quick','sweep','focus','cone'] }`
- **Scan Config (per class):** `{ sigmaNoise, misleadChance, sweepRadius }`.
- **Per‑Hex Scan Cache:** `hexData.get(hexId).scan = { p, conf: 'weak|med|strong', dir: 'N|NE|E|SE|S|SW|W|NW', ts, refined: bool }`.
- **Dev Flag:** `ui.devScanUnlocked: boolean`.
- **Signal Cache:** `signalField: Map<hexId, number>` with locality window.

**Core APIs (Planned)**
- **`cubeDistance(a,b)`**: existing; returns integer hex distance.
- **`buildSignalField(centerHexId, radius)`**: populates/updates F around player.
- **`getSignal(hexId)`**: returns F(hexId) from cache (builds if missing).
- **`getScanReading(hexId, mode, shipClass)`**: returns `{ p, conf, dir }` using F, noise per class, direction logic.
- **`hasScanCapability(shipClass, action)`**: gates Quick/Sweep/Focused.
- **`renderScanOverlay(reading)`**: ephemeral arrows/pips; auto-clear.

**Behavior & Balance**
- **Noise/Tiers:**
  - **σ_noise:** High→Very Low from scout1→scout4.
  - **Mislead:** 15%→5% from scout1→scout4.
  - **Sweep Radius:** 2→3 (or configurable).
- **P̂ Bounds:** Keep 5–95% regardless of tier; certainty only via visiting.
- **Cooldown (optional):** Per‑hex scan cooldown to avoid spam.

**Implementation Plan**
1. **Light Drive Scaling:**
   - Update cost calculation: `cost = 1 + cubeDistance(player, selected)`; cap at 5; update button label and handler.
2. **Scan Gating:**
   - Add capability map; gate scan UI by ship class or dev unlock.
   - Add placeholder `getScanReading()` using a temporary heuristic (until F is implemented).
3. **Signal Field F:**
   - Implement `buildSignalField` and caching; hook `getScanReading` to F.
4. **UI Overlays:**
   - Add arrow/pip overlay rendering and timed removal.
5. **Refinements:**
   - Tier tuning (noise, mislead, radius); optional type hint at high P̂.

**Edge Cases**
- **Visited/Claimed Priority:** Scanned overlays suppressed if visited/claimed.
- **Out‑of‑Range Scans:** Disable higher‑tier scans when ship class lacks capability (unless dev unlocked).
- **Persistence:** Save cached scan readings and decay them over time if desired (optional).

**Copy Examples**
- **Quick:** “Scan complete — 58% chance of activity here. Hint: NE (medium).”
- **Sweep:** “Local sweep: strongest signal NE. Nearby: E (weak), SE (weak).”
- **Focused:** “Refined reading — 74% (strong).”

