# Space Guild Resource System Design Document

## Overview

The resource system is designed around exploration, discovery, and strategic trading in a vast galaxy where most cells are empty space. Players must find rare resources scattered across 3600 cells and transport them to distant markets for profit.

## Core Philosophy

- **Exploration-Driven**: Most cells are empty, making discoveries valuable
- **Strategic Trading**: Limited cargo space forces difficult decisions
- **Risk vs Reward**: Illegal goods offer higher profits but greater consequences
- **Equipment Progression**: Better gear unlocks access to rarer resources

---

## Resource Types

### Legal Resources (6 types)
Resources that can be traded openly without legal consequences.

| Type | Rarity | Base Price Range | Margin | Equipment Required |
|------|--------|------------------|--------|--------------------|
| Legal_1 | Common | 50-80 credits | 10-20% | None |
| Legal_2 | Uncommon | 80-120 credits | 20-30% | Basic Mining Drill |
| Legal_3 | Rare | 120-180 credits | 30-40% | Advanced Mining Drill |
| Legal_4 | Very Rare | 180-280 credits | 40-60% | Quantum Extractor |
| Legal_5 | Ultra Rare | 280-450 credits | 60-80% | Molecular Harvester |
| Legal_6 | Legendary | 450-800 credits | 80-100%+ | Exotic Matter Processor |

### Illegal Resources (6 types)
High-profit resources with catch rates and legal consequences.

| Type | Risk Level | Base Price Range | Margin | Catch Rate | Equipment Required |
|------|------------|------------------|--------|------------|-------------------|
| Illegal_1 | Low Risk | 100-160 credits | 40-60% | 5% | None |
| Illegal_2 | Medium-Low | 160-250 credits | 60-80% | 10% | Basic Mining Drill |
| Illegal_3 | Medium | 250-400 credits | 80-100% | 20% | Advanced Mining Drill |
| Illegal_4 | High Risk | 400-650 credits | 100-150% | 35% | Quantum Extractor |
| Illegal_5 | Very High | 650-1000 credits | 150-200% | 50% | Molecular Harvester |
| Illegal_6 | Extremely Dangerous | 1000-2000 credits | 200-300% | 70% | Exotic Matter Processor |

---

## Cell Distribution (3600 total cells)

### Systems (~72 cells, 1 in 50)
Full star systems with markets, services, and potential resources.
- **Markets**: All systems have buy/sell markets
- **Security Levels**: Affects illegal trade acceptance
- **Specializations**: Different systems prefer different resource types

### Special Resource Sites (~120 cells, 1 in 30)
Unique locations with specific resource types and mechanics.

| Site Type | Resources | Extract/Trade | Equipment | Special Rules |
|-----------|-----------|---------------|-----------|---------------|
| **Asteroid Fields** | Legal_1, Legal_2 | High Extract, Low Trade | Basic/Adv Mining | Dense ore deposits |
| **Comet Trails** | Legal_3, Legal_4 | Med Extract, Very Low Trade | Quantum Extractor | Exotic ice compounds |
| **Derelict Ships** | Mixed Legal/Illegal | Low Extract, High Trade | None | One-time salvage |
| **Rogue Traders** | Any type | None Extract, Med Trade | None | Variable inventory |
| **Gas Harvesting Stations** | Legal_5, Legal_6 | Low Extract, None Trade | Molecular Harvester | Exotic gases |
| **Ancient Ruins** | Illegal_4-6 | Very Low Extract, None Trade | Exotic Matter Processor | Risk of ship damage |
| **Nebula Pockets** | Legal_4, Illegal_2 | Med Extract, None Trade | Quantum Extractor | Rare particles |
| **Pirate Caches** | Illegal_1-3 | None Extract, High Trade | None | Hidden contraband |
| **Research Probes** | Legal_6, Illegal_4 | Very Low Extract, Low Trade | Adv Mining Drill | Experimental tech |
| **Stellar Phenomena** | Legal_5, Illegal_6 | Low Extract, None Trade | Exotic Matter Processor | Quantum anomalies |

### Empty Space (~3408 cells)
The vast majority of cells contain nothing, creating the exploration challenge.

---

## Resource Mechanics

### Resource Availability per Hex

**Tradable Resources:**
- Ready for immediate pickup (0-1 AP cost)
- Limited quantities that deplete when collected
- Regenerate at midnight EST daily

**Extractable Resources:**
- Require extraction equipment and 1 AP
- Generally 20-30% of tradable quantities
- Regenerate slower than tradable resources

### Regeneration System
- **Daily Reset**: All resources regenerate at midnight EST
- **Regeneration Rates**:
  - Tradable: 1-3 units per day (varies by rarity)
  - Extractable: 0.5-1 units per day (varies by rarity)
- **Maximum Capacity**: Each site has max capacity limits

### Equipment Requirements

| Equipment Type | Unlocks | Cost | Description |
|----------------|---------|------|-------------|
| **None** | Legal_1, Illegal_1 | 0 | Hand collection/salvage |
| **Basic Mining Drill** | Legal_2, Illegal_2 | 500 credits | Basic extraction tool |
| **Advanced Mining Drill** | Legal_3, Illegal_3 | 1,500 credits | Heavy-duty extraction |
| **Quantum Extractor** | Legal_4, Illegal_4 | 5,000 credits | Exotic matter collection |
| **Molecular Harvester** | Legal_5, Illegal_5 | 15,000 credits | Gas and particle harvesting |
| **Exotic Matter Processor** | Legal_6, Illegal_6 | 50,000 credits | Dangerous artifact handling |

---

## Trading System

### Market Types

**System Market Specializations:**
- **Industrial Systems**: Premium for raw materials (Legal_1-3)
- **Research Stations**: High prices for rare materials (Legal_4-6)  
- **Frontier Outposts**: Accept illegal goods, lower security
- **Core Worlds**: High security, legal goods only, good prices
- **Pirate Bases**: Illegal goods specialist, highest illegal prices

### Price Dynamics
- **Base Prices**: Fixed ranges per resource type
- **Market Variation**: Each system/station has prices within ranges
- **Supply/Demand**: Distance from resource sources affects prices
- **Specialization Bonus**: Systems pay extra for preferred resource types

### Illegal Trade Consequences

**When Caught Trading Illegal Goods:**
- **Credit Fine**: 2-5x the resource value
- **Reputation Loss**: Reduces law enforcement standing  
- **Contraband Confiscation**: Lose all illegal goods in cargo

**Risk Reduction Upgrades:**
- **Shielded Cargo Hold**: -10% catch rate (2,000 credits)
- **Fake Documentation**: -15% catch rate (5,000 credits)
- **Bribery Contacts**: -20% catch rate (10,000 credits)
- **Advanced Smuggling Tech**: -25% catch rate (25,000 credits)

---

## Player Systems

### Cargo Management
- **Starting Capacity**: 20 units
- **Cargo Upgrades**: Purchasable with credits
- **Ship Type Bonuses**: Trade-class ships have largest cargo holds
- **Strategic Decisions**: Limited space forces choice prioritization

### Resource Discovery Flow
1. **Visit Hex**: Auto-reveals any resources or special sites
2. **Assess Options**: View tradable vs extractable resources
3. **Check Equipment**: Determine what can be extracted
4. **Make Decisions**: Extract (1 AP) or trade (0 AP) resources
5. **Manage Cargo**: Balance space vs opportunity

### Progression Path
1. **Start**: Hand-collection of common resources
2. **Early Game**: Buy basic equipment, trade common goods
3. **Mid Game**: Upgrade to better equipment, access rare resources
4. **Late Game**: Exotic matter processing, high-risk illegal trading
5. **End Game**: Establish trade routes, maximize profit margins

---

## Implementation Notes

### Data Structures

**Resource Types Definition:**
```javascript
const RESOURCE_TYPES = {
  Legal_1: {
    category: 'Legal',
    rarity: 1,
    basePrice: [50, 80],
    catchRate: 0,
    extractionEquipment: null
  },
  // ... etc for all 12 types
}
```

**Hex Resource Storage:**
```javascript
gameState.galaxy.hexResources = new Map(); // hexId -> resource data
```

**Player Systems:**
```javascript
gameState.player = {
  cargo: {
    capacity: 20,
    contents: new Map(), // resourceType -> quantity
    usedSpace: 0
  },
  ship: {
    extractionEquipment: new Set(),
    smugglingUpgrades: new Set()
  }
}
```

**Market Data:**
```javascript
gameState.galaxy.systemMarkets = new Map(); // systemId -> market data
```

### Key Features to Implement

1. **Resource Discovery**: Auto-reveal resources when visiting hexes
2. **Equipment System**: Check requirements before extraction
3. **Cargo Management**: Track capacity and contents
4. **Market Interface**: Buy/sell with price calculations
5. **Daily Regeneration**: Midnight EST resource refresh
6. **Illegal Trade Risk**: Catch probability and consequences
7. **Special Site Mechanics**: Unique behaviors per site type

---

## Future Expansions

### Potential Additions
- **Dynamic Pricing**: Supply/demand based on player actions
- **Resource Processing**: Convert raw materials to finished goods
- **Trade Routes**: Establish automated trading runs
- **Faction Relations**: Different groups prefer different resources
- **Random Events**: Market crashes, resource discoveries, pirate raids
- **Cooperative Trading**: Multi-player resource exchanges

### Balancing Considerations
- **Resource Scarcity**: Ensure rarity maintains value
- **Travel Costs**: Balance AP/fuel costs vs profit margins  
- **Equipment Progression**: Smooth upgrade path to better gear
- **Risk vs Reward**: Illegal trade profitability vs consequences
- **Exploration Incentive**: Keep discovery rewarding throughout game

---

*This document serves as the comprehensive design specification for the Space Guild resource system implementation.*