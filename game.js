// Space Guilds - Game Logic

// Utility Functions
function createBox(content, title = '') {
    const lines = content.split('\n');
    const maxLength = Math.max(
        ...lines.map(line => line.length),
        title.length + 2
    );
    const width = Math.max(maxLength + 4, 40); // Minimum 40 chars wide
    
    let box = '+' + '-'.repeat(width - 2) + '+\n';
    
    if (title) {
        const padding = Math.floor((width - title.length - 2) / 2);
        const titleLine = '|' + ' '.repeat(padding) + title + ' '.repeat(width - title.length - padding - 2) + '|';
        box += titleLine + '\n';
        box += '+' + '-'.repeat(width - 2) + '+\n';
    }
    
    lines.forEach(line => {
        const padding = width - line.length - 2;
        box += '| ' + line + ' '.repeat(padding - 1) + '|\n';
    });
    
    box += '+' + '-'.repeat(width - 2) + '+';
    return box;
}

function padText(text, width, align = 'left') {
    if (text.length >= width) return text.substring(0, width);
    
    switch(align) {
        case 'center':
            const leftPad = Math.floor((width - text.length) / 2);
            const rightPad = width - text.length - leftPad;
            return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
        case 'right':
            return ' '.repeat(width - text.length) + text;
        default: // left
            return text + ' '.repeat(width - text.length);
    }
}

// System data for interactive tooltips
const systemData = {
    'sol': {
        name: 'Sol System',
        type: 'Homeworld',
        description: 'Earth - Birthplace of humanity',
        population: '8.2 billion',
        threat: 'Minimal',
        resources: 'Water, Organics, History'
    },
    'mars': {
        name: 'Mars Outpost', 
        type: 'Military Base',
        description: 'Forward operating base',
        population: '12,000 military',
        threat: 'Active Combat Zone',
        resources: 'Iron, Weapons, Intel'
    },
    'vega': {
        name: 'Vega Ruins',
        type: 'Alien Site', 
        description: 'Ancient alien civilization remains',
        population: 'Unknown',
        threat: 'Dangerous Artifacts',
        resources: 'Exotic Tech, Mysteries'
    },
    'nexus': {
        name: 'Nexus Gateway',
        type: 'Trade Hub',
        description: 'Major hyperspace junction',
        population: '2.1 million',
        threat: 'Moderate (Pirates)',
        resources: 'Fuel, Parts, Information'
    }
};

// Resource System Constants
const RESOURCE_TYPES = {
    // Legal Resources (5 types)
    Ore: {
        category: 'Legal',
        rarity: 1,
        basePrice: [50, 80],
        catchRate: 0,
        extractionEquipment: null,
        description: 'Basic mining material for construction'
    },
    Circuits: {
        category: 'Legal', 
        rarity: 2,
        basePrice: [80, 150],
        catchRate: 0,
        extractionEquipment: 'BasicScanner',
        description: 'Electronic components for ship systems'
    },
    FuelCells: {
        category: 'Legal',
        rarity: 3, 
        basePrice: [120, 200],
        catchRate: 0,
        extractionEquipment: 'ExtractionRig',
        description: 'Refined fuel for long-distance travel'
    },
    QuantumCrystals: {
        category: 'Legal',
        rarity: 4,
        basePrice: [200, 350],
        catchRate: 0,
        extractionEquipment: 'QuantumHarvester',
        description: 'Advanced crystals for warp technology'
    },
    ExoticMatter: {
        category: 'Legal',
        rarity: 5,
        basePrice: [400, 700], 
        catchRate: 0,
        extractionEquipment: 'MatterProcessor',
        description: 'Rare physics-defying materials'
    },
    
    // Illegal Resources (4 types)
    Contraband: {
        category: 'Illegal',
        rarity: 1,
        basePrice: [150, 250],
        catchRate: 0.10,
        extractionEquipment: null,
        description: 'Stolen goods and illegal weapons'
    },
    Spice: {
        category: 'Illegal',
        rarity: 2,
        basePrice: [300, 500],
        catchRate: 0.20,
        extractionEquipment: 'BasicScanner',
        description: 'Highly addictive psychoactive substance'
    },
    AICores: {
        category: 'Illegal',
        rarity: 3,
        basePrice: [600, 1000],
        catchRate: 0.35,
        extractionEquipment: 'QuantumHarvester',
        description: 'Banned sentient AI technology'
    },
    DarkMatter: {
        category: 'Illegal',
        rarity: 4,
        basePrice: [1200, 2000],
        catchRate: 0.50,
        extractionEquipment: 'MatterProcessor',
        description: 'Extremely dangerous exotic material'
    }
};

const SPECIAL_SITE_TYPES = {
    AsteroidField: {
        name: 'Asteroid Field',
        description: 'Dense asteroid field with valuable ore deposits',
        resources: ['Ore', 'Circuits'],
        extractableRatio: 0.8, // High extractable, low tradable
        tradableRatio: 0.2
    },
    CometTrail: {
        name: 'Comet Trail',
        description: 'Comet trail containing rare crystallized compounds',
        resources: ['FuelCells', 'QuantumCrystals'],
        extractableRatio: 0.6,
        tradableRatio: 0.1
    },
    DerelictShip: {
        name: 'Derelict Ship',
        description: 'Abandoned vessel with salvageable components',
        resources: ['Ore', 'Circuits', 'Contraband', 'Spice'],
        extractableRatio: 0.2,
        tradableRatio: 0.8,
        oneTime: true // Doesn't regenerate
    },
    RogueTrader: {
        name: 'Rogue Trader',
        description: 'Independent trader offering exotic goods',
        resources: ['Ore', 'Circuits', 'FuelCells', 'Contraband', 'Spice'],
        extractableRatio: 0,
        tradableRatio: 1.0,
        variable: true // Inventory changes
    },
    GasHarvester: {
        name: 'Gas Harvesting Station',
        description: 'Automated gas extraction platform',
        resources: ['ExoticMatter', 'QuantumCrystals'],
        extractableRatio: 0.9,
        tradableRatio: 0
    },
    AncientRuins: {
        name: 'Ancient Ruins',
        description: 'Mysterious alien ruins with strange emanations',
        resources: ['AICores', 'DarkMatter'],
        extractableRatio: 0.7,
        tradableRatio: 0,
        dangerous: true // Risk of ship damage
    },
    NebulaPocket: {
        name: 'Nebula Pocket',
        description: 'Dense nebula pocket rich in exotic particles',
        resources: ['QuantumCrystals', 'Spice'],
        extractableRatio: 0.6,
        tradableRatio: 0
    },
    PirateCache: {
        name: 'Pirate Cache',
        description: 'Hidden pirate supply cache',
        resources: ['Contraband', 'Spice', 'AICores'],
        extractableRatio: 0,
        tradableRatio: 1.0,
        oneTime: true
    },
    ResearchProbe: {
        name: 'Research Probe',
        description: 'Abandoned research probe with valuable data',
        resources: ['ExoticMatter', 'AICores'],
        extractableRatio: 0.3,
        tradableRatio: 0.3
    },
    StellarPhenomena: {
        name: 'Stellar Phenomena',
        description: 'Unstable stellar phenomenon creating exotic matter',
        resources: ['ExoticMatter', 'DarkMatter'],
        extractableRatio: 0.5,
        tradableRatio: 0,
        dangerous: true
    }
};

// Game State
const gameState = {
    currentScreen: 'map',
    player: {
        name: 'Captain',
        shipName: 'Starfinder',
        shipType: 'scout1', // Current ship type
        location: 'SOL',
        hexLocation: { x: 30, y: -40, z: 10 }, // Player's current hex position in cube coordinates (was col: 30, row: 25)
        shipRotation: 0, // Ship's current rotation in degrees
        orbitalAngle: 0, // Current orbital position in degrees
        credits: 1247,
        actionPoints: 8,
        maxActionPoints: 10,
        
        // Resource System
        cargo: {
            capacity: 20,
            contents: new Map(), // resourceType -> quantity
            usedSpace: 0
        },
        ship: {
            // Position is derived from hexLocation; do not persist a separate copy
            extractionEquipment: new Set(),
            smugglingUpgrades: {
                shieldedCargo: false,
                fakeDocuments: false, 
                briberyContacts: false,
                advancedTech: false
            }
        }
    },
    galaxy: {
        grid: {
            size: 10, // Size of each grid sector
            scannedSectors: new Set(),
            sectorData: new Map(),
            markedSectors: new Map()
        },
        hexGrid: {
            cols: 60,
            rows: 60,
            hexWidth: 130,
            scannedHexes: new Set(),
            visitedHexes: new Set(), // hexes where guild ships have been
            claimedHexes: new Set(), // hexes claimed by the guild
            markedHexes: new Map(), // hex -> {type: 'investigate'|'avoid'|'priority', note: ''}
            hexData: new Map() // hex -> {probability: 0-90, discoveryType: 'planet'|'artifact'|etc}
        },
        
        // System Generation
        generatedSystems: new Map(), // systemId -> system data
        
        // Resource System
        resources: {
            hexResources: new Map(), // hexId -> { tradable: {}, extractable: {}, siteType: string, lastUpdate: timestamp }
            systemMarkets: new Map(), // systemId -> { buyPrices: {}, sellPrices: {}, marketType: string }
            lastRegeneration: null // Last midnight EST regeneration timestamp
        },
        knownSystems: {
            // Store systems in CUBE coordinates (x, y, z where x+y+z=0)
            'sol': { x: 30, y: -40, z: 10, type: 'homeworld', name: 'Sol System' },
            'mars': { x: 15, y: -19, z: 4, type: 'outpost', name: 'Mars Outpost' },
            'nexus': { x: 35, y: -57, z: 22, type: 'hub', name: 'Nexus Gateway' },
            'void': { x: 45, y: -25, z: -20, type: 'blackhole', name: 'The Void' },
            // Test destinations in empty space
            'empty1': { x: 45, y: -37, z: -8, type: 'empty', name: 'Deep Space Alpha' },
            'empty2': { x: 5, y: -37, z: 32, type: 'empty', name: 'Deep Space Beta' },
            'empty3': { x: 50, y: -75, z: 25, type: 'empty', name: 'Deep Space Gamma' }
        },
        warpLanes: [],
        wormholes: {
            lanes: [] // [{ a: hexId, b: hexId }]
        },
        // Discovery tracking (first-time notifications)
        discoveries: {
            systems: new Set(),     // hexId -> discovered system shown
            resources: new Set(),   // hexId -> discovered resource site shown
            wormholes: new Set(),   // hexId -> discovered wormhole endpoint shown
            log: []                 // [{ kind, hexId, timestamp, title, body, meta }]
        }
    },
    ui: {
        selectedHex: null,
        highlightedHex: null,
        tileStateMode: false,
        tileStateToApply: 'none',
        revealedWormhole: null,
        showAllWormholes: false,
        // Map zoom state
        zoomScale: 1,
        minZoom: 0.25,
        maxZoom: 2,
        // Touch gesture state
        isPinching: false,
        isPanning: false,
        suppressTapUntil: 0,
        // Map interaction mode: 'move' or 'select'
        mapMode: 'move'
    },
    animation: {
        isShipMoving: false,
        orbitAnimation: null,
        isPaused: false,
        animationsEnabled: false,
        targetFps: 30, // default lower frame rate to save battery
        _lastOrbitUpdate: 0,
        // State to restore animations after visibility pause
        wasOrbiting: false,
        prevAnimationsEnabled: true
    },
    npc: {
        ships: [], // [{id, seed, role, shipType, origin:{x,y,z}, pattern:'wander'|'loop', waypoints?:[hexId], reputation:0, lastInteraction:null}]
        // transient caches (not saved)
    }
};

// Screen content generators
const screens = {
    map: () => generateHexGalaxyMap(),
    ship: () => generateShipStatus(),
    guild: () => generateGuildScreen(),
    crisis: () => generateCrisisScreen()
};

// Resource System Functions
function generateResourcesForHex(hexId) {
    // Check if hex already has resources
    if (gameState.galaxy.resources.hexResources.has(hexId)) {
        return gameState.galaxy.resources.hexResources.get(hexId);
    }
    
    // Check if this hex contains a known system - systems handled separately
    const {x, y, z} = parseCubeId(hexId);
    const hasSystem = Object.values(gameState.galaxy.knownSystems)
        .some(system => system.x === x && system.y === y && system.z === z);
    
    if (hasSystem) {
        return null; // Systems don't have raw resources, they have markets
    }
    
    // 1 in 30 chance for special resource site
    if (Math.random() < (1/30)) {
        return generateSpecialResourceSite(hexId);
    }
    
    return null; // Most hexes are empty space
}

// Force generate resources for hex (used by improved distribution algorithm)
function generateResourcesForHexForced(hexId) {
    // Check if hex already has resources
    if (gameState.galaxy.resources.hexResources.has(hexId)) {
        return gameState.galaxy.resources.hexResources.get(hexId);
    }
    
    // Always generate a resource site
    return generateSpecialResourceSite(hexId);
}

function generateSpecialResourceSite(hexId) {
    // Choose random site type
    const siteTypes = Object.keys(SPECIAL_SITE_TYPES);
    const siteTypeKey = siteTypes[Math.floor(Math.random() * siteTypes.length)];
    const siteType = SPECIAL_SITE_TYPES[siteTypeKey];
    
    const resources = {
        tradable: new Map(),
        extractable: new Map(),
        siteType: siteTypeKey,
        siteName: siteType.name,
        description: siteType.description,
        dangerous: siteType.dangerous || false,
        oneTime: siteType.oneTime || false,
        variable: siteType.variable || false,
        lastUpdate: Date.now()
    };
    
    // Generate quantities for each resource type
    for (const resourceType of siteType.resources) {
        const baseQuantity = Math.floor(Math.random() * 6) + 2; // 2-7 units
        
        // Split between tradable and extractable based on site ratios
        const tradableAmount = Math.floor(baseQuantity * siteType.tradableRatio);
        const extractableAmount = Math.floor(baseQuantity * siteType.extractableRatio);
        
        if (tradableAmount > 0) {
            resources.tradable.set(resourceType, {
                current: tradableAmount,
                max: tradableAmount,
                regenRate: siteType.oneTime ? 0 : 0.1 // No regen for one-time sites
            });
        }
        
        if (extractableAmount > 0) {
            resources.extractable.set(resourceType, {
                current: extractableAmount,
                max: extractableAmount,
                regenRate: siteType.oneTime ? 0 : 0.05
            });
        }
    }
    
    // Store in galaxy resources
    gameState.galaxy.resources.hexResources.set(hexId, resources);
    console.log(`Generated ${siteType.name} at ${hexId}:`, resources);
    
    return resources;
}

function checkResourceAvailability(resourceType) {
    // Check if player has required equipment for extraction
    const resourceInfo = RESOURCE_TYPES[resourceType];
    if (!resourceInfo) return { canTrade: false, canExtract: false, reason: 'Unknown resource type' };
    
    const canTrade = true; // Anyone can trade
    const requiredEquipment = resourceInfo.extractionEquipment;
    const canExtract = !requiredEquipment || gameState.player.ship.extractionEquipment.has(requiredEquipment);
    
    return {
        canTrade,
        canExtract,
        reason: canExtract ? null : `Requires ${requiredEquipment} to extract`
    };
}

function canPlayerCarryResource(resourceType, quantity = 1) {
    const availableSpace = gameState.player.cargo.capacity - gameState.player.cargo.usedSpace;
    return availableSpace >= quantity;
}

function addResourceToCargo(resourceType, quantity) {
    if (!canPlayerCarryResource(resourceType, quantity)) {
        return false;
    }
    
    const currentAmount = gameState.player.cargo.contents.get(resourceType) || 0;
    gameState.player.cargo.contents.set(resourceType, currentAmount + quantity);
    gameState.player.cargo.usedSpace += quantity;
    
    console.log(`Added ${quantity} ${resourceType} to cargo`);
    return true;
}

function removeResourceFromCargo(resourceType, quantity) {
    const currentAmount = gameState.player.cargo.contents.get(resourceType) || 0;
    if (currentAmount < quantity) {
        return false;
    }
    
    const newAmount = currentAmount - quantity;
    if (newAmount === 0) {
        gameState.player.cargo.contents.delete(resourceType);
    } else {
        gameState.player.cargo.contents.set(resourceType, newAmount);
    }
    
    gameState.player.cargo.usedSpace -= quantity;
    return true;
}

// Trading System Functions

// System security levels
const SECURITY_LEVELS = {
    CORE: { name: 'Core Worlds', catchRate: 0.50, illegalPenalty: -0.20 },
    INDUSTRIAL: { name: 'Industrial', catchRate: 0.30, illegalPenalty: 0 },
    FRONTIER: { name: 'Frontier', catchRate: 0.10, illegalPenalty: 0.20 },
    PIRATE: { name: 'Pirate Haven', catchRate: 0, illegalPenalty: 0.50 }
};

// Generate market data for a system
function generateMarketForSystem(systemData) {
    const market = {
        systemName: systemData.name || 'Unknown System',
        security: determineSystemSecurity(systemData),
        buyPrices: new Map(),
        sellPrices: new Map(),
        inventory: new Map()
    };
    
    // Generate prices for each resource
    for (const [resourceName, resourceData] of Object.entries(RESOURCE_TYPES)) {
        const [minPrice, maxPrice] = resourceData.basePrice;
        
        // Buy price (what player pays to buy from market)
        const buyPrice = Math.floor(minPrice + Math.random() * (maxPrice - minPrice));
        
        // Sell price (what player gets when selling to market) - typically 70-90% of buy price
        const sellPrice = Math.floor(buyPrice * (0.7 + Math.random() * 0.2));
        
        // Apply security modifiers for illegal goods
        if (resourceData.category === 'Illegal') {
            const securityMod = market.security.illegalPenalty;
            market.buyPrices.set(resourceName, Math.floor(buyPrice * (1 + securityMod)));
            market.sellPrices.set(resourceName, Math.floor(sellPrice * (1 + securityMod)));
        } else {
            market.buyPrices.set(resourceName, buyPrice);
            market.sellPrices.set(resourceName, sellPrice);
        }
        
        // Generate inventory (1-10 units available)
        const inventory = Math.floor(Math.random() * 10) + 1;
        market.inventory.set(resourceName, inventory);
    }
    
    return market;
}

// Determine system security level based on system type
function determineSystemSecurity(systemData) {
    const type = systemData.type || '';
    
    if (type.includes('Homeworld') || type.includes('Core')) {
        return SECURITY_LEVELS.CORE;
    } else if (type.includes('Military') || type.includes('Industrial')) {
        return SECURITY_LEVELS.INDUSTRIAL;
    } else if (type.includes('Pirate') || type.includes('Outlaw')) {
        return SECURITY_LEVELS.PIRATE;
    } else {
        return SECURITY_LEVELS.FRONTIER;
    }
}

// Open trading window for current system
function openTradingWindow() {
    const playerPos = gameState.player.hexLocation;
    const hexId = cubeId(playerPos.x, playerPos.y, playerPos.z);
    
    // Check if there's a system at player location
    const systemData = getSystemAtHex(playerPos.x, playerPos.y, playerPos.z);
    if (!systemData) {
        alert('No market available at this location!');
        return;
    }
    
    // Generate or retrieve market data
    if (!gameState.markets) {
        gameState.markets = new Map();
    }
    
    if (!gameState.markets.has(hexId)) {
        gameState.markets.set(hexId, generateMarketForSystem(systemData));
    }
    
    const market = gameState.markets.get(hexId);
    
    // Store market context
    gameState.currentMarketId = hexId;
    gameState.currentMarketType = 'system';
    
    // Update UI
    document.getElementById('market-system-name').textContent = market.systemName;
    document.getElementById('market-security').textContent = `SECURITY: ${market.security.name.toUpperCase()}`;
    document.getElementById('market-security').className = `security-level security-${market.security.name.toLowerCase().replace(' ', '-')}`;
    
    document.getElementById('trade-credits').textContent = gameState.player.credits;
    document.getElementById('trade-cargo-used').textContent = gameState.player.cargo.usedSpace;
    document.getElementById('trade-cargo-capacity').textContent = gameState.player.cargo.capacity;
    
    // Populate buy list
    populateBuyList(market);
    
    // Populate sell list
    populateSellList(market);
    
    // Show the modal
    document.getElementById('trading-window').classList.remove('hidden');
}

// Close trading window
function closeTradingWindow() {
    document.getElementById('trading-window').classList.add('hidden');
    // Clear any pending trades
    pendingTrades = { buy: new Map(), sell: new Map() };
    // Clear market context
    gameState.currentMarketId = null;
    gameState.currentMarketType = null;
}

// Track pending trades before confirmation
let pendingTrades = { buy: new Map(), sell: new Map() };

// Populate the buy list in trading window
function populateBuyList(market) {
    const buyList = document.getElementById('buy-list');
    buyList.innerHTML = '';
    
    for (const [resourceName, price] of market.buyPrices.entries()) {
        const resourceData = RESOURCE_TYPES[resourceName];
        const inventory = market.inventory.get(resourceName);
        
        if (inventory <= 0) continue; // Skip if no inventory
        
        const itemDiv = document.createElement('div');
        itemDiv.className = `resource-item ${resourceData.category === 'Illegal' ? 'illegal' : ''}`;
        
        itemDiv.innerHTML = `
            <div class="resource-info">
                <div class="resource-name">${resourceName}</div>
                <div class="resource-price">¢${price} each (${inventory} available)</div>
                ${resourceData.category === 'Illegal' ? 
                    `<div class="resource-risk">⚠️ ${Math.floor(market.security.catchRate * 100)}% catch risk</div>` : ''}
            </div>
            <div class="resource-controls">
                <div class="qty-controls">
                    <button class="qty-btn" onclick="adjustBuyQty('${resourceName}', -1)">-</button>
                    <span class="qty-display" id="buy-qty-${resourceName}">0</span>
                    <button class="qty-btn" onclick="adjustBuyQty('${resourceName}', 1)">+</button>
                </div>
                <button class="max-btn" onclick="maxBuy('${resourceName}')">MAX</button>
                <span class="trade-total" id="buy-total-${resourceName}"></span>
            </div>
        `;
        
        buyList.appendChild(itemDiv);
    }
}

// Populate the sell list in trading window
function populateSellList(market) {
    const sellList = document.getElementById('sell-list');
    sellList.innerHTML = '';
    
    if (gameState.player.cargo.contents.size === 0) {
        sellList.innerHTML = '<div style="color: #888; text-align: center; padding: 20px;">No cargo to sell</div>';
        return;
    }
    
    for (const [resourceName, quantity] of gameState.player.cargo.contents.entries()) {
        const resourceData = RESOURCE_TYPES[resourceName];
        const price = market.sellPrices.get(resourceName);
        
        const itemDiv = document.createElement('div');
        itemDiv.className = `resource-item ${resourceData.category === 'Illegal' ? 'illegal' : ''}`;
        
        itemDiv.innerHTML = `
            <div class="resource-info">
                <div class="resource-name">${resourceName} (${quantity} units)</div>
                <div class="resource-price">¢${price} each</div>
            </div>
            <div class="resource-controls">
                <div class="qty-controls">
                    <button class="qty-btn" onclick="adjustSellQty('${resourceName}', -1)">-</button>
                    <span class="qty-display" id="sell-qty-${resourceName}">0</span>
                    <button class="qty-btn" onclick="adjustSellQty('${resourceName}', 1)">+</button>
                </div>
                <button class="max-btn" onclick="maxSell('${resourceName}')">MAX</button>
                <span class="trade-total" id="sell-total-${resourceName}"></span>
            </div>
        `;
        
        sellList.appendChild(itemDiv);
    }
}

// Adjust buy quantity
function adjustBuyQty(resourceName, delta) {
    const current = pendingTrades.buy.get(resourceName) || 0;
    const newQty = Math.max(0, current + delta);
    
    // Check cargo space
    const totalBuyQty = Array.from(pendingTrades.buy.values()).reduce((a, b) => a + b, 0);
    const totalSellQty = Array.from(pendingTrades.sell.values()).reduce((a, b) => a + b, 0);
    const projectedCargo = gameState.player.cargo.usedSpace - totalSellQty + totalBuyQty + delta;
    
    if (delta > 0 && projectedCargo > gameState.player.cargo.capacity) {
        alert('Not enough cargo space!');
        return;
    }
    
    // Check inventory
    const market = gameState.currentMarketType === 'npc' ? 
        gameState.markets.get(gameState.currentMarketId) :
        gameState.markets.get(cubeId(gameState.player.hexLocation.x, gameState.player.hexLocation.y, gameState.player.hexLocation.z));
    if (newQty > market.inventory.get(resourceName)) {
        alert('Not enough inventory!');
        return;
    }
    
    // Check credits
    const price = market.buyPrices.get(resourceName);
    const totalCost = calculateTotalCost();
    if (totalCost + (delta * price) > gameState.player.credits) {
        alert('Not enough credits!');
        return;
    }
    
    pendingTrades.buy.set(resourceName, newQty);
    document.getElementById(`buy-qty-${resourceName}`).textContent = newQty;
    document.getElementById(`buy-total-${resourceName}`).textContent = newQty > 0 ? `¢${newQty * price}` : '';
    
    updateTradeProfit();
}

// Adjust sell quantity  
function adjustSellQty(resourceName, delta) {
    const current = pendingTrades.sell.get(resourceName) || 0;
    const owned = gameState.player.cargo.contents.get(resourceName) || 0;
    const newQty = Math.max(0, Math.min(owned, current + delta));
    
    pendingTrades.sell.set(resourceName, newQty);
    document.getElementById(`sell-qty-${resourceName}`).textContent = newQty;
    
    const market = gameState.currentMarketType === 'npc' ? 
        gameState.markets.get(gameState.currentMarketId) :
        gameState.markets.get(cubeId(gameState.player.hexLocation.x, gameState.player.hexLocation.y, gameState.player.hexLocation.z));
    const price = market.sellPrices.get(resourceName);
    document.getElementById(`sell-total-${resourceName}`).textContent = newQty > 0 ? `¢${newQty * price}` : '';
    
    updateTradeProfit();
}

// Max buy for a resource
function maxBuy(resourceName) {
    const market = gameState.currentMarketType === 'npc' ? 
        gameState.markets.get(gameState.currentMarketId) :
        gameState.markets.get(cubeId(gameState.player.hexLocation.x, gameState.player.hexLocation.y, gameState.player.hexLocation.z));
    
    const price = market.buyPrices.get(resourceName);
    const inventory = market.inventory.get(resourceName);
    const availableSpace = gameState.player.cargo.capacity - gameState.player.cargo.usedSpace + 
                          Array.from(pendingTrades.sell.values()).reduce((a, b) => a + b, 0) -
                          Array.from(pendingTrades.buy.values()).reduce((a, b) => a + b, 0);
    const affordableQty = Math.floor(gameState.player.credits / price);
    
    const maxQty = Math.min(inventory, availableSpace, affordableQty);
    pendingTrades.buy.set(resourceName, maxQty);
    
    document.getElementById(`buy-qty-${resourceName}`).textContent = maxQty;
    document.getElementById(`buy-total-${resourceName}`).textContent = maxQty > 0 ? `¢${maxQty * price}` : '';
    
    updateTradeProfit();
}

// Max sell for a resource
function maxSell(resourceName) {
    const owned = gameState.player.cargo.contents.get(resourceName) || 0;
    pendingTrades.sell.set(resourceName, owned);
    
    document.getElementById(`sell-qty-${resourceName}`).textContent = owned;
    
    const market = gameState.currentMarketType === 'npc' ? 
        gameState.markets.get(gameState.currentMarketId) :
        gameState.markets.get(cubeId(gameState.player.hexLocation.x, gameState.player.hexLocation.y, gameState.player.hexLocation.z));
    const price = market.sellPrices.get(resourceName);
    document.getElementById(`sell-total-${resourceName}`).textContent = `¢${owned * price}`;
    
    updateTradeProfit();
}

// Calculate total cost of pending trades
function calculateTotalCost() {
    const market = gameState.currentMarketType === 'npc' ? 
        gameState.markets.get(gameState.currentMarketId) :
        gameState.markets.get(cubeId(gameState.player.hexLocation.x, gameState.player.hexLocation.y, gameState.player.hexLocation.z));
    
    let totalCost = 0;
    for (const [resourceName, qty] of pendingTrades.buy.entries()) {
        totalCost += qty * market.buyPrices.get(resourceName);
    }
    
    return totalCost;
}

// Calculate total revenue from pending trades
function calculateTotalRevenue() {
    const market = gameState.currentMarketType === 'npc' ? 
        gameState.markets.get(gameState.currentMarketId) :
        gameState.markets.get(cubeId(gameState.player.hexLocation.x, gameState.player.hexLocation.y, gameState.player.hexLocation.z));
    
    let totalRevenue = 0;
    for (const [resourceName, qty] of pendingTrades.sell.entries()) {
        totalRevenue += qty * market.sellPrices.get(resourceName);
    }
    
    return totalRevenue;
}

// Update profit indicator
function updateTradeProfit() {
    const cost = calculateTotalCost();
    const revenue = calculateTotalRevenue();
    const profit = revenue - cost;
    
    const indicator = document.getElementById('trade-profit-indicator');
    if (profit > 0) {
        indicator.textContent = `Profit: +¢${profit}`;
        indicator.className = 'stat-item profit';
    } else if (profit < 0) {
        indicator.textContent = `Cost: -¢${Math.abs(profit)}`;
        indicator.className = 'stat-item loss';
    } else {
        indicator.textContent = '';
        indicator.className = 'stat-item';
    }
}

// Confirm and execute trades
function confirmTrades() {
    // Get the current market (could be system or NPC)
    let market;
    if (gameState.currentMarketType === 'npc') {
        market = gameState.markets.get(gameState.currentMarketId);
    } else {
        const playerPos = gameState.player.hexLocation;
        const hexId = cubeId(playerPos.x, playerPos.y, playerPos.z);
        market = gameState.markets.get(hexId);
    }
    
    // Check if any illegal goods are being traded
    let tradingIllegal = false;
    let illegalResources = [];
    
    for (const [resourceName, qty] of pendingTrades.buy.entries()) {
        if (qty > 0 && RESOURCE_TYPES[resourceName].category === 'Illegal') {
            tradingIllegal = true;
            illegalResources.push(resourceName);
        }
    }
    
    // Check for getting caught with illegal goods
    if (tradingIllegal && Math.random() < market.security.catchRate) {
        // Caught!
        const fine = calculateTotalCost() * 3; // 3x the value as fine
        gameState.player.credits = Math.max(0, gameState.player.credits - fine);
        alert(`CAUGHT! Security confiscated your illegal goods and fined you ¢${fine}!`);
        
        // Clear illegal trades
        for (const resource of illegalResources) {
            pendingTrades.buy.delete(resource);
        }
        
        // Update UI
        updateTradeProfit();
        return;
    }
    
    // Execute sell trades first (to free up cargo space)
    for (const [resourceName, qty] of pendingTrades.sell.entries()) {
        if (qty > 0) {
            removeResourceFromCargo(resourceName, qty);
            gameState.player.credits += qty * market.sellPrices.get(resourceName);
        }
    }
    
    // Execute buy trades
    for (const [resourceName, qty] of pendingTrades.buy.entries()) {
        if (qty > 0) {
            addResourceToCargo(resourceName, qty);
            gameState.player.credits -= qty * market.buyPrices.get(resourceName);
            market.inventory.set(resourceName, market.inventory.get(resourceName) - qty);
        }
    }
    
    // Check for perfect trade
    const profit = calculateTotalRevenue() - calculateTotalCost();
    if (profit > 500) {
        alert(`LEGENDARY TRADE! You made ¢${profit} profit!`);
    } else if (profit > 200) {
        alert(`Great trade! +¢${profit} profit!`);
    }
    
    // Clear pending trades
    pendingTrades = { buy: new Map(), sell: new Map() };
    
    // Close window
    closeTradingWindow();
    
    // Update main display
    updateStatusPanel();
    
    // Save the game state including cargo changes
    autoSave();
}

// Helper to get system at hex location
function getSystemAtHex(x, y, z) {
    // Check known systems
    for (const system of Object.values(gameState.galaxy.knownSystems)) {
        if (system.x === x && system.y === y && system.z === z) {
            return system;
        }
    }
    
    // Check generated systems
    const systemId = `sys_${x}_${y}_${z}`;
    if (gameState.galaxy.generatedSystems && gameState.galaxy.generatedSystems.has(systemId)) {
        return gameState.galaxy.generatedSystems.get(systemId);
    }
    
    return null;
}

// Generate SVG Hex Galaxy Map
function generateHexGalaxyMap() {
    // Hex grid parameters
    const hexWidth = 130; // ~5/8 inch on mobile
    const hexHeight = hexWidth * (Math.sqrt(3) / 2); // Standard hex proportions
    const hexRadius = hexWidth / 2;
    
    // Grid dimensions for 3600 cells (60x60)
    const gridCols = 60;
    const gridRows = 60;
    
    // Calculate total SVG dimensions
    const svgWidth = gridCols * hexWidth * 0.75 + hexWidth * 0.25;
    const svgHeight = gridRows * hexHeight + hexHeight * 0.5;
    
    // Start building SVG
    let svg = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Background with scattered stars
    svg += generateStarField(svgWidth, svgHeight);
    
    // Generate hex grid (invisible until touched)
    svg += generateHexGrid(gridCols, gridRows, hexWidth, hexHeight, hexRadius);
    
    // Add discovered systems
    svg += generateDiscoveredSystems(hexWidth, hexHeight);
    
    // Add travel routes from legacy warpLanes (none by default now)
    // svg += generateTravelRoutes(hexWidth, hexHeight);

    // Add wormhole terminations and conditional paths
    svg += renderWormholes(hexWidth, hexHeight);
    
    // Add player ship at current location
    svg += generatePlayerShip(hexWidth, hexHeight);
    
    svg += '</svg>';
    
    return svg;
}

// Generate background star field
function generateStarField(width, height) {
    let stars = '<g id="star-field">';
    
    // Generate random stars across the entire area
    const starCount = Math.floor((width * height) / 20000); // Density similar to ASCII version
    
    for (let i = 0; i < starCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 2 + 0.5;
        const opacity = Math.random() * 0.8 + 0.2;
        
        stars += `<circle cx="${x}" cy="${y}" r="${size}" fill="#00FF41" opacity="${opacity}" />`;
    }
    
    stars += '</g>';
    return stars;
}

// CUBE COORDINATE SYSTEM - Primary coordinate system for all hex operations

// Convert offset coordinates to cube coordinates
function offsetToCube(col, row) {
    const x = col;
    const z = row - Math.floor(col / 2);
    const y = -x - z;
    return {x, y, z};
}

// Convert cube coordinates to offset coordinates (for rendering)
function cubeToOffset(x, y, z) {
    const col = x;
    const row = z + Math.floor(x / 2);
    return {col, row};
}

// Create cube coordinate ID string
function cubeId(x, y, z) {
    return `${x},${y},${z}`;
}

// Parse cube coordinate ID string
function parseCubeId(cubeId) {
    const [x, y, z] = cubeId.split(',').map(Number);
    return {x, y, z};
}

// Cube coordinate neighbor directions for flat-topped hexes (corrected to match UI)
// Based on test: direction {0,-1,+1} should be E1, not E0
const CUBE_DIRS = [
    {x: +1, y: -1, z:  0}, // 0: E  (right, where E0 appears in UI)
    {x:  0, y: -1, z: +1}, // 1: SE (bottom-right, where E1 should be) 
    {x: -1, y:  0, z: +1}, // 2: SW (bottom-left, where E2 should be)
    {x: -1, y: +1, z:  0}, // 3: W  (left, where E3 should be)
    {x:  0, y: +1, z: -1}, // 4: NW (top-left, where E4 should be)
    {x: +1, y:  0, z: -1}  // 5: NE (top-right, where E5 should be)
];

// Get all 6 neighbors of a hex in cube coordinates
function getCubeNeighbors(x, y, z) {
    return CUBE_DIRS.map(dir => ({
        x: x + dir.x,
        y: y + dir.y, 
        z: z + dir.z
    }));
}

// Check if two hexes are adjacent in cube coordinates
function areHexesAdjacent(x1, y1, z1, x2, y2, z2) {
    const dx = Math.abs(x1 - x2);
    const dy = Math.abs(y1 - y2);
    const dz = Math.abs(z1 - z2);
    return Math.max(dx, dy, dz) === 1;
}

// STEP 2: Determine which edge connects to a specific neighbor
function getEdgeToNeighbor(hex_x, hex_y, hex_z, neighbor_x, neighbor_y, neighbor_z) {
    // Calculate the direction vector
    const dx = neighbor_x - hex_x;
    const dy = neighbor_y - hex_y;
    const dz = neighbor_z - hex_z;
    
    // Find which direction this matches in our CUBE_DIRS array
    for (let i = 0; i < CUBE_DIRS.length; i++) {
        const dir = CUBE_DIRS[i];
        if (dir.x === dx && dir.y === dy && dir.z === dz) {
            return i; // Return edge index (0-5)
        }
    }
    return -1; // Not adjacent
}

// Check if a hex has a neighbor on a specific edge within a given set (PURE CUBE COORDINATES)
function hasNeighborOnEdge(cubeX, cubeY, cubeZ, edgeIndex, hexSet) {
    // Get neighbor directly in cube coordinates - NO CONVERSION!
    const dir = CUBE_DIRS[edgeIndex];
    const neighborX = cubeX + dir.x;
    const neighborY = cubeY + dir.y; 
    const neighborZ = cubeZ + dir.z;
    const neighborId = cubeId(neighborX, neighborY, neighborZ);
    
    const hasNeighbor = hexSet.has(neighborId);
    
    // Debug logging removed for production
    
    return hasNeighbor;
}

// Precomputed double-scale corner offsets in cube space (integers)
const CUBE_CORNER2 = [
    {x: 2, y: -1, z: -1},  // 0: right
    {x: 1, y: -2, z: 1},   // 1: top-right
    {x: -1, y: -1, z: 2},  // 2: top-left
    {x: -2, y: 1, z: 1},   // 3: left
    {x: -1, y: 2, z: -1},  // 4: bottom-left
    {x: 1, y: 1, z: -2}    // 5: bottom-right
];

// Create integer vertex ID from hex and corner index
function getVertexID(q, r, cornerIndex) {
    const cube = axialToCube(q, r);
    const corner = CUBE_CORNER2[cornerIndex];
    return `${2*cube.x + corner.x},${2*cube.y + corner.y},${2*cube.z + corner.z}`;
}


// Get neighbor hex for a specific edge (using cube coordinates internally)
function getNeighborForEdge(col, row, edgeIndex) {
    const {x, y, z} = offsetToCube(col, row);
    const dir = CUBE_DIRS[edgeIndex];
    const neighbor = {
        x: x + dir.x,
        y: y + dir.y,
        z: z + dir.z
    };
    const {col: nCol, row: nRow} = cubeToOffset(neighbor.x, neighbor.y, neighbor.z);
    return [nCol, nRow];
}

// STEP 3: Get perimeter edges by finding unshared edges (following the guide)
function getPerimeterEdges(hexSet) {
    const perimeterEdges = [];
    
    for (const hexId of hexSet) {
        const {x, y, z} = parseCubeId(hexId);
        const {col, row} = cubeToOffset(x, y, z);
        
        // Check each edge (E0-E5)
        for (let edgeIndex = 0; edgeIndex < 6; edgeIndex++) {
            // If this edge doesn't have a neighbor in the same set, it's on the perimeter
            if (!hasNeighborOnEdge(col, row, edgeIndex, hexSet)) {
                perimeterEdges.push({
                    hexId,
                    col, row, x, y, z,
                    edgeIndex,
                    isPerimeter: true
                });
            } else {
                // For debugging: track internal edges too
                perimeterEdges.push({
                    hexId,
                    col, row, x, y, z,
                    edgeIndex,
                    isPerimeter: false
                });
            }
        }
    }
    
    return perimeterEdges;
}

// Legacy function for backward compatibility - now uses pure cube coordinates
function getExposedEdges(col, row, stateSet) {
    const {x, y, z} = offsetToCube(col, row);
    const hexId = cubeId(x, y, z);
    if (!stateSet.has(hexId)) return [true, true, true, true, true, true];
    
    const exposed = new Array(6).fill(false);
    for (let i = 0; i < 6; i++) {
        // Use pure cube coordinates - NO CONVERSION!
        exposed[i] = !hasNeighborOnEdge(x, y, z, i, stateSet);
    }
    return exposed;
}

// Cube-native exposed edges helper (preferred)
function getExposedEdgesCube(x, y, z, stateSet) {
    const hexId = cubeId(x, y, z);
    if (!stateSet.has(hexId)) return [true, true, true, true, true, true];
    const exposed = new Array(6).fill(false);
    for (let i = 0; i < 6; i++) {
        exposed[i] = !hasNeighborOnEdge(x, y, z, i, stateSet);
    }
    return exposed;
}

// Find boundary half-edges for a region
function findBoundaryHalfEdges(regionSet) {
    const halfEdges = [];
    
    for (const hexId of regionSet) {
        const {x, y, z} = parseCubeId(hexId);
        const {col, row} = cubeToOffset(x, y, z);
        const {q, r} = offsetToAxial(col, row);
        
        // Check all 6 edges
        for (let i = 0; i < 6; i++) {
            const [dq, dr] = AXIAL_DIRS[i];
            const neighborQ = q + dq;
            const neighborR = r + dr;
            const {col: nCol, row: nRow} = axialToOffset(neighborQ, neighborR);
            const neighborId = `${nCol},${nRow}`;
            
            // If neighbor is not in same region, this is a boundary edge
            if (!regionSet.has(neighborId)) {
                halfEdges.push({q, r, edgeIndex: i});
            }
        }
    }
    
    return halfEdges;
}

// Build loops using simple edge chaining
function buildBoundaryLoops(halfEdges) {
    console.log(`buildBoundaryLoops: Processing ${halfEdges.length} half-edges`);
    
    const loops = [];
    const usedEdges = new Set();
    
    // Simple approach: just return individual hex borders for now as fallback
    // Group edges by hex
    const edgesByHex = new Map();
    for (const edge of halfEdges) {
        const hexKey = `${edge.q},${edge.r}`;
        if (!edgesByHex.has(hexKey)) {
            edgesByHex.set(hexKey, []);
        }
        edgesByHex.get(hexKey).push(edge);
    }
    
    console.log(`Found edges for ${edgesByHex.size} hexes`);
    
    // For now, create a simple approach - make one boundary per connected region
    // This is temporary until we fix the proper algorithm
    const allVertices = new Set();
    for (const edge of halfEdges) {
        allVertices.add(getVertexID(edge.q, edge.r, edge.edgeIndex));
        allVertices.add(getVertexID(edge.q, edge.r, (edge.edgeIndex + 1) % 6));
    }
    
    // Convert to array and create one simple loop
    const vertices = Array.from(allVertices);
    if (vertices.length >= 3) {
        // Sort vertices by their position for a reasonable boundary
        vertices.sort();
        loops.push(vertices);
        console.log(`Created single loop with ${vertices.length} vertices`);
    }
    
    return loops;
}

// Get corner position in pixels for a hex
function getHexCornerPixel(q, r, cornerIndex, hexWidth, hexHeight, hexRadius) {
    // Axial to offset
    const {col, row} = axialToOffset(q, r);
    
    // Calculate hex center in pixels
    const x = col * hexWidth * 0.75;
    const y = row * hexHeight + (col % 2) * hexHeight * 0.5;
    const centerX = x + hexRadius;
    const centerY = y + hexHeight/2;
    
    // Corner angle (flat-topped hex)
    const angle = (Math.PI / 3) * cornerIndex;
    const px = centerX + hexRadius * Math.cos(angle);
    const py = centerY + hexRadius * Math.sin(angle);
    
    return {x: px, y: py};
}

// Convert vertex ID to pixel coordinates
function vertexIDToPixel(vertexId, halfEdges, hexWidth, hexHeight, hexRadius) {
    // Find any half-edge that uses this vertex
    for (const edge of halfEdges) {
        const v1 = getVertexID(edge.q, edge.r, edge.edgeIndex);
        const v2 = getVertexID(edge.q, edge.r, (edge.edgeIndex + 1) % 6);
        
        if (v1 === vertexId) {
            return getHexCornerPixel(edge.q, edge.r, edge.edgeIndex, hexWidth, hexHeight, hexRadius);
        }
        if (v2 === vertexId) {
            return getHexCornerPixel(edge.q, edge.r, (edge.edgeIndex + 1) % 6, hexWidth, hexHeight, hexRadius);
        }
    }
    
    return {x: 0, y: 0}; // Should never happen
}

// Generate region borders with proper contiguous handling
function generateRegionBorders(stateSet, hexWidth, hexHeight, hexRadius, strokeStyle) {
    try {
        console.log(`generateRegionBorders: Processing ${stateSet.size} hexes with style: ${strokeStyle}`);
        console.log('Hex IDs:', Array.from(stateSet));
        
        // Find boundary half-edges
        const halfEdges = findBoundaryHalfEdges(stateSet);
        console.log(`Found ${halfEdges.length} boundary half-edges:`, halfEdges);
        
        if (halfEdges.length === 0) return '';
        
        // Build boundary loops
        const loops = buildBoundaryLoops(halfEdges);
        console.log(`Built ${loops.length} boundary loops:`, loops.map(loop => `${loop.length} vertices`));
        
        // Convert loops to SVG paths
        const paths = [];
        for (const loop of loops) {
            if (loop.length < 3) continue; // Skip invalid loops
            
            let pathData = '';
            const pixels = [];
            for (let i = 0; i < loop.length; i++) {
                const pixel = vertexIDToPixel(loop[i], halfEdges, hexWidth, hexHeight, hexRadius);
                pixels.push(`(${Math.round(pixel.x)},${Math.round(pixel.y)})`);
                if (i === 0) {
                    pathData += `M ${pixel.x} ${pixel.y}`;
                } else {
                    pathData += ` L ${pixel.x} ${pixel.y}`;
                }
            }
            pathData += ' Z';
            console.log(`Loop path pixels: ${pixels.join(' -> ')}`);
            console.log(`SVG path: ${pathData}`);
            
            paths.push(`<path d="${pathData}" fill="none" ${strokeStyle}/>`);
        }
        
        console.log(`Generated ${paths.length} SVG paths`);
        return paths.join('');
        
    } catch (error) {
        console.error('Error in generateRegionBorders:', error);
        return ''; // Return empty string on error
    }
}


// Generate hex grid (completely invisible until touched)
function generateHexGrid(cols, rows, hexWidth, hexHeight, hexRadius) {
    let grid = '<g id="hex-grid">';
    
    // First pass: render all background elements
    let backgroundElements = '<g id="hex-backgrounds" pointer-events="none">';
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * hexWidth * 0.75;
            const y = row * hexHeight + (col % 2) * hexHeight * 0.5;
            
            const hexPath = createHexPath(x + hexRadius, y + hexHeight/2, hexRadius);
            
            const centerX = x + hexRadius;
            const centerY = y + hexHeight/2;
            const {x: hx, y: hy, z: hz} = offsetToCube(col, row);
            const hexId = cubeId(hx, hy, hz);
            
            
            // Resource site graphics (only for visited/claimed)
            const isVisited = gameState.galaxy.hexGrid.visitedHexes.has(hexId);
            const isClaimed = gameState.galaxy.hexGrid.claimedHexes.has(hexId);
            if (isVisited || isClaimed) {
                const hexResources = gameState.galaxy.resources.hexResources.get(hexId);
                if (hexResources && (hexResources.specialSite || hexResources.siteType)) {
                    const rawType = hexResources.specialSite ? hexResources.specialSite.type : hexResources.siteType;
                    const norm = String(rawType || '').replace(/\s+/g, '').toLowerCase();
                    const renderers = {
                        asteroidfield: createAsteroidFieldGraphics,
                        comettrail: createCometTrailGraphics,
                        derelictship: createDerelictShipGraphics,
                        roguetrader: createRogueTraderGraphics,
                        gasharvesting: createGasHarvestingGraphics,
                        gasharvester: createGasHarvestingGraphics,
                        ancientruins: createAncientRuinsGraphics,
                        nebulapocket: createNebulaPocketGraphics,
                        piratecache: createPirateCacheGraphics,
                        researchprobe: createResearchProbeGraphics,
                        stellarphenomena: createStellarPhenomenaGraphics
                    };
                    const renderer = renderers[norm];
                    const resourceGraphics = renderer
                        ? renderer(centerX, centerY, hexRadius)
                        : createGenericResourceGraphics(centerX, centerY, hexRadius);
                    backgroundElements += `
                        <g class="resource-site-graphics" pointer-events="none">
                            <clipPath id="resource-clip-${col}-${row}">
                                <path d="${hexPath}"/>
                            </clipPath>
                            <g clip-path="url(#resource-clip-${col}-${row})">${resourceGraphics}</g>
                        </g>`;
                }
            }

            // Check cell state and apply appropriate graphics (but NOT borders - those are handled separately)
            // Priority order: CLAIMED > VISITED > SCANNED
            if (gameState.galaxy.hexGrid.claimedHexes.has(hexId)) {
                // CLAIMED: No individual border (handled by region border system)
                // Just placeholder for future claimed-specific graphics if needed
            } else if (gameState.galaxy.hexGrid.visitedHexes.has(hexId)) {
                // VISITED: No individual border (handled by region border system)
                // Just placeholder for future visited-specific graphics if needed
            } else if (gameState.galaxy.hexGrid.scannedHexes.has(hexId)) {
                // SCANNED: Old CRT screen scan lines (only shown if not visited)
                let scanLines = '';
                for (let i = 0; i < 12; i++) {
                    const offset = i * 6 - 30;
                    const opacity = 0.15 + (Math.sin(i * 0.5) * 0.08); // Increased base opacity
                    scanLines += `<line x1="${centerX - hexRadius + offset}" y1="${centerY - hexRadius*0.6}" 
                                       x2="${centerX + hexRadius + offset}" y2="${centerY + hexRadius*0.6}" 
                                       stroke="#00FF41" stroke-width="2" opacity="${opacity}"/>`;
                }
                // Add more visible horizontal interference lines
                for (let i = 0; i < 3; i++) {
                    const yOffset = (i - 1) * 20;
                    scanLines += `<line x1="${centerX - hexRadius*0.8}" y1="${centerY + yOffset}" 
                                       x2="${centerX + hexRadius*0.8}" y2="${centerY + yOffset}" 
                                       stroke="#00FF41" stroke-width="0.8" opacity="0.1"/>`;
                }
                backgroundElements += `<g class="hex-scanned-background">
                                        <clipPath id="hex-clip-${col}-${row}">
                                            <path d="${hexPath}"/>
                                        </clipPath>
                                        <g clip-path="url(#hex-clip-${col}-${row})">${scanLines}</g>
                                     </g>`;
            }
        }
    }
    backgroundElements += '</g>';
    
    // Generate region borders using topological boundary tracing
    let regionBorders = '<g id="region-borders" pointer-events="none">';
    
    // Generate borders for visited hexes with edge debugging
    if (gameState.galaxy.hexGrid.visitedHexes && gameState.galaxy.hexGrid.visitedHexes.size > 0) {
        // Clean up invalid hex IDs
        const invalidHexes = [];
        for (const hexId of gameState.galaxy.hexGrid.visitedHexes) {
            if (!hexId || hexId.includes('undefined') || hexId.includes('NaN')) {
                console.warn(`Removing invalid visited hex ID: ${hexId}`);
                invalidHexes.push(hexId);
            }
        }
        invalidHexes.forEach(id => gameState.galaxy.hexGrid.visitedHexes.delete(id));
        
        // Use actual cube coordinates for better communication
        const hexLabels = {};
        for (const hexId of gameState.galaxy.hexGrid.visitedHexes) {
            hexLabels[hexId] = hexId.replace(/,/g, ' '); // Remove commas to save space
        }
        
        for (const hexId of gameState.galaxy.hexGrid.visitedHexes) {
            const {x: hx, y: hy, z: hz} = parseCubeId(hexId);
            
            // Skip if parsing failed
            if (isNaN(hx) || isNaN(hy) || isNaN(hz)) {
                console.warn(`Skipping invalid hex coordinates: ${hexId}`);
                continue;
            }
            const exposedEdges = getExposedEdgesCube(hx, hy, hz, gameState.galaxy.hexGrid.visitedHexes);
            const center = cubeToPixel(hx, hy, hz, hexWidth, hexHeight);
            const centerX = center.x;
            const centerY = center.y;
            
            // No hex labels needed in production
            
            // STEP 2 CHECKPOINT: Edge labels E0-E5 for validation
            for (let i = 0; i < 6; i++) {
                // Use consistent E0-E5 labeling as per guide
                // E0=East, E1=NE, E2=NW, E3=West, E4=SW, E5=SE (cube coordinate directions)
                const edgeLabel = `E${i}`;
                
                // Calculate midpoint of edge for label placement
                const corner1 = i;
                const corner2 = (i + 1) % 6;
                const angle1 = (Math.PI / 3) * corner1;
                const angle2 = (Math.PI / 3) * corner2;
                const x1 = centerX + hexRadius * Math.cos(angle1);
                const y1 = centerY + hexRadius * Math.sin(angle1);
                const x2 = centerX + hexRadius * Math.cos(angle2);
                const y2 = centerY + hexRadius * Math.sin(angle2);
                
                // Validate coordinates before using them
                if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
                    console.error(`NaN in visited hex border: hexId=${hexId}, edge=${i}, x1=${x1}, y1=${y1}, x2=${x2}, y2=${y2}`);
                    continue; // Skip this edge
                }
                
                // Midpoint of edge
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;
                
                // Move label slightly toward center
                const labelX = centerX + (midX - centerX) * 0.7;
                const labelY = centerY + (midY - centerY) * 0.7;
                
                // Draw edge if exposed
                const isDrawn = exposedEdges[i];
                const renderState = isDrawn ? 1 : 0;
                
                if (isDrawn && !isNaN(x1) && !isNaN(y1) && !isNaN(x2) && !isNaN(y2)) {
                    // Visited hexes: dashed borders
                    regionBorders += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#00FF41" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.7"/>`;
                }
                
                // No edge labels needed in production
            }
        }
    }
    
    // Generate borders for claimed hexes with edge debugging
    if (gameState.galaxy.hexGrid.claimedHexes && gameState.galaxy.hexGrid.claimedHexes.size > 0) {
        // Clean up invalid hex IDs
        const invalidHexes = [];
        for (const hexId of gameState.galaxy.hexGrid.claimedHexes) {
            if (!hexId || hexId.includes('undefined') || hexId.includes('NaN')) {
                console.warn(`Removing invalid claimed hex ID: ${hexId}`);
                invalidHexes.push(hexId);
            }
        }
        invalidHexes.forEach(id => gameState.galaxy.hexGrid.claimedHexes.delete(id));
        
        // Use actual cube coordinates for better communication
        const hexLabels = {};
        for (const hexId of gameState.galaxy.hexGrid.claimedHexes) {
            hexLabels[hexId] = hexId.replace(/,/g, ' '); // Remove commas to save space
        }
        
        for (const hexId of gameState.galaxy.hexGrid.claimedHexes) {
            const {x: hx, y: hy, z: hz} = parseCubeId(hexId);
            
            // Skip if parsing failed
            if (isNaN(hx) || isNaN(hy) || isNaN(hz)) {
                console.warn(`Skipping invalid claimed hex: ${hexId}`);
                continue;
            }
            const exposedEdges = getExposedEdgesCube(hx, hy, hz, gameState.galaxy.hexGrid.claimedHexes);
            const center = cubeToPixel(hx, hy, hz, hexWidth, hexHeight);
            const centerX = center.x;
            const centerY = center.y;
            
            // No hex labels needed in production
            
            // STEP 2 CHECKPOINT: Edge labels E0-E5 for claimed hexes
            for (let i = 0; i < 6; i++) {
                // Use consistent E0-E5 labeling as per guide
                const edgeLabel = `E${i}`; 
                
                // Calculate midpoint of edge for label placement
                const corner1 = i;
                const corner2 = (i + 1) % 6;
                const angle1 = (Math.PI / 3) * corner1;
                const angle2 = (Math.PI / 3) * corner2;
                const x1 = centerX + hexRadius * Math.cos(angle1);
                const y1 = centerY + hexRadius * Math.sin(angle1);
                const x2 = centerX + hexRadius * Math.cos(angle2);
                const y2 = centerY + hexRadius * Math.sin(angle2);
                
                // Validate coordinates before using them
                if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
                    console.error(`NaN in claimed hex border: hexId=${hexId}, edge=${i}`);
                    continue; // Skip this edge
                }
                
                // Midpoint of edge
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;
                
                // Move label slightly toward center
                const labelX = centerX + (midX - centerX) * 0.7;
                const labelY = centerY + (midY - centerY) * 0.7;
                
                // Draw edge if exposed
                const isDrawn = exposedEdges[i];
                const renderState = isDrawn ? 1 : 0;
                
                if (isDrawn && !isNaN(x1) && !isNaN(y1) && !isNaN(x2) && !isNaN(y2)) {
                    // Claimed hexes: thick solid borders  
                    regionBorders += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#00FF41" stroke-width="3" opacity="0.9"/>`;
                }
                
                // No edge labels needed in production
            }
        }
    }
    
    // Generate thin, widely-spaced dashed borders for scanned hexes
    if (gameState.galaxy.hexGrid.scannedHexes && gameState.galaxy.hexGrid.scannedHexes.size > 0) {
        // Clean up invalid hex IDs
        const invalidHexes = [];
        for (const hexId of gameState.galaxy.hexGrid.scannedHexes) {
            if (!hexId || hexId.includes('undefined') || hexId.includes('NaN')) {
                console.warn(`Removing invalid scanned hex ID: ${hexId}`);
                invalidHexes.push(hexId);
            }
        }
        invalidHexes.forEach(id => gameState.galaxy.hexGrid.scannedHexes.delete(id));
        
        for (const hexId of gameState.galaxy.hexGrid.scannedHexes) {
            const {x: hx, y: hy, z: hz} = parseCubeId(hexId);
            
            // Skip if parsing failed
            if (isNaN(hx) || isNaN(hy) || isNaN(hz)) {
                console.warn(`Skipping invalid scanned hex: ${hexId}`);
                continue;
            }
            const exposedEdges = getExposedEdgesCube(hx, hy, hz, gameState.galaxy.hexGrid.scannedHexes);
            const center = cubeToPixel(hx, hy, hz, hexWidth, hexHeight);
            const centerX = center.x;
            const centerY = center.y;
            
            // Draw thin dashed borders for scanned hexes
            for (let i = 0; i < 6; i++) {
                if (exposedEdges[i]) {
                    const corner1 = i;
                    const corner2 = (i + 1) % 6;
                    const angle1 = (Math.PI / 3) * corner1;
                    const angle2 = (Math.PI / 3) * corner2;
                    const x1 = centerX + hexRadius * Math.cos(angle1);
                    const y1 = centerY + hexRadius * Math.sin(angle1);
                    const x2 = centerX + hexRadius * Math.cos(angle2);
                    const y2 = centerY + hexRadius * Math.sin(angle2);
                    
                    // Validate coordinates
                    if (!isNaN(x1) && !isNaN(y1) && !isNaN(x2) && !isNaN(y2)) {
                        // Very thin, widely spaced dashes
                        regionBorders += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
                                              stroke="#00FF41" stroke-width="0.8" 
                                              stroke-dasharray="2,10" opacity="0.5"/>`;
                    }
                }
            }
        }
    }
    
    regionBorders += '</g>';
    
    // Second pass: render all interactive hex elements on top
    let interactiveElements = '<g id="hex-interactive">';
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * hexWidth * 0.75;
            const y = row * hexHeight + (col % 2) * hexHeight * 0.5;
            
            const hexPath = createHexPath(x + hexRadius, y + hexHeight/2, hexRadius);
            
            interactiveElements += `<path d="${hexPath}" 
                                   fill="transparent" 
                                   stroke="transparent" 
                                   stroke-width="1" 
                                   pointer-events="all"
                                   class="hex-cell" 
                                   data-hex-col="${col}" 
                                   data-hex-row="${row}"
                                   data-hex-id="${col},${row}" />`;
        }
    }
    interactiveElements += '</g>';
    
    grid += backgroundElements + regionBorders + interactiveElements;
    grid += '</g>';
    return grid;
}

// Create hex path string
function createHexPath(centerX, centerY, radius) {
    const points = [];
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        points.push(`${x},${y}`);
    }
    
    return `M ${points[0]} L ${points.slice(1).join(' L ')} Z`;
}

// Resource Site Graphics Functions
function createAsteroidFieldGraphics(centerX, centerY, hexRadius) {
    let asteroids = '';
    const numAsteroids = 12;
    
    // Create randomly placed asteroids within the hex
    for (let i = 0; i < numAsteroids; i++) {
        const angle = (Math.PI * 2 * i) / numAsteroids + Math.random() * 0.5;
        const distance = hexRadius * (0.2 + Math.random() * 0.6);
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        const size = 3 + Math.random() * 5;
        
        // Create irregular asteroid shape
        const points = [];
        const numPoints = 5 + Math.floor(Math.random() * 3);
        for (let j = 0; j < numPoints; j++) {
            const pointAngle = (Math.PI * 2 * j) / numPoints;
            const pointRadius = size * (0.7 + Math.random() * 0.3);
            const px = x + Math.cos(pointAngle) * pointRadius;
            const py = y + Math.sin(pointAngle) * pointRadius;
            points.push(`${px},${py}`);
        }
        
        asteroids += `<polygon points="${points.join(' ')}" 
                              fill="#666666" 
                              stroke="#999999" 
                              stroke-width="0.5" 
                              opacity="0.6"/>`;
    }
    
    // Add some smaller debris
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = hexRadius * (0.1 + Math.random() * 0.8);
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        const size = 1 + Math.random() * 2;
        
        asteroids += `<circle cx="${x}" cy="${y}" r="${size}" 
                             fill="#555555" 
                             opacity="0.4"/>`;
    }
    
    // Add resource indicator icon (mining symbol)
    asteroids += `<g transform="translate(${centerX}, ${centerY})">
                    <circle cx="0" cy="0" r="12" fill="#000000" opacity="0.7"/>
                    <text x="0" y="0" text-anchor="middle" dominant-baseline="middle" 
                          fill="#FFD700" font-size="16" font-weight="bold">⛏</text>
                  </g>`;
    
    return asteroids;
}

function createCometTrailGraphics(centerX, centerY, hexRadius) {
    let comet = '';
    
    // Create comet nucleus
    const nucleusX = centerX - hexRadius * 0.3;
    const nucleusY = centerY;
    
    comet += `<circle cx="${nucleusX}" cy="${nucleusY}" r="8" 
                     fill="#AAEEFF" 
                     opacity="0.8">
                <animate attributeName="opacity" 
                        values="0.6;0.9;0.6" 
                        dur="3s" 
                        repeatCount="indefinite"/>
              </circle>`;
    
    // Create comet tail (gradient trail)
    const tailPoints = [];
    const tailLength = 15;
    for (let i = 0; i < tailLength; i++) {
        const progress = i / tailLength;
        const x = nucleusX + (hexRadius * 0.6 * progress);
        const y = nucleusY + Math.sin(progress * Math.PI * 2) * 10;
        const spread = progress * 20;
        
        comet += `<ellipse cx="${x}" cy="${y}" 
                          rx="${15 * (1 - progress)}" 
                          ry="${spread}" 
                          fill="#66CCFF" 
                          opacity="${0.3 * (1 - progress)}"/>`;
    }
    
    // Add ice particles
    for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = hexRadius * (0.2 + Math.random() * 0.7);
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        
        comet += `<circle cx="${x}" cy="${y}" r="${1 + Math.random()}" 
                         fill="#CCFFFF" 
                         opacity="${0.2 + Math.random() * 0.3}">
                    <animate attributeName="opacity" 
                            values="${0.2 + Math.random() * 0.3};${0.5 + Math.random() * 0.3};${0.2 + Math.random() * 0.3}" 
                            dur="${2 + Math.random() * 2}s" 
                            repeatCount="indefinite"/>
                  </circle>`;
    }
    
    // Add resource indicator icon
    comet += `<g transform="translate(${centerX}, ${centerY + hexRadius * 0.3})">
                <circle cx="0" cy="0" r="12" fill="#000000" opacity="0.7"/>
                <text x="0" y="0" text-anchor="middle" dominant-baseline="middle" 
                      fill="#66CCFF" font-size="16" font-weight="bold">❄</text>
              </g>`;
    
    return comet;
}

function createDerelictShipGraphics(centerX, centerY, hexRadius) {
    let derelict = '';
    
    // Create main ship hull (broken)
    const shipX = centerX;
    const shipY = centerY;
    
    // Hull pieces
    derelict += `<g transform="translate(${shipX}, ${shipY}) rotate(${25})">
                   <!-- Main hull -->
                   <polygon points="-20,-5 -10,-10 15,-8 20,-3 15,3 10,8 -10,10 -20,5" 
                           fill="#444444" 
                           stroke="#666666" 
                           stroke-width="1" 
                           opacity="0.7"/>
                   <!-- Damage marks -->
                   <line x1="-5" y1="-8" x2="5" y2="8" stroke="#FF6600" stroke-width="2" opacity="0.3"/>
                   <line x1="10" y1="-6" x2="15" y2="6" stroke="#FF6600" stroke-width="2" opacity="0.3"/>
                 </g>`;
    
    // Debris field
    for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 15 + Math.random() * (hexRadius * 0.5);
        const x = shipX + Math.cos(angle) * distance;
        const y = shipY + Math.sin(angle) * distance;
        const size = 2 + Math.random() * 4;
        const rotation = Math.random() * 360;
        
        derelict += `<rect x="${x - size/2}" y="${y - size/2}" 
                          width="${size}" height="${size}" 
                          transform="rotate(${rotation} ${x} ${y})"
                          fill="#555555" 
                          opacity="0.5"/>`;
    }
    
    // Emergency beacon (flashing)
    derelict += `<circle cx="${shipX + 10}" cy="${shipY - 5}" r="3" 
                        fill="#FF0000" 
                        opacity="0">
                   <animate attributeName="opacity" 
                           values="0;1;0" 
                           dur="2s" 
                           repeatCount="indefinite"/>
                 </circle>`;
    
    // Add resource indicator icon (salvage)
    derelict += `<g transform="translate(${centerX}, ${centerY + hexRadius * 0.35})">
                   <circle cx="0" cy="0" r="12" fill="#000000" opacity="0.7"/>
                   <text x="0" y="0" text-anchor="middle" dominant-baseline="middle" 
                         fill="#FF9900" font-size="16" font-weight="bold">⚙</text>
                 </g>`;
    
    return derelict;
}

// Generic resource graphics for unknown types
function createGenericResourceGraphics(centerX, centerY, hexRadius) {
    return `<circle cx="${centerX}" cy="${centerY}" r="8" 
                   fill="#00FF88" opacity="0.6" stroke="#00FFAA" stroke-width="2"/>
           <text x="${centerX}" y="${centerY + 4}" text-anchor="middle" 
                 fill="#FFFFFF" font-size="12" font-weight="bold">⚡</text>`;
}

// Stub functions for missing resource graphics (to be implemented later)
function createRogueTraderGraphics(centerX, centerY, hexRadius) {
    return `<circle cx="${centerX}" cy="${centerY}" r="6" fill="#FF6600" opacity="0.8"/>
           <text x="${centerX}" y="${centerY + 3}" text-anchor="middle" 
                 fill="#FFFFFF" font-size="10">🚀</text>`;
}

function createGasHarvestingGraphics(centerX, centerY, hexRadius) {
    return `<circle cx="${centerX}" cy="${centerY}" r="12" fill="#9966FF" opacity="0.4" stroke="#BB88FF" stroke-width="1"/>
           <circle cx="${centerX}" cy="${centerY}" r="8" fill="#BB88FF" opacity="0.3"/>
           <text x="${centerX}" y="${centerY + 3}" text-anchor="middle" 
                 fill="#FFFFFF" font-size="10">⚗</text>`;
}

function createAncientRuinsGraphics(centerX, centerY, hexRadius) {
    return `<rect x="${centerX - 8}" y="${centerY - 6}" width="16" height="12" 
                  fill="#8B4513" opacity="0.8" stroke="#D2691E" stroke-width="1"/>
           <text x="${centerX}" y="${centerY + 3}" text-anchor="middle" 
                 fill="#FFD700" font-size="10">🏛</text>`;
}

function createNebulaPocketGraphics(centerX, centerY, hexRadius) {
    return `<circle cx="${centerX}" cy="${centerY}" r="15" fill="#FF66AA" opacity="0.3" stroke="#FF88CC" stroke-width="1"/>
           <circle cx="${centerX - 5}" cy="${centerY - 3}" r="6" fill="#FF88CC" opacity="0.4"/>
           <circle cx="${centerX + 4}" cy="${centerY + 2}" r="4" fill="#FFAADD" opacity="0.5"/>
           <text x="${centerX}" y="${centerY + 3}" text-anchor="middle" 
                 fill="#FFFFFF" font-size="10">☁</text>`;
}

function createPirateCacheGraphics(centerX, centerY, hexRadius) {
    return `<rect x="${centerX - 6}" y="${centerY - 4}" width="12" height="8" 
                  fill="#8B0000" opacity="0.8" stroke="#FF0000" stroke-width="1"/>
           <text x="${centerX}" y="${centerY + 2}" text-anchor="middle" 
                 fill="#FFFF00" font-size="8">💰</text>`;
}

function createResearchProbeGraphics(centerX, centerY, hexRadius) {
    return `<circle cx="${centerX}" cy="${centerY}" r="5" fill="#00AAFF" stroke="#0088DD" stroke-width="2"/>
           <rect x="${centerX - 1}" y="${centerY - 8}" width="2" height="6" fill="#0088DD"/>
           <text x="${centerX}" y="${centerY + 3}" text-anchor="middle" 
                 fill="#FFFFFF" font-size="8">🛰</text>`;
}

function createStellarPhenomenaGraphics(centerX, centerY, hexRadius) {
    return `<circle cx="${centerX}" cy="${centerY}" r="10" fill="#FFAA00" opacity="0.6">
               <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite"/>
           </circle>
           <circle cx="${centerX}" cy="${centerY}" r="6" fill="#FFDD00" opacity="0.8"/>
           <text x="${centerX}" y="${centerY + 3}" text-anchor="middle" 
                 fill="#FFFFFF" font-size="10">⭐</text>`;
}

// Generate all systems at game initialization
function generateAllSystemsAtInit() {
    // Only generate if we don't have any generated systems yet
    if (gameState.galaxy.generatedSystems.size > 0) {
        console.log(`Systems already generated: ${gameState.galaxy.generatedSystems.size} systems exist`);
        return;
    }
    
    generateSystemsInternal();
}

// Generate all resources at game initialization
function generateAllResourcesAtInit() {
    // Only generate if we don't have any resources yet
    if (gameState.galaxy.resources.hexResources.size > 0) {
        console.log(`Resources already generated: ${gameState.galaxy.resources.hexResources.size} resource sites exist`);
        return;
    }
    
    const resources = generateResourcesWithSpacing();
    console.log(`🌟 Generated ${resources.length} resource sites at initialization`);
}

// Dev tool: Force regenerate all systems
function regenerateAllSystems() {
    // Clear existing generated systems (but keep known systems)
    gameState.galaxy.generatedSystems.clear();
    console.log('Cleared all procedurally generated systems');
    
    // Generate new systems
    generateSystemsInternal();
    
    // Count Nexus stations for mobile debugging
    const nexusCount = Array.from(gameState.galaxy.generatedSystems.values())
        .filter(sys => sys.type === 'nexus').length;
    
    // Update the map to show changes
    updateScreen('map');
    toggleDevMenu();
    
    alert(`Generated ${gameState.galaxy.generatedSystems.size} systems. Nexus stations: ${nexusCount}`);
}

// Dev tool: Regenerate all resources with better distribution
function regenerateAllResources() {
    // Clear existing resources
    gameState.galaxy.resources.hexResources.clear();
    console.log('Cleared all resources');
    
    // Generate resources with better spacing
    const resources = generateResourcesWithSpacing();
    
    console.log(`🌟 Generated ${resources.length} resource sites across the galaxy`);
    alert(`Generated ${resources.length} resource sites!`);
    toggleDevMenu();
}

// Generate resources with Poisson Disc Sampling for better distribution
function generateResourcesWithSpacing() {
    const cols = gameState.galaxy.hexGrid.cols;
    const rows = gameState.galaxy.hexGrid.rows;
    
    // Resources can be closer together than systems
    const MIN_DISTANCE = 4; // Minimum distance between resource sites
    const MAX_ATTEMPTS = 30; 
    const TARGET_RESOURCES = 180; // ~5% of map (180/3600)
    
    const resources = [];
    const resourcePositions = new Set();
    const systemPositions = new Set();
    
    // Get all system positions to avoid placing resources on systems
    for (const sys of Object.values(gameState.galaxy.knownSystems)) {
        systemPositions.add(cubeId(sys.x, sys.y, sys.z));
    }
    for (const [id, sys] of gameState.galaxy.generatedSystems) {
        systemPositions.add(cubeId(sys.x, sys.y, sys.z));
    }
    
    // Helper function to check if a position is valid for resources
    const isValidResourcePosition = (x, y, z) => {
        const hexId = cubeId(x, y, z);
        
        // Don't place on systems
        if (systemPositions.has(hexId)) return false;
        
        // Check distance to other resources (allow closer clustering)
        for (const existingPos of resourcePositions) {
            const existing = parseCubeId(existingPos);
            const distance = cubeDistance(x, y, z, existing.x, existing.y, existing.z);
            if (distance < MIN_DISTANCE) return false;
        }
        
        return true;
    };
    
    // Strategy: Create clusters of resources
    // Divide map into larger regions for resource clusters
    const gridSize = Math.ceil(Math.sqrt(TARGET_RESOURCES / 3)); // Fewer, larger regions
    const cellSize = Math.floor(Math.min(cols, rows) / gridSize);
    
    for (let gx = 0; gx < gridSize; gx++) {
        for (let gy = 0; gy < gridSize; gy++) {
            // Each region can have 2-4 resource sites (creating natural clusters)
            const sitesInRegion = 2 + Math.floor(Math.random() * 3);
            
            for (let site = 0; site < sitesInRegion; site++) {
                // Try to place a resource in this region
                let placed = false;
                
                for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
                    const col = (gx * cellSize) + Math.floor(Math.random() * cellSize);
                    const row = (gy * cellSize) + Math.floor(Math.random() * cellSize);
                    
                    // Ensure within bounds
                    if (col >= 0 && col < cols && row >= 0 && row < rows) {
                        const {x, y, z} = offsetToCube(col, row);
                        
                        if (isValidResourcePosition(x, y, z)) {
                            const hexId = cubeId(x, y, z);
                            generateResourcesForHexForced(hexId);
                            resourcePositions.add(hexId);
                            resources.push({x, y, z, hexId});
                            placed = true;
                            break;
                        }
                    }
                }
                
                // Stop if we've reached our target
                if (resources.length >= TARGET_RESOURCES) break;
            }
            if (resources.length >= TARGET_RESOURCES) break;
        }
        if (resources.length >= TARGET_RESOURCES) break;
    }
    
    // If we didn't reach target, add more with less strict spacing
    if (resources.length < TARGET_RESOURCES) {
        const additionalAttempts = (TARGET_RESOURCES - resources.length) * 100;
        const RELAXED_MIN_DISTANCE = 3; // Allow slightly closer for fill-in
        
        for (let i = 0; i < additionalAttempts && resources.length < TARGET_RESOURCES; i++) {
            const col = Math.floor(Math.random() * cols);
            const row = Math.floor(Math.random() * rows);
            const {x, y, z} = offsetToCube(col, row);
            const hexId = cubeId(x, y, z);
            
            // Check with relaxed distance
            if (!systemPositions.has(hexId)) {
                let tooClose = false;
                for (const existingPos of resourcePositions) {
                    const existing = parseCubeId(existingPos);
                    const distance = cubeDistance(x, y, z, existing.x, existing.y, existing.z);
                    if (distance < RELAXED_MIN_DISTANCE) {
                        tooClose = true;
                        break;
                    }
                }
                
                if (!tooClose) {
                    generateResourcesForHexForced(hexId);
                    resourcePositions.add(hexId);
                    resources.push({x, y, z, hexId});
                }
            }
        }
    }
    
    // Log distribution analysis
    analyzeResourceDistribution(resources);
    
    return resources;
}

// Analyze resource distribution
function analyzeResourceDistribution(resources) {
    if (resources.length < 2) return;
    
    // Find nearest neighbor distances
    const nearestNeighbors = [];
    for (let i = 0; i < resources.length; i++) {
        let minDist = Infinity;
        for (let j = 0; j < resources.length; j++) {
            if (i !== j) {
                const dist = cubeDistance(
                    resources[i].x, resources[i].y, resources[i].z,
                    resources[j].x, resources[j].y, resources[j].z
                );
                minDist = Math.min(minDist, dist);
            }
        }
        nearestNeighbors.push(minDist);
    }
    
    const avgNearestNeighbor = nearestNeighbors.reduce((a, b) => a + b, 0) / nearestNeighbors.length;
    const minNearest = Math.min(...nearestNeighbors);
    const maxNearest = Math.max(...nearestNeighbors);
    
    console.log('=== Resource Distribution Analysis ===');
    console.log(`Total Resource Sites: ${resources.length}`);
    console.log(`Coverage: ${(resources.length / 3600 * 100).toFixed(2)}% of map`);
    console.log(`Avg Nearest Neighbor: ${avgNearestNeighbor.toFixed(2)} hexes`);
    console.log(`Min Nearest: ${minNearest} hexes`);
    console.log(`Max Nearest: ${maxNearest} hexes`);
    
    // Count clusters (resources within 6 hexes of each other)
    let clusterCount = 0;
    const visited = new Set();
    
    for (let i = 0; i < resources.length; i++) {
        if (visited.has(i)) continue;
        
        const cluster = [i];
        visited.add(i);
        
        for (let j = 0; j < resources.length; j++) {
            if (i !== j && !visited.has(j)) {
                const dist = cubeDistance(
                    resources[i].x, resources[i].y, resources[i].z,
                    resources[j].x, resources[j].y, resources[j].z
                );
                if (dist <= 6) {
                    cluster.push(j);
                    visited.add(j);
                }
            }
        }
        
        if (cluster.length > 1) clusterCount++;
    }
    
    console.log(`Resource Clusters: ${clusterCount} (groups within 6 hexes)`);
}

// Dev tool: Export save data
function exportSaveData() {
    const saveData = localStorage.getItem('spaceGuildSave');
    if (saveData) {
        const blob = new Blob([saveData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `space_guild_save_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        alert('Save data exported!');
    } else {
        alert('No save data found!');
    }
    toggleDevMenu();
}

// Dev tool: Import save data
function importSaveData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                // Validate it's valid JSON
                JSON.parse(event.target.result);
                localStorage.setItem('spaceGuildSave', event.target.result);
                alert('Save data imported! Reloading...');
                location.reload();
            } catch (error) {
                alert('Invalid save file!');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Dev tool: Show debug info
function showDebugInfo() {
    const info = {
        'Ship Position': `${gameState.player.hexLocation.x}, ${gameState.player.hexLocation.y}, ${gameState.player.hexLocation.z}`,
        'Generated Systems': gameState.galaxy.generatedSystems.size,
        'Visited Hexes': gameState.galaxy.hexGrid.visitedHexes.size,
        'Scanned Hexes': gameState.galaxy.hexGrid.scannedHexes.size,
        'Claimed Hexes': gameState.galaxy.hexGrid.claimedHexes.size,
        'Resources Found': gameState.galaxy.resources.hexResources.size,
        'Credits': gameState.player.credits,
        'Cargo Used': `${gameState.player.cargo.usedSpace}/${gameState.player.cargo.capacity}`
    };
    
    console.table(info);
    
    // Also analyze system spacing
    analyzeSystemSpacing();
    
    alert('Debug info logged to console!');
    toggleDevMenu();
}

// Analyze system distribution and spacing
function analyzeSystemSpacing() {
    const allSystems = [];
    
    // Collect all systems
    for (const sys of Object.values(gameState.galaxy.knownSystems)) {
        allSystems.push(sys);
    }
    for (const [id, sys] of gameState.galaxy.generatedSystems) {
        allSystems.push(sys);
    }
    
    if (allSystems.length < 2) {
        console.log('Not enough systems to analyze spacing');
        return;
    }
    
    // Calculate distances between all system pairs
    const distances = [];
    let minDistance = Infinity;
    let maxDistance = 0;
    
    for (let i = 0; i < allSystems.length; i++) {
        for (let j = i + 1; j < allSystems.length; j++) {
            const dist = cubeDistance(
                allSystems[i].x, allSystems[i].y, allSystems[i].z,
                allSystems[j].x, allSystems[j].y, allSystems[j].z
            );
            distances.push(dist);
            minDistance = Math.min(minDistance, dist);
            maxDistance = Math.max(maxDistance, dist);
        }
    }
    
    // Calculate average and median
    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    distances.sort((a, b) => a - b);
    const medianDistance = distances[Math.floor(distances.length / 2)];
    
    // Find nearest neighbor for each system
    const nearestNeighbors = [];
    for (let i = 0; i < allSystems.length; i++) {
        let minDist = Infinity;
        for (let j = 0; j < allSystems.length; j++) {
            if (i !== j) {
                const dist = cubeDistance(
                    allSystems[i].x, allSystems[i].y, allSystems[i].z,
                    allSystems[j].x, allSystems[j].y, allSystems[j].z
                );
                minDist = Math.min(minDist, dist);
            }
        }
        nearestNeighbors.push(minDist);
    }
    
    const avgNearestNeighbor = nearestNeighbors.reduce((a, b) => a + b, 0) / nearestNeighbors.length;
    
    console.log('=== System Spacing Analysis ===');
    console.log(`Total Systems: ${allSystems.length} (${Object.keys(gameState.galaxy.knownSystems).length} known + ${gameState.galaxy.generatedSystems.size} generated)`);
    console.log(`Coverage: ${(allSystems.length / 3600 * 100).toFixed(2)}% of map`);
    console.log(`Min Distance: ${minDistance} hexes`);
    console.log(`Max Distance: ${maxDistance} hexes`);
    console.log(`Average Distance: ${avgDistance.toFixed(2)} hexes`);
    console.log(`Median Distance: ${medianDistance} hexes`);
    console.log(`Avg Nearest Neighbor: ${avgNearestNeighbor.toFixed(2)} hexes`);
    console.log(`Ideal Spacing (uniform): ${Math.sqrt(3600 / allSystems.length).toFixed(2)} hexes`);
    
    // Check for clustering
    const tooClose = nearestNeighbors.filter(d => d < 5).length;
    if (tooClose > 0) {
        console.warn(`⚠️ ${tooClose} systems have neighbors closer than 5 hexes`);
    }
    
    // Check for isolation
    const tooFar = nearestNeighbors.filter(d => d > 15).length;
    if (tooFar > 0) {
        console.warn(`⚠️ ${tooFar} systems have no neighbors within 15 hexes`);
    }
}

// Dev tool: Toggle FPS counter
function toggleFPS() {
    // This would need implementation of an FPS counter
    alert('FPS counter feature coming soon!');
    toggleDevMenu();
}

// Internal function to generate systems with better spacing
function generateSystemsInternal() {
    const cols = gameState.galaxy.hexGrid.cols;
    const rows = gameState.galaxy.hexGrid.rows;
    
    // Use Poisson Disc Sampling for natural but evenly spaced distribution
    const systems = generateSystemsWithPoissonDisc(cols, rows);
    
    // Count Nexus stations for debugging
    const nexusCount = systems.filter(sys => sys.type === 'nexus').length;
    
    console.log(`🌌 Generated ${systems.length} systems across the galaxy`);
    console.log(`🔗 Nexus stations: ${nexusCount}`);
    saveGameState();
}

// Generate systems using Poisson Disc Sampling for even distribution
function generateSystemsWithPoissonDisc(cols, rows) {
    const MIN_DISTANCE = 7; // Minimum distance between systems in hex cells
    const MAX_ATTEMPTS = 30; // Attempts to place each system
    const TARGET_SYSTEMS = 72; // Target number of systems
    
    const systems = [];
    const systemPositions = new Set();
    
    // Get all known system positions first
    const knownSystemPositions = new Set();
    for (const sys of Object.values(gameState.galaxy.knownSystems)) {
        knownSystemPositions.add(cubeId(sys.x, sys.y, sys.z));
        systemPositions.add(cubeId(sys.x, sys.y, sys.z));
    }
    
    // Helper function to check if a position is valid
    const isValidPosition = (x, y, z) => {
        const hexId = cubeId(x, y, z);
        
        // Don't place on known systems
        if (knownSystemPositions.has(hexId)) return false;
        
        // Check distance to all existing systems
        for (const existingPos of systemPositions) {
            const existing = parseCubeId(existingPos);
            const distance = cubeDistance(x, y, z, existing.x, existing.y, existing.z);
            if (distance < MIN_DISTANCE) return false;
        }
        
        return true;
    };
    
    // Create initial seed points spread across the map
    const gridSize = Math.ceil(Math.sqrt(TARGET_SYSTEMS));
    const cellSize = Math.floor(Math.min(cols, rows) / gridSize);
    
    for (let gx = 0; gx < gridSize; gx++) {
        for (let gy = 0; gy < gridSize; gy++) {
            // Add some randomness to avoid perfect grid
            const baseCol = gx * cellSize + Math.floor(cellSize / 2);
            const baseRow = gy * cellSize + Math.floor(cellSize / 2);
            
            // Try to place a system in this grid cell
            let placed = false;
            for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
                const jitterCol = baseCol + Math.floor((Math.random() - 0.5) * cellSize);
                const jitterRow = baseRow + Math.floor((Math.random() - 0.5) * cellSize);
                
                // Ensure within bounds
                if (jitterCol >= 0 && jitterCol < cols && jitterRow >= 0 && jitterRow < rows) {
                    const {x, y, z} = offsetToCube(jitterCol, jitterRow);
                    
                    if (isValidPosition(x, y, z)) {
                        const systemData = createRandomSystem(x, y, z);
                        const systemId = `sys_${x}_${y}_${z}`;
                        gameState.galaxy.generatedSystems.set(systemId, systemData);
                        systemPositions.add(cubeId(x, y, z));
                        systems.push(systemData);
                        placed = true;
                        break;
                    }
                }
            }
            
            // Stop if we've reached our target
            if (systems.length >= TARGET_SYSTEMS) break;
        }
        if (systems.length >= TARGET_SYSTEMS) break;
    }
    
    // If we didn't reach target, try to fill in gaps
    if (systems.length < TARGET_SYSTEMS) {
        const additionalAttempts = (TARGET_SYSTEMS - systems.length) * 50;
        
        for (let i = 0; i < additionalAttempts && systems.length < TARGET_SYSTEMS; i++) {
            const col = Math.floor(Math.random() * cols);
            const row = Math.floor(Math.random() * rows);
            const {x, y, z} = offsetToCube(col, row);
            
            if (isValidPosition(x, y, z)) {
                const systemData = createRandomSystem(x, y, z);
                const systemId = `sys_${x}_${y}_${z}`;
                gameState.galaxy.generatedSystems.set(systemId, systemData);
                systemPositions.add(cubeId(x, y, z));
                systems.push(systemData);
            }
        }
    }
    
    return systems;
}

function createRandomSystem(x, y, z) {
    const systemTypes = [
        { type: 'industrial', weight: 25, names: ['Industrial Complex', 'Manufacturing Hub', 'Production Center', 'Factory Station'] },
        { type: 'mining', weight: 20, names: ['Mining Station', 'Ore Processing', 'Extraction Facility', 'Mineral Works'] },
        { type: 'frontier', weight: 15, names: ['Frontier Outpost', 'Border Station', 'Remote Colony', 'Edge Settlement'] },
        { type: 'research', weight: 10, names: ['Research Station', 'Science Outpost', 'Lab Complex', 'Observatory'] },
        { type: 'spacestation', weight: 12, names: ['Space Station', 'Orbital Station', 'Trade Station', 'Starport'] },
        { type: 'pirate', weight: 8, names: ['Pirate Haven', 'Smuggler Base', 'Rogue Station', 'Outlaw Port'] },
        { type: 'nexus', weight: 5, names: ['Nexus Station', 'Trade Hub', 'Commerce Gateway', 'Exchange Center'] },
        { type: 'blackhole', weight: 2, names: ['Void Rift', 'Dark Anomaly', 'Singularity', 'Event Horizon'] }
    ];
    
    // Weighted random selection
    const totalWeight = systemTypes.reduce((sum, type) => sum + type.weight, 0);
    let roll = Math.random() * totalWeight;
    
    let selectedType = systemTypes[0];
    for (const type of systemTypes) {
        roll -= type.weight;
        if (roll <= 0) {
            selectedType = type;
            break;
        }
    }
    
    // Generate system name
    const baseName = selectedType.names[Math.floor(Math.random() * selectedType.names.length)];
    const systemNumber = Math.floor(Math.random() * 999) + 1;
    const systemName = `${baseName} ${systemNumber.toString().padStart(3, '0')}`;
    
    return {
        x, y, z,
        type: selectedType.type,
        name: systemName,
        discovered: new Date().toISOString()
    };
}

// Generate discovered systems
function generateDiscoveredSystems(hexWidth, hexHeight) {
    let systems = '<g id="discovered-systems" pointer-events="none">';
    
    let systemsRendered = 0;
    
    // Generate all systems that have been discovered
    const discoveredSystems = getDiscoveredSystems();
    
    for (const [systemId, systemData] of discoveredSystems) {
        const center = cubeToPixel(systemData.x, systemData.y, systemData.z, hexWidth, hexHeight);
        
        // Only show systems in visited or claimed hexes
        const hexId = cubeId(systemData.x, systemData.y, systemData.z);
        const isDiscovered = gameState.galaxy.hexGrid.visitedHexes.has(hexId) || 
                            gameState.galaxy.hexGrid.claimedHexes.has(hexId);
        
        if (isDiscovered) {
            // Simply render all discovered systems without viewport culling
            systems += createSystemGraphics(center.x, center.y, systemData);
            systemsRendered++;
        }
    }
    
    // Debug info
    const totalDiscovered = discoveredSystems.size;
    if (totalDiscovered > 0) {
        console.log(`Systems: ${totalDiscovered} total discovered, ${systemsRendered} rendered in visited/claimed hexes`);
    }
    
    systems += '</g>';
    return systems;
}

// Viewport culling removed - SVG handles rendering optimization

// Get all systems that have been discovered (either known or generated)
function getDiscoveredSystems() {
    const systems = new Map();
    
    // Add known systems first
    for (const [id, data] of Object.entries(gameState.galaxy.knownSystems)) {
        systems.set(id, data);
    }
    
    // Add generated systems
    if (gameState.galaxy.generatedSystems) {
        for (const [id, data] of gameState.galaxy.generatedSystems) {
            systems.set(id, data);
        }
    }
    
    return systems;
}

// Create appropriate graphics based on system type
function createSystemGraphics(x, y, systemData) {
    switch (systemData.type) {
        case 'homeworld':
            return createHomeworldSystem(x, y, systemData.name, '#FFAA00');
        case 'outpost':
            return createOutpostSystem(x, y, systemData.name, '#FF4400');
        case 'hub':
        case 'research':
            return createResearchStation(x, y, systemData.name, '#00AAFF');
        case 'spacestation':
        case 'station':
            return createSpaceStationSystem(x, y, systemData.name);
        case 'blackhole':
            return createBlackHoleSystem(x, y, systemData.name, '#440044');
        case 'industrial':
            return createIndustrialSystem(x, y, systemData.name, '#FFAA00');
        case 'mining':
            return createMiningSystem(x, y, systemData.name, '#CC6600');
        case 'frontier':
            return createFrontierSystem(x, y, systemData.name, '#00CC66');
        case 'pirate':
            return createPirateSystem(x, y, systemData.name, '#CC0000');
        case 'nexus':
            return createNexusStation(x, y, systemData.name, '#00DDFF');
        default:
            return createGenericSystem(x, y, systemData.name, '#FFFFFF');
    }
}

// Space Station — uses raster asset for the station icon
function createSpaceStationSystem(x, y, name) {
    const size = 108; // px (72 * 1.5)
    const half = size / 2;
    const href = 'assets/space_station.PNG?v=20250907a';
    // Group is non-interactive (parent systems group already has pointer-events none)
    return `<g class="solar-system spacestation" data-system="${name}">
              <image href="${href}" x="${x - half}" y="${y - half}" width="${size}" height="${size}" opacity="0.95" />
            </g>`;
}

// Calculate the center point of a hex cell
function getHexCenter(col, row, hexWidth, hexHeight) {
    const hexRadius = hexWidth / 2;
    const x = col * hexWidth * 0.75 + hexRadius;
    const y = row * hexHeight + (col % 2) * hexHeight * 0.5 + hexHeight/2;
    return { x, y };
}

// Cube-native: convert cube coords directly to pixel center (matches current layout)
function cubeToPixel(x, y, z, hexWidth, hexHeight) {
    // Current layout is pointy-topped with even-q style staggering
    const col = x;
    const row = z + Math.floor(x / 2);
    const hexRadius = hexWidth / 2;
    const px = col * hexWidth * 0.75 + hexRadius;
    const py = row * hexHeight + (col % 2) * hexHeight * 0.5 + hexHeight/2;
    return { x: px, y: py };
}

// Create a solar system visual
// Sol System - Major homeworld with bustling activity
function createHomeworldSystem(x, y, name, color) {
    let system = `<g class="solar-system homeworld" data-system="${name}">`;
    
    // Large, bright central star with corona effect
    system += `<circle cx="${x}" cy="${y}" r="6" fill="${color}" opacity="1.0">
                 <animate attributeName="r" values="6;8;6" dur="3s" repeatCount="indefinite" />
               </circle>`;
    system += `<circle cx="${x}" cy="${y}" r="10" fill="${color}" opacity="0.3">
                 <animate attributeName="r" values="10;14;10" dur="3s" repeatCount="indefinite" />
               </circle>`;
    system += `<circle cx="${x}" cy="${y}" r="16" fill="none" stroke="${color}" stroke-width="1" opacity="0.2" />`;
    
    // Inner populated worlds (Earth-like)
    const planets = [
        {radius: 18, size: 3, color: '#4A90E2', duration: 6}, // Earth-like
        {radius: 26, size: 2.5, color: '#E24A4A', duration: 10}, // Mars-like  
        {radius: 36, size: 4, color: '#E2B04A', duration: 16}, // Gas giant
        {radius: 48, size: 2, color: '#B0B0B0', duration: 22}  // Outer world
    ];
    
    planets.forEach((planet, i) => {
        const startAngle = i * 90;
        system += `<circle cx="${x}" cy="${y}" r="${planet.radius}" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.15" />`;
        system += `<g transform="rotate(${startAngle} ${x} ${y})">
                     <animateTransform attributeName="transform" type="rotate" 
                                       values="0 ${x} ${y};360 ${x} ${y}" 
                                       dur="${planet.duration}s" repeatCount="indefinite" additive="sum"/>
                     <circle cx="${x + planet.radius}" cy="${y}" r="${planet.size}" fill="${planet.color}" opacity="0.8">
                       <animate attributeName="opacity" values="0.6;1;0.6" dur="${planet.duration/3}s" repeatCount="indefinite"/>
                     </circle>
                   </g>`;
    });
    
    // Trade route indicators (small moving dots)
    for (let i = 0; i < 3; i++) {
        const orbitRadius = 52;
        const startAngle = i * 120;
        system += `<g transform="rotate(${startAngle} ${x} ${y})">
                     <animateTransform attributeName="transform" type="rotate" 
                                       values="0 ${x} ${y};360 ${x} ${y}" 
                                       dur="8s" repeatCount="indefinite" additive="sum"/>
                     <circle cx="${x + orbitRadius}" cy="${y}" r="1" fill="#00FF41" opacity="0.6">
                       <animate attributeName="opacity" values="0;0.8;0" dur="2s" repeatCount="indefinite"/>
                     </circle>
                   </g>`;
    }
    
    system += '</g>';
    return system;
}

// Mars Outpost - Frontier mining operation
function createOutpostSystem(x, y, name, color) {
    let system = `<g class="solar-system outpost" data-system="${name}">`;
    
    // Smaller, redder star
    system += `<circle cx="${x}" cy="${y}" r="5" fill="${color}" opacity="0.9">
                 <animate attributeName="opacity" values="0.7;1;0.7" dur="4s" repeatCount="indefinite" />
               </circle>`;
    system += `<circle cx="${x}" cy="${y}" r="8" fill="none" stroke="${color}" stroke-width="1" opacity="0.4" />`;
    
    // Main mining world
    system += `<circle cx="${x}" cy="${y}" r="22" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.2" />`;
    system += `<g>
                 <animateTransform attributeName="transform" type="rotate" 
                                   values="0 ${x} ${y};360 ${x} ${y}" 
                                   dur="12s" repeatCount="indefinite"/>
                 <circle cx="${x + 22}" cy="${y}" r="3" fill="#CC6600" opacity="0.8">
                   <animate attributeName="opacity" values="0.6;1;0.6" dur="4s" repeatCount="indefinite"/>
                 </circle>
               </g>`;
    
    // Asteroid mining belt
    for (let i = 0; i < 8; i++) {
        const angle = i * 45;
        const radius = 32 + (i % 2) * 4; // Varied orbit
        system += `<g transform="rotate(${angle} ${x} ${y})">
                     <animateTransform attributeName="transform" type="rotate" 
                                       values="0 ${x} ${y};360 ${x} ${y}" 
                                       dur="${18 + i}s" repeatCount="indefinite" additive="sum"/>
                     <rect x="${x + radius - 1}" y="${y - 1}" width="2" height="2" 
                           fill="#999999" opacity="0.4" transform="rotate(45 ${x + radius} ${y})"/>
                   </g>`;
    }
    
    // Mining ships (small moving triangles)
    for (let i = 0; i < 2; i++) {
        const startAngle = i * 180;
        system += `<g transform="rotate(${startAngle} ${x} ${y})">
                     <animateTransform attributeName="transform" type="rotate" 
                                       values="0 ${x} ${y};360 ${x} ${y}" 
                                       dur="15s" repeatCount="indefinite" additive="sum"/>
                     <polygon points="${x + 38},${y} ${x + 40},${y - 2} ${x + 40},${y + 2}" 
                              fill="#FFD700" opacity="0.6">
                       <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite"/>
                     </polygon>
                   </g>`;
    }
    
    system += '</g>';
    return system;
}

// Nexus Gateway - Advanced research station with exotic technology
function createResearchStation(x, y, name, color) {
    let system = `<g class="solar-system research" data-system="${name}">`;
    
    // Unique pulsar-like star with geometric patterns
    system += `<circle cx="${x}" cy="${y}" r="4" fill="${color}" opacity="1.0">
                 <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite" />
               </circle>`;
    
    // Hexagonal energy field
    const hexPoints = [];
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const hx = x + 12 * Math.cos(angle);
        const hy = y + 12 * Math.sin(angle);
        hexPoints.push(`${hx},${hy}`);
    }
    system += `<polygon points="${hexPoints.join(' ')}" 
                        fill="none" stroke="${color}" stroke-width="1" opacity="0.3">
                 <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite"/>
               </polygon>`;
    
    // Research platforms (geometric shapes)
    const platforms = [
        {radius: 20, shape: 'square', color: '#00DDAA', duration: 8},
        {radius: 30, shape: 'triangle', color: '#DD00AA', duration: 12}
    ];
    
    platforms.forEach((platform, i) => {
        const startAngle = i * 180;
        system += `<circle cx="${x}" cy="${y}" r="${platform.radius}" fill="none" stroke="${color}" stroke-width="0.3" opacity="0.1" />`;
        
        if (platform.shape === 'square') {
            system += `<g transform="rotate(${startAngle} ${x} ${y})">
                         <animateTransform attributeName="transform" type="rotate" 
                                           values="0 ${x} ${y};360 ${x} ${y}" 
                                           dur="${platform.duration}s" repeatCount="indefinite" additive="sum"/>
                         <rect x="${x + platform.radius - 2}" y="${y - 2}" width="4" height="4" 
                               fill="${platform.color}" opacity="0.7">
                           <animate attributeName="opacity" values="0.4;0.9;0.4" dur="${platform.duration/2}s" repeatCount="indefinite"/>
                         </rect>
                       </g>`;
        } else {
            system += `<g transform="rotate(${startAngle} ${x} ${y})">
                         <animateTransform attributeName="transform" type="rotate" 
                                           values="0 ${x} ${y};360 ${x} ${y}" 
                                           dur="${platform.duration}s" repeatCount="indefinite" additive="sum"/>
                         <polygon points="${x + platform.radius},${y - 2} ${x + platform.radius + 3},${y + 2} ${x + platform.radius - 3},${y + 2}" 
                                  fill="${platform.color}" opacity="0.7">
                           <animate attributeName="opacity" values="0.4;0.9;0.4" dur="${platform.duration/2}s" repeatCount="indefinite"/>
                         </polygon>
                       </g>`;
        }
    });
    
    // Quantum research beams (rotating lines)
    for (let i = 0; i < 4; i++) {
        const angle = i * 90;
        system += `<g transform="rotate(${angle} ${x} ${y})">
                     <animateTransform attributeName="transform" type="rotate" 
                                       values="0 ${x} ${y};90 ${x} ${y}" 
                                       dur="6s" repeatCount="indefinite" additive="sum"/>
                     <line x1="${x}" y1="${y}" x2="${x + 35}" y2="${y}" 
                           stroke="${color}" stroke-width="0.5" opacity="0">
                       <animate attributeName="opacity" values="0;0.6;0" dur="3s" repeatCount="indefinite"/>
                     </line>
                   </g>`;
    }
    
    system += '</g>';
    return system;
}

// The Void - Black hole system with sprite
function createBlackHoleSystem(x, y, name, color) {
    let system = `<g class="solar-system blackhole" data-system="${name}">`;
    
    // Black hole sprite from assets folder
    system += `<image href="assets/black_hole.png" x="${x - 25}" y="${y - 25}" width="50" height="50" opacity="0.9">
                 <animate attributeName="opacity" values="0.8;1;0.8" dur="4s" repeatCount="indefinite" />
               </image>`;
    
    // Accretion disk effect (rotating rings)
    for (let i = 0; i < 3; i++) {
        const radius = 30 + i * 8;
        const opacity = 0.3 - i * 0.1;
        const duration = 6 + i * 2;
        
        system += `<g>
                     <animateTransform attributeName="transform" type="rotate" 
                                       values="0 ${x} ${y};360 ${x} ${y}" 
                                       dur="${duration}s" repeatCount="indefinite"/>
                     <ellipse cx="${x}" cy="${y}" rx="${radius}" ry="${radius * 0.3}" 
                              fill="none" stroke="#FF6600" stroke-width="1" opacity="${opacity}">
                       <animate attributeName="opacity" values="${opacity};${opacity * 2};${opacity}" dur="${duration/2}s" repeatCount="indefinite"/>
                     </ellipse>
                   </g>`;
    }
    
    // Event horizon glow
    system += `<circle cx="${x}" cy="${y}" r="20" fill="none" stroke="#440044" stroke-width="2" opacity="0.4">
                 <animate attributeName="r" values="20;24;20" dur="3s" repeatCount="indefinite" />
                 <animate attributeName="opacity" values="0.2;0.6;0.2" dur="3s" repeatCount="indefinite" />
               </circle>`;
    
    // Gravitational lensing effect (distortion rings)
    system += `<circle cx="${x}" cy="${y}" r="35" fill="none" stroke="#FFFFFF" stroke-width="0.5" opacity="0.1">
                 <animate attributeName="opacity" values="0.05;0.15;0.05" dur="8s" repeatCount="indefinite" />
               </circle>`;
    
    // Matter being pulled in (small particles)
    for (let i = 0; i < 6; i++) {
        const angle = i * 60;
        const startRadius = 60;
        
        system += `<g transform="rotate(${angle} ${x} ${y})">
                     <circle cx="${x + startRadius}" cy="${y}" r="1" fill="#FFAA00" opacity="0.6">
                       <animateTransform attributeName="transform" type="translate" 
                                         values="0,0; ${-startRadius + 25},0" 
                                         dur="4s" repeatCount="indefinite"/>
                       <animate attributeName="opacity" values="0.6;0.8;0" dur="4s" repeatCount="indefinite"/>
                       <animate attributeName="r" values="1;0.5;0" dur="4s" repeatCount="indefinite"/>
                     </circle>
                   </g>`;
    }
    
    // Hawking radiation (subtle energy emissions)
    for (let i = 0; i < 4; i++) {
        const angle = i * 90;
        system += `<g transform="rotate(${angle} ${x} ${y})">
                     <animateTransform attributeName="transform" type="rotate" 
                                       values="0 ${x} ${y};360 ${x} ${y}" 
                                       dur="12s" repeatCount="indefinite" additive="sum"/>
                     <line x1="${x + 15}" y1="${y}" x2="${x + 45}" y2="${y}" 
                           stroke="#9900FF" stroke-width="0.5" opacity="0">
                       <animate attributeName="opacity" values="0;0.3;0" dur="6s" repeatCount="indefinite"/>
                     </line>
                   </g>`;
    }
    
    system += '</g>';
    return system;
}

// Industrial System - Manufacturing and production
function createIndustrialSystem(x, y, name, color) {
    let system = `<g class="solar-system industrial" data-system="${name}">`;
    
    // Central star
    system += `<circle cx="${x}" cy="${y}" r="6" fill="${color}" opacity="0.9">
                 <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
               </circle>`;
    
    // Factory platforms (geometric shapes)
    const platforms = [18, 28, 38];
    platforms.forEach((radius, i) => {
        const startAngle = i * 120;
        system += `<circle cx="${x}" cy="${y}" r="${radius}" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.2" />`;
        system += `<g transform="rotate(${startAngle} ${x} ${y})">
                     <animateTransform attributeName="transform" type="rotate" 
                                       values="0 ${x} ${y};360 ${x} ${y}" 
                                       dur="${8 + i * 2}s" repeatCount="indefinite" additive="sum"/>
                     <rect x="${x + radius - 2}" y="${y - 2}" width="4" height="4" 
                           fill="#FFAA00" opacity="0.7">
                       <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite"/>
                     </rect>
                   </g>`;
    });
    
    system += '</g>';
    return system;
}

// Mining System - Resource extraction
function createMiningSystem(x, y, name, color) {
    let system = `<g class="solar-system mining" data-system="${name}">`;
    
    // Central star
    system += `<circle cx="${x}" cy="${y}" r="5" fill="${color}" opacity="0.9">
                 <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
               </circle>`;
    
    // Asteroid belt
    for (let i = 0; i < 12; i++) {
        const angle = i * 30;
        const radius = 25 + (i % 3) * 5;
        system += `<g transform="rotate(${angle} ${x} ${y})">
                     <animateTransform attributeName="transform" type="rotate" 
                                       values="0 ${x} ${y};360 ${x} ${y}" 
                                       dur="${15 + i}s" repeatCount="indefinite" additive="sum"/>
                     <polygon points="${x + radius - 1},${y} ${x + radius + 1},${y - 1} ${x + radius + 1},${y + 1}" 
                              fill="#999999" opacity="0.5"/>
                   </g>`;
    }
    
    system += '</g>';
    return system;
}

// Frontier System - Remote colony
function createFrontierSystem(x, y, name, color) {
    let system = `<g class="solar-system frontier" data-system="${name}">`;
    
    // Small star
    system += `<circle cx="${x}" cy="${y}" r="4" fill="${color}" opacity="0.8">
                 <animate attributeName="opacity" values="0.6;0.9;0.6" dur="4s" repeatCount="indefinite" />
               </circle>`;
    
    // Single world with basic orbital
    system += `<circle cx="${x}" cy="${y}" r="20" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.3" />`;
    system += `<g>
                 <animateTransform attributeName="transform" type="rotate" 
                                   values="0 ${x} ${y};360 ${x} ${y}" 
                                   dur="10s" repeatCount="indefinite"/>
                 <circle cx="${x + 20}" cy="${y}" r="2" fill="#66CC99" opacity="0.7">
                   <animate attributeName="opacity" values="0.5;0.9;0.5" dur="5s" repeatCount="indefinite"/>
                 </circle>
               </g>`;
    
    system += '</g>';
    return system;
}

// Pirate System - Criminal haven
function createPirateSystem(x, y, name, color) {
    let system = `<g class="solar-system pirate" data-system="${name}">`;
    
    // Red dwarf star
    system += `<circle cx="${x}" cy="${y}" r="4" fill="${color}" opacity="0.9">
                 <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite" />
               </circle>`;
    
    // Irregular defensive positions
    for (let i = 0; i < 6; i++) {
        const angle = i * 60 + 15;
        const radius = 18 + Math.random() * 10;
        system += `<g transform="rotate(${angle} ${x} ${y})">
                     <animateTransform attributeName="transform" type="rotate" 
                                       values="0 ${x} ${y};360 ${x} ${y}" 
                                       dur="${12 + i * 2}s" repeatCount="indefinite" additive="sum"/>
                     <polygon points="${x + radius},${y - 1} ${x + radius + 2},${y} ${x + radius},${y + 1}" 
                              fill="#FF6600" opacity="0.6">
                       <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite"/>
                     </polygon>
                   </g>`;
    }
    
    system += '</g>';
    return system;
}

// Nexus Station - Advanced trading hub
function createNexusStation(x, y, name, color) {
    let system = `<g class="solar-system nexus" data-system="${name}">`;
    
    // Energy field rings (larger to accommodate bigger PNG)
    system += `<circle cx="${x}" cy="${y}" r="28" fill="none" stroke="${color}" stroke-width="1" opacity="0.4">
                 <animate attributeName="opacity" values="0.2;0.6;0.2" dur="3s" repeatCount="indefinite" />
               </circle>`;
    system += `<circle cx="${x}" cy="${y}" r="36" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.3">
                 <animate attributeName="opacity" values="0.1;0.5;0.1" dur="4s" repeatCount="indefinite" />
               </circle>`;
    
    // Nexus PNG icon (doubled in size)
    system += `<image x="${x-24}" y="${y-24}" width="48" height="48" href="assets/Nexus.PNG" opacity="0.8"/>`;
    
    // Docking ports (rotating at larger radius)
    for (let i = 0; i < 4; i++) {
        const angle = i * 90;
        system += `<g transform="rotate(${angle} ${x} ${y})">
                     <animateTransform attributeName="transform" type="rotate" 
                                       values="0 ${x} ${y};360 ${x} ${y}" 
                                       dur="${10 + i}s" repeatCount="indefinite" additive="sum"/>
                     <rect x="${x + 26}" y="${y - 1.5}" width="6" height="3" 
                           fill="#FFD700" opacity="0.8">
                       <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
                     </rect>
                   </g>`;
    }
    
    system += '</g>';
    return system;
}

// Generic System - Default fallback
function createGenericSystem(x, y, name, color) {
    let system = `<g class="solar-system generic" data-system="${name}">`;
    
    // Simple star
    system += `<circle cx="${x}" cy="${y}" r="5" fill="${color}" opacity="0.8">
                 <animate attributeName="opacity" values="0.7;0.9;0.7" dur="3s" repeatCount="indefinite" />
               </circle>`;
    
    // Basic orbital
    system += `<circle cx="${x}" cy="${y}" r="16" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.3" />`;
    system += `<g>
                 <animateTransform attributeName="transform" type="rotate" 
                                   values="0 ${x} ${y};360 ${x} ${y}" 
                                   dur="8s" repeatCount="indefinite"/>
                 <circle cx="${x + 16}" cy="${y}" r="2" fill="${color}" opacity="0.6"/>
               </g>`;
    
    system += '</g>';
    return system;
}

// Generate all travel routes from warp lanes data
function generateTravelRoutes(hexWidth, hexHeight) {
    let routes = '<g id="travel-routes">';
    
    const knownSystems = gameState.galaxy.knownSystems;
    
    // Debug: Check all known systems
    console.log('Checking known systems for warp lanes:');
    for (const [key, system] of Object.entries(knownSystems)) {
        if (!system || system.x === undefined || system.y === undefined || system.z === undefined ||
            isNaN(system.x) || isNaN(system.y) || isNaN(system.z)) {
            console.error(`Invalid system "${key}":`, system);
        }
    }
    
    // Generate routes for all warp lanes
    gameState.galaxy.warpLanes.forEach(lane => {
        const fromSystem = knownSystems[lane.from];
        const toSystem = knownSystems[lane.to];
        
        // More detailed validation
        if (!fromSystem) {
            console.warn(`Warp lane references unknown system: ${lane.from}`);
            return;
        }
        if (!toSystem) {
            console.warn(`Warp lane references unknown system: ${lane.to}`);
            return;
        }
        
        if (fromSystem && toSystem) {
            // Check that systems have valid coordinates
            if (fromSystem.x === undefined || fromSystem.y === undefined || fromSystem.z === undefined ||
                toSystem.x === undefined || toSystem.y === undefined || toSystem.z === undefined ||
                isNaN(fromSystem.x) || isNaN(fromSystem.y) || isNaN(fromSystem.z) ||
                isNaN(toSystem.x) || isNaN(toSystem.y) || isNaN(toSystem.z)) {
                console.warn(`Invalid coordinates for warp lane ${lane.from} to ${lane.to}:`, 
                    `from(${fromSystem.x},${fromSystem.y},${fromSystem.z})`,
                    `to(${toSystem.x},${toSystem.y},${toSystem.z})`);
                return; // Skip this lane
            }
            
            // Compute pixel centers directly from cube coords
            const fromPos = cubeToPixel(fromSystem.x, fromSystem.y, fromSystem.z, hexWidth, hexHeight);
            const toPos = cubeToPixel(toSystem.x, toSystem.y, toSystem.z, hexWidth, hexHeight);
            
            // Final validation
            if (isNaN(fromPos.x) || isNaN(fromPos.y) || isNaN(toPos.x) || isNaN(toPos.y)) {
                console.warn(`Invalid hex centers for warp lane ${lane.from} to ${lane.to}`);
                return; // Skip this lane
            }
            
            routes += createCurvedRoute(fromPos.x, fromPos.y, toPos.x, toPos.y);
        }
    });
    
    routes += '</g>';
    return routes;
}

// Create curved travel route
function createCurvedRoute(x1, y1, x2, y2) {
    // Guard invalid inputs
    if ([x1, y1, x2, y2].some(v => Number.isNaN(v))) {
        console.warn('Skipping route with NaN endpoints', { x1, y1, x2, y2 });
        return '';
    }
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    
    // Add curve by offsetting control point
    const dx = x2 - x1;
    const dy = y2 - y1;
    const controlX = midX - dy * 0.2;
    const controlY = midY + dx * 0.2;
    
    return `<path d="M ${x1},${y1} Q ${controlX},${controlY} ${x2},${y2}" 
                  fill="none" 
                  stroke="#00FF41" 
                  stroke-width="2" 
                  stroke-opacity="0.6"
                  stroke-dasharray="8,4">
              <animate attributeName="stroke-dashoffset" values="0;12" dur="2s" repeatCount="indefinite" />
            </path>`;
}


// Generate player ship with red hex outline
function generatePlayerShip(hexWidth, hexHeight) {
    // Ensure player has valid position
    if (!gameState.player.hexLocation) {
        console.warn('Player hexLocation is undefined, using default position');
        gameState.player.hexLocation = { x: 30, y: -40, z: 10 }; // Default to Sol
    }
    
    const {x, y, z} = gameState.player.hexLocation;
    
    // Validate coordinates
    if (isNaN(x) || isNaN(y) || isNaN(z)) {
        console.error('Player has invalid coordinates, resetting to Sol');
        gameState.player.hexLocation = { x: 30, y: -40, z: 10 };
        return '<g id="player-ship"></g>'; // Return empty group
    }
    
    let playerShip = '<g id="player-ship">';
    
    // Add red outline around player's hex cell (cube-native), inset so tile borders stay visible
    const center = cubeToPixel(x, y, z, hexWidth, hexHeight);
    const inset = Math.max(4, Math.round(hexWidth * 0.06)); // ~8px at 130 width
    const radius = Math.max(6, (hexWidth / 2) - inset);
    const hexPath = createHexPath(center.x, center.y, radius);
    playerShip += `<path d="${hexPath}"
                      fill="none"
                      stroke="#FF4444"
                      stroke-width="3"
                      stroke-opacity="0.8"
                      pointer-events="none"
                      class="player-hex-outline">
                    <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
                  </path>`;
    
    // Check if player's hex has a system (known or generated)
    const knownSystem = Object.values(gameState.galaxy.knownSystems)
        .find(system => system.x === x && system.y === y && system.z === z);
    const genSystemId = `sys_${x}_${y}_${z}`;
    const generatedSystem = gameState.galaxy.generatedSystems.get(genSystemId);
    const systemData = knownSystem || generatedSystem;
    
    if (systemData && (systemData.type || '').toLowerCase() !== 'empty') {
        // Player is in a system - initially place ship at center; transition to orbit handled after insertion
        const hexCenter = cubeToPixel(x, y, z, hexWidth, hexHeight);
        playerShip += createPlayerShipSymbol(hexCenter.x, hexCenter.y);
    } else {
        // Player is in empty space - center the ship in the hex
        const hexCenter = cubeToPixel(x, y, z, hexWidth, hexHeight);
        playerShip += createPlayerShipSymbol(hexCenter.x, hexCenter.y);
    }
    
    playerShip += '</g>';
    return playerShip;
}

// Generate red outline around player's hex
function generatePlayerHexOutline(col, row, hexWidth, hexHeight) {
    const hexRadius = hexWidth / 2;
    const x = col * hexWidth * 0.75;
    const y = row * hexHeight + (col % 2) * hexHeight * 0.5;
    // Inset the outline so state borders remain visible
    const inset = Math.max(4, Math.round(hexWidth * 0.06));
    const radius = Math.max(6, hexRadius - inset);
    const hexPath = createHexPath(x + hexRadius, y + hexHeight/2, radius);
    
    return `<path d="${hexPath}" 
                  fill="none" 
                  stroke="#FF4444" 
                  stroke-width="3" 
                  stroke-opacity="0.8"
                  pointer-events="none"
                  class="player-hex-outline">
              <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
            </path>`;
}

// Calculate ship position when near a system to avoid overlap
function getShipPositionNearSystem(systemX, systemY) {
    // Position ship towards the upper-left of the system to avoid overlap
    return {
        x: systemX - 25,
        y: systemY - 20
    };
}

// Create the player ship symbol (triangle design)
function createPlayerShipSymbol(x, y) {
    const rotation = gameState.player.shipRotation || 0;
    const shipType = gameState.player.shipType || 'scout1';
    
    // Map ship types to asset files
    const shipAssets = {
        'scout1': 'assets/scout_class_1.png',
        'scout2': 'assets/scout_class_2.png',
        'scout3': 'assets/scout_class_3.png',
        'scout4': 'assets/scout_class_4.png'
    };
    
    const shipAsset = shipAssets[shipType] || shipAssets['scout1'];
    
    // Render just the ship image (no extra overlays or pulses)
    return `<g class="player-ship-symbol" transform="translate(${x}, ${y}) rotate(${rotation})">
              <image href="${shipAsset}" x="-20" y="-20" width="40" height="40" opacity="1" />
            </g>`;
}

// Create orbiting player ship with animated movement
function createOrbitingPlayerShip(centerX, centerY, orbitRadius) {
    // Initialize orbital position if not set
    if (!gameState.player.orbitalAngle) {
        gameState.player.orbitalAngle = 0; // Start at right side (3 o'clock)
    }
    
    // Calculate current orbital position
    const angle = gameState.player.orbitalAngle * Math.PI / 180;
    const shipX = centerX + Math.cos(angle) * orbitRadius;
    const shipY = centerY + Math.sin(angle) * orbitRadius;
    
    // Calculate tangent angle (perpendicular to radius) for ship direction
    const tangentAngle = gameState.player.orbitalAngle + 90; // Tangent is 90° ahead of radius
    
    const shipType = gameState.player.shipType || 'scout1';
    const shipAssets = {
        'scout1': 'assets/scout_class_1.png',
        'scout2': 'assets/scout_class_2.png',
        'scout3': 'assets/scout_class_3.png',
        'scout4': 'assets/scout_class_4.png'
    };
    const shipAsset = shipAssets[shipType] || shipAssets['scout1'];
    
    // Create orbiting ship with proper rotation using image asset
    return `<g id="orbiting-ship" class="player-ship-symbol" transform="translate(${shipX}, ${shipY}) rotate(${tangentAngle})">
              <image href="${shipAsset}" x="-20" y="-20" width="40" height="40" opacity="1" />
            </g>`;
}

// Create orbiting player ship symbol (legacy function - keeping for compatibility)
function createOrbitingPlayerShipSymbol(centerX, centerY, orbitRadius) {
    // Start at the top of the orbit (12 o'clock position)
    const initialX = centerX;
    const initialY = centerY - orbitRadius;
    
    // Use current ship rotation, not orbital rotation
    const currentRotation = gameState.player.shipRotation || 0;
    
    return `<g class="player-ship-symbol" id="orbiting-ship" style="transform: rotate(${currentRotation}deg); transform-origin: ${initialX}px ${initialY}px;">
              <path d="M ${initialX},${initialY-12} L ${initialX-8},${initialY+8} L ${initialX+8},${initialY+8} Z" 
                    fill="#00AAFF" 
                    stroke="#FFFFFF" 
                    stroke-width="2" 
                    opacity="0.9">
                <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
              </path>
              <circle cx="${initialX}" cy="${initialY+2}" r="2" fill="#FFFFFF" opacity="0.8" />
            </g>`;
}

// Start orbital animation around a system
function startOrbitalAnimation(centerX, centerY, orbitRadius) {
    // Stop any existing animation
    stopOrbitalAnimation();
    if (!gameState.animation.animationsEnabled) {
        // Place ship at appropriate orbit position without animation
        const shipEl = document.querySelector('#player-ship .player-ship-symbol');
        if (shipEl) {
            const angleDeg = (typeof gameState.player.orbitalAngle === 'number') ? gameState.player.orbitalAngle : 0;
            const radians = angleDeg * Math.PI / 180;
            const x = centerX + Math.cos(radians) * orbitRadius;
            const y = centerY + Math.sin(radians) * orbitRadius;
            const r = angleDeg + 90;
            shipEl.setAttribute('transform', `translate(${x}, ${y}) rotate(${r})`);
        }
        return;
    }
    
    // Determine starting orbital angle
    // If a transition set an orbitalAngle already, respect it; otherwise derive from shipRotation
    let angle;
    if (typeof gameState.player.orbitalAngle === 'number') {
        angle = gameState.player.orbitalAngle;
    } else {
        const shipRotation = gameState.player.shipRotation || 0;
        angle = shipRotation - 90; // Convert ship heading to orbital position
        gameState.player.orbitalAngle = angle;
    }
    
    const orbitSpeed = 0.5; // Degrees per frame (slow rotation)
    
    function updateOrbit() {
        const shipElement = document.getElementById('orbiting-ship');
        if (!shipElement || gameState.animation.isShipMoving) {
            return; // Stop if ship element gone or ship is warping
        }
        // Throttle updates based on target FPS to reduce power
        const externalFps = (window.energyMetrics && window.energyMetrics.state && window.energyMetrics.state.targetFPS) || null;
        const targetFps = gameState.animation.targetFps || externalFps || 30;
        const minDelta = 1000 / Math.max(1, targetFps);
        const now = performance.now();
        if (gameState.animation._lastOrbitUpdate && (now - gameState.animation._lastOrbitUpdate) < minDelta) {
            if (!gameState.animation.isPaused) {
                gameState.animation.orbitAnimation = requestAnimationFrame(updateOrbit);
            }
            return;
        }
        gameState.animation._lastOrbitUpdate = now;
        
        // Update player's orbital angle in game state
        gameState.player.orbitalAngle = (gameState.player.orbitalAngle + orbitSpeed) % 360;
        
        // Calculate position on circle using stored orbital angle
        const radians = gameState.player.orbitalAngle * Math.PI / 180;
        const x = centerX + Math.cos(radians) * orbitRadius;
        const y = centerY + Math.sin(radians) * orbitRadius;
        
        // Calculate tangent rotation (ship points along orbital path)
        const tangentRotation = gameState.player.orbitalAngle + 90; // Tangent is 90° ahead of radius
        
        // Update ship position and rotation using SVG transform
        shipElement.setAttribute('transform', `translate(${x}, ${y}) rotate(${tangentRotation})`);
        
        // Continue orbital animation only if not paused
        if (!gameState.animation.isPaused) {
            gameState.animation.orbitAnimation = requestAnimationFrame(updateOrbit);
        }
    }
    
    // Mark that we are orbiting so we can restore after pause
    gameState.animation.wasOrbiting = true;
    // Start the animation
    updateOrbit();
}

// Stop orbital animation
function stopOrbitalAnimation() {
    if (gameState.animation.orbitAnimation) {
        cancelAnimationFrame(gameState.animation.orbitAnimation);
        gameState.animation.orbitAnimation = null;
    }
    gameState.animation.wasOrbiting = false;
}

// Pause all animations to save battery
function pauseAnimations() {
    gameState.animation.isPaused = true;
    gameState.animation._lastOrbitUpdate = 0;
    // Pause NPC timer to save power
    try {
        if (gameState.npc && gameState.npc._timer) {
            clearInterval(gameState.npc._timer);
            gameState.npc._timer = null;
        }
    } catch(e) { /* ignore */ }
    // Remember whether we were animating and the previous enable state
    gameState.animation.prevAnimationsEnabled = !!gameState.animation.animationsEnabled;
    if (gameState.animation.orbitAnimation) {
        gameState.animation.wasOrbiting = true;
    }
    if (gameState.animation.orbitAnimation) {
        cancelAnimationFrame(gameState.animation.orbitAnimation);
        gameState.animation.orbitAnimation = null;
    }
    // Pause SVG SMIL animations (planets, stars, etc.) to save energy
    try {
        const svg = document.querySelector('#ascii-display svg');
        if (svg && typeof svg.pauseAnimations === 'function') {
            svg.pauseAnimations();
        }
    } catch (e) { /* ignore */ }
}

// Resume animations when visible
function resumeAnimations() {
    if (!gameState.animation.isPaused) return;
    gameState.animation.isPaused = false;
    gameState.animation._lastOrbitUpdate = 0;
    // Resume SVG SMIL animations
    try {
        const svg = document.querySelector('#ascii-display svg');
        if (svg && typeof svg.unpauseAnimations === 'function') {
            svg.unpauseAnimations();
        }
    } catch (e) { /* ignore */ }
    // Restart orbital animation if it was animating before pause
    if (gameState.animation.wasOrbiting) {
        // Restore previous enable state if it was on
        if (gameState.animation.prevAnimationsEnabled) {
            gameState.animation.animationsEnabled = true;
        }
        const {x, y, z} = gameState.player.hexLocation;
        const knownSystem = Object.values(gameState.galaxy.knownSystems)
            .find(system => system.x === x && system.y === y && system.z === z);
        const genSystemId = `sys_${x}_${y}_${z}`;
        const generatedSystem = gameState.galaxy.generatedSystems.get(genSystemId);
        const systemData = knownSystem || generatedSystem;
        if (systemData && (systemData.type || '').toLowerCase() !== 'empty') {
            const hexWidth = 130;
            const hexHeight = hexWidth * (Math.sqrt(3) / 2);
            const center = cubeToPixel(x, y, z, hexWidth, hexHeight);
            startOrbitalAnimation(center.x, center.y, 35);
        }
    }
    // Resume NPC timer (independent of animation visual state)
    try {
        if (gameState.npc && !gameState.npc._timer) {
            gameState.npc._timer = setInterval(() => {
                const newPhase = _computeNpcPhase();
                if (gameState.npc._phase !== newPhase) {
                    _recomputeNpcPositions();
                } else {
                    _recomputeNpcPositions();
                }
            }, 15000);
        }
    } catch(e) { /* ignore */ }
}

// Handle Page Visibility API
function handleVisibilityChange() {
    if (document.hidden) {
        pauseAnimations();
    } else {
        resumeAnimations();
    }
}

// Handle window focus (fallback for older browsers)
function handleFocus() {
    resumeAnimations();
}

function handleBlur() {
    pauseAnimations();
}

// Center the map viewport on the player ship
function centerMapOnPlayer() {
    const mainDisplay = document.querySelector('.main-display');
    const svg = document.querySelector('#ascii-display svg');
    
    if (!svg || !mainDisplay) return;
    
    const {x, y, z} = gameState.player.hexLocation;
    // Calculate hex center position in SVG coordinates (cube-native)
    const hexWidth = 130; // Using the fixed hex width
    const hexHeight = hexWidth * (Math.sqrt(3) / 2);
    const playerCenter = cubeToPixel(x, y, z, hexWidth, hexHeight);
    
    // Get viewport dimensions
    const displayRect = mainDisplay.getBoundingClientRect();
    
    // Calculate scroll position to center player
    const targetScrollLeft = playerCenter.x - displayRect.width / 2;
    const targetScrollTop = playerCenter.y - displayRect.height / 2;
    
    // Smooth scroll to player position
    mainDisplay.scrollTo({
        left: targetScrollLeft,
        top: targetScrollTop,
        behavior: 'smooth'
    });
}

// Helper function to replace character at position
function replaceAt(str, index, replacement) {
    return str.substr(0, index) + replacement + str.substr(index + replacement.length);
}

// Grid utility functions
function getGridSector(x, y) {
    const sectorX = Math.floor(x / gameState.galaxy.grid.size);
    const sectorY = Math.floor(y / gameState.galaxy.grid.size);
    return `${sectorX},${sectorY}`;
}

function getSectorBounds(sectorKey) {
    const [sectorX, sectorY] = sectorKey.split(',').map(Number);
    return {
        x1: sectorX * gameState.galaxy.grid.size,
        y1: sectorY * gameState.galaxy.grid.size,
        x2: (sectorX + 1) * gameState.galaxy.grid.size,
        y2: (sectorY + 1) * gameState.galaxy.grid.size
    };
}

function hasKnownSystemInSector(sectorKey) {
    const bounds = getSectorBounds(sectorKey);
    const systems = [
        {x: 120, y: 80}, // Mars
        {x: 280, y: 150}, // Sol  
        {x: 480, y: 180}, // Vega
        {x: 200, y: 420}, // Nexus
    ];
    
    return systems.some(system => 
        system.x >= bounds.x1 && system.x < bounds.x2 && 
        system.y >= bounds.y1 && system.y < bounds.y2
    );
}

function generateSectorData(sectorKey) {
    // Generate random scan data for empty sectors
    const discoveryTypes = ['planet', 'asteroid', 'artifact', 'station', 'anomaly', 'resources'];
    const probability = Math.floor(Math.random() * 91); // 0-90
    const discoveryType = discoveryTypes[Math.floor(Math.random() * discoveryTypes.length)];
    
    return { probability, discoveryType };
}

function scanSector(sectorKey) {
    if (gameState.player.actionPoints < 1) {
        return { success: false, message: 'Insufficient Action Points for scanning!' };
    }
    
    gameState.player.actionPoints -= 1;
    gameState.galaxy.grid.scannedSectors.add(sectorKey);
    
    if (!gameState.galaxy.grid.sectorData.has(sectorKey)) {
        const data = generateSectorData(sectorKey);
        gameState.galaxy.grid.sectorData.set(sectorKey, data);
    }
    
    return { success: true };
}

// Draw connections between nodes
function drawConnection(map, node1, node2) {
    // Simple line drawing between two nodes
    const dx = node2.x - node1.x;
    const dy = node2.y - node1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.floor(distance);
    
    for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const x = Math.round(node1.x + dx * t);
        const y = Math.round(node1.y + dy * t);
        
        if (x >= 0 && x < map[0].length && y >= 0 && y < map.length) {
            if (map[y][x] === ' ') {
                map[y][x] = '─';
            }
        }
    }
}

// Get node symbol based on type
function getNodeSymbol(type) {
    const symbols = {
        homeworld: '★',
        outpost: '●',
        hub: '◈',
        spacestation: '■',
        station: '■',
        ruins: '◆',
        station: '■',
        planet: '◉'
    };
    return symbols[type] || '●';
}

// Generate Ship Status Screen
function generateShipStatus() {
    const shipType = gameState.player.shipType || 'scout1';
    const shipName = gameState.player.shipName || 'Starfinder';
    const playerName = gameState.player.name || 'Captain';
    const credits = gameState.player.credits || 0;
    const ap = gameState.player.actionPoints || 0;
    const maxAP = gameState.player.maxActionPoints || 10;
    
    // Get ship-specific data
    const scanCapabilities = SCAN_UNLOCKS[shipType] || SCAN_UNLOCKS['scout1'];
    const scanParams = SCAN_PARAMS[shipType] || SCAN_PARAMS['scout1'];
    const shipAssets = {
        'scout1': 'assets/scout_class_1.png',
        'scout2': 'assets/scout_class_2.png', 
        'scout3': 'assets/scout_class_3.png',
        'scout4': 'assets/scout_class_4.png'
    };
    const shipAsset = shipAssets[shipType] || shipAssets['scout1'];
    
    // Get cargo info
    const cargoCapacity = gameState.player.cargo?.capacity || 20;
    const cargoUsed = gameState.player.cargo?.usedSpace || 0;
    const cargoContents = gameState.player.cargo?.contents || new Map();
    
    // Get equipment info
    const extractionEquipment = gameState.player.ship?.extractionEquipment || new Set();
    const smugglingUpgrades = gameState.player.ship?.smugglingUpgrades || {};
    
    // Ship class names
    const shipClassNames = {
        'scout1': 'Scout Class I',
        'scout2': 'Scout Class II', 
        'scout3': 'Scout Class III',
        'scout4': 'Scout Class IV'
    };
    const shipClassName = shipClassNames[shipType] || 'Scout Class I';
    
    return `
    <div class="ship-status-container">
        <div class="ship-header">
            <h2>SHIP: "${shipName}"</h2>
            <div class="ship-class">${shipClassName}</div>
        </div>
        
        <div class="ship-main-display">
            <div class="ship-visual">
                <svg class="ship-svg" viewBox="0 0 400 300" width="400" height="300">
                    <!-- Ship Background Panel -->
                    <rect x="0" y="0" width="400" height="300" fill="#001122" stroke="#00ffff" stroke-width="2" rx="10"/>
                    
                    <!-- Ship Image -->
                    <g transform="translate(200, 150)">
                        <image href="${shipAsset}?v=20250828i" x="-60" y="-60" width="120" height="120" opacity="1"/>
                        
                        <!-- Ship Status Indicators -->
                        <circle cx="-70" cy="-70" r="6" fill="#00ff00" opacity="0.8"/>
                        <text x="-85" y="-65" fill="#00ff00" font-size="10" text-anchor="middle">PWR</text>
                        
                        <circle cx="70" cy="-70" r="6" fill="#00ff00" opacity="0.8"/>
                        <text x="85" y="-65" fill="#00ff00" font-size="10" text-anchor="middle">NAV</text>
                        
                        <circle cx="-70" cy="70" r="6" fill="#ffff00" opacity="0.8"/>
                        <text x="-85" y="75" fill="#ffff00" font-size="10" text-anchor="middle">SYS</text>
                        
                        <circle cx="70" cy="70" r="6" fill="#00ff00" opacity="0.8"/>
                        <text x="85" y="75" fill="#00ff00" font-size="10" text-anchor="middle">SHD</text>
                    </g>
                    
                    <!-- Ship Name Display -->
                    <text x="200" y="25" fill="#00ffff" font-size="16" text-anchor="middle" font-weight="bold">${shipName}</text>
                    <text x="200" y="275" fill="#00aaff" font-size="12" text-anchor="middle">${shipClassName}</text>
                </svg>
            </div>
            
            <div class="ship-stats">
                <div class="stats-section">
                    <h3>Systems Status</h3>
                    <div class="stat-bar">
                        <span class="stat-label">Hull Integrity</span>
                        <div class="bar-container">
                            <div class="bar-fill hull-bar" style="width: 80%"></div>
                        </div>
                        <span class="stat-value">80%</span>
                    </div>
                    
                    <div class="stat-bar">
                        <span class="stat-label">Power/Fuel</span>
                        <div class="bar-container">
                            <div class="bar-fill fuel-bar" style="width: ${(ap/maxAP)*100}%"></div>
                        </div>
                        <span class="stat-value">${ap}/${maxAP} AP</span>
                    </div>
                    
                    <div class="stat-bar">
                        <span class="stat-label">Shields</span>
                        <div class="bar-container">
                            <div class="bar-fill shield-bar" style="width: 100%"></div>
                        </div>
                        <span class="stat-value">100%</span>
                    </div>
                    
                    <div class="stat-bar">
                        <span class="stat-label">Cargo Hold</span>
                        <div class="bar-container">
                            <div class="bar-fill cargo-bar" style="width: ${(cargoUsed/cargoCapacity)*100}%"></div>
                        </div>
                        <span class="stat-value">${cargoUsed}/${cargoCapacity}</span>
                    </div>
                </div>
                
                <div class="stats-section">
                    <h3>Scanner Capabilities</h3>
                    <div class="scanner-capabilities">
                        ${scanCapabilities.map(cap => `
                            <div class="capability-item active">
                                <span class="cap-icon">●</span>
                                <span class="cap-name">${cap.toUpperCase()}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="scanner-specs">
                        <div class="spec-item">
                            <span class="spec-label">Accuracy:</span>
                            <span class="spec-value">${Math.round((1-scanParams.sigmaNoise)*100)}%</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Sweep Range:</span>
                            <span class="spec-value">${scanParams.sweepRadius} hexes</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Error Rate:</span>
                            <span class="spec-value">${Math.round(scanParams.mislead*100)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="ship-info-panels">
            <div class="info-panel">
                <h3>Ship Information</h3>
                <div class="info-item">
                    <span class="info-label">Captain:</span>
                    <span class="info-value">${playerName}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Credits:</span>
                    <span class="info-value">¢${credits.toLocaleString()}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Registry:</span>
                    <span class="info-value">UES-${shipName}-${Math.floor(credits/100)}</span>
                </div>
            </div>
            
            <div class="info-panel">
                <h3>Cargo Manifest</h3>
                <div class="cargo-list">
                    ${cargoContents.size > 0 ? 
                        Array.from(cargoContents.entries()).map(([resource, qty]) => `
                            <div class="cargo-item">
                                <span class="cargo-name">${resource}:</span>
                                <span class="cargo-qty">${qty}</span>
                            </div>
                        `).join('') :
                        '<div class="cargo-empty">Cargo hold empty</div>'
                    }
                </div>
                <div class="cargo-summary">
                    Space Used: ${cargoUsed}/${cargoCapacity} units
                </div>
            </div>
            
            <div class="info-panel">
                <h3>Equipment</h3>
                <div class="equipment-list">
                    ${extractionEquipment.size > 0 ?
                        Array.from(extractionEquipment).map(equipment => `
                            <div class="equipment-item">
                                <span class="equip-icon">⚙</span>
                                <span class="equip-name">${equipment}</span>
                            </div>
                        `).join('') :
                        '<div class="equipment-empty">No specialized equipment</div>'
                    }
                    
                    ${Object.entries(smugglingUpgrades).filter(([k,v]) => v).map(([upgrade, active]) => `
                        <div class="equipment-item smuggling">
                            <span class="equip-icon">🔒</span>
                            <span class="equip-name">${upgrade.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>`;
}

// Generate Guild Screen
function generateGuildScreen() {
    const guildMain = `Guild Rank: Initiate Explorer
Guild Credits: 2,847 GC
Active Members: 847/1000
Guild Territory: 23 Systems
Monthly Tribute: 150 GC

Current Guild Mission:
"Deep Space Archaeological Survey"
Progress: 34% Complete
Reward Pool: 15,000 GC + Rare Artifacts

Your Contributions:
Systems Explored: 12
Artifacts Recovered: 3
Combat Assists: 7
Trade Routes Mapped: 2`;

    const guildAssets = `Fleet Strength: 847 Ships
  - Scouts: 423
  - Frigates: 289
  - Cruisers: 98
  - Battleships: 37

Controlled Stations: 8
Trade Route Income: 12,000 GC/day
Research Labs: 3 Active
Defense Rating: High`;

    const guildStatus = `Next Guild Vote: 3 Days
Proposal: "Expand into Vegan Sector"

War Status: At peace
Diplomatic Relations: Stable
Recent Victories: Nexus Pirate Raid (87% Guild participation)`;

    return createBox(guildMain, 'STAR RAIDERS GUILD') + '\n\n' + 
           createBox(guildAssets, 'Guild Assets') + '\n\n' +
           createBox(guildStatus);
}

// Generate Crisis Screen
function generateCrisisScreen() {
    const crisisDescription = `PRIORITY ALERT: Alien Signal Detected

Long-range sensors have detected an unknown energy signature 
emanating from the Vega system ruins. The signal appears to be 
artificial in origin and is growing stronger by the hour.

Initial analysis suggests the signal may be some kind of 
activation sequence or distress call from dormant alien 
technology. Guild Command has classified this as a Priority 1 
investigation.

Time Remaining: 18:47:23
Signal Strength: Increasing (+12%/hour)
Threat Assessment: UNKNOWN`;

    const crisisOptions = `[A] INVESTIGATE IMMEDIATELY
    Risk: High | Reward: Unknown | AP Cost: 6
    Lead a small fleet to investigate the source

[B] GATHER INTELLIGENCE FIRST  
    Risk: Low | Reward: Information | AP Cost: 2
    Send stealth probes for reconnaissance

[C] ALERT GUILD COMMAND
    Risk: None | Reward: Guild favor | AP Cost: 1
    Let more experienced captains handle this`;

    const crisisResponse = `Time is critical. The Guild expects decisive action from 
its captains. Your choice will affect not only your standing 
but potentially the fate of the entire sector.

Previous Crisis Results:
Yesterday: 67% chose to investigate (23% casualties)
Success Rate: 45% | Average Reward: 2,400 GC`;

    return createBox(crisisDescription, 'DAILY CRISIS - Day 42') + '\n\n' +
           createBox(crisisOptions, 'Response Options') + '\n\n' +
           createBox(crisisResponse);
}

// System tooltip popup functionality
function createSystemTooltip(systemId) {
    const system = systemData[systemId];
    if (!system) return '';
    
    return `
<div class="system-tooltip" id="system-tooltip">
    <div class="system-tooltip-content">
        <div class="system-tooltip-header">
            <h3>${system.name}</h3>
            <span class="system-type">${system.type}</span>
        </div>
        <div class="system-tooltip-body">
            <p class="system-description">${system.description}</p>
            <div class="system-stats">
                <div class="stat">Population: <span>${system.population}</span></div>
                <div class="stat">Threat Level: <span>${system.threat}</span></div>
                <div class="stat">Resources: <span>${system.resources}</span></div>
            </div>
        </div>
    </div>
</div>`;
}

// Initialize the game
function init() {
    console.log('Initializing Space Guilds...');
    
    // Initialize zoom logging system
    initZoomLogging();
    
    // Ensure player position is valid before anything else
    if (!gameState.player.hexLocation || 
        isNaN(gameState.player.hexLocation.x) || 
        isNaN(gameState.player.hexLocation.y) || 
        isNaN(gameState.player.hexLocation.z)) {
        console.warn('Invalid player position detected, resetting to Sol System');
        gameState.player.hexLocation = { x: 30, y: -40, z: 10 };
    }
    
    // Try to load saved game state
    const hasLoadedSave = loadGameState();
    
    if (!hasLoadedSave) {
        console.log('Starting new game...');
        // Only set up test areas if no save was loaded
        setupInitialTestAreas();
        // Generate all systems at game start
        generateAllSystemsAtInit();
        // Generate all resources at game start
        generateAllResourcesAtInit();
        
        // Add some test cargo for trading system testing
        addResourceToCargo('Ore', 5);
        addResourceToCargo('Circuits', 3);
        addResourceToCargo('Spice', 2);
        console.log('Added test cargo for trading system');
    } else {
        console.log(`Loaded game with ${gameState.galaxy.generatedSystems.size} generated systems`);
        console.log(`Loaded game with ${gameState.galaxy.resources.hexResources.size} resource sites`);
        
        // Validate loaded player position
        if (!gameState.player.hexLocation || 
            isNaN(gameState.player.hexLocation.x) || 
            isNaN(gameState.player.hexLocation.y) || 
            isNaN(gameState.player.hexLocation.z)) {
            console.warn('Loaded save has invalid player position, resetting to Sol System');
            gameState.player.hexLocation = { x: 30, y: -40, z: 10 };
        }
    }
    
    // Ensure wormholes container exists
    gameState.galaxy.wormholes = gameState.galaxy.wormholes || { lanes: [] };
    // One-time wormhole generation: on first run, or if save has none
    const hasNoWormholes = !gameState.galaxy.wormholes.lanes || gameState.galaxy.wormholes.lanes.length === 0;
    if (!hasLoadedSave || hasNoWormholes) {
        try {
            generateWormholes(true); // silent generate, persists via autoSave
        } catch (e) {
            console.warn('Wormhole generation failed at init:', e);
        }
    }

    // Initialize screen
    updateScreen('map');
    updateStatusPanel();
    
    // Initialize systems that need to run regardless of save state
    initializeRegenerationSystem();
    initializeNpcSystem();

    // Wormholes already ensured/generated above
    
    // Auto-save on actions (no timer)
    
    // Rest of init continues...
    initializeEventHandlers();
    // Remove legacy chrome for full-bleed UI
    try {
        const top = document.querySelector('.top-bar');
        if (top) top.remove();
        const status = document.getElementById('status-panel');
        if (status) status.remove();
        const tab = document.querySelector('.tab-bar');
        if (tab) tab.remove();
    } catch (e) { /* ignore */ }
}

function setupInitialTestAreas() {
    // Create 4-cell test areas north of Sol with selected designs
    // Scanned: use scan2 (old CRT screen lines) - 2x2 area at cols 28-29, rows 23-24
    for (let col = 28; col <= 29; col++) {
        for (let row = 23; row <= 24; row++) {
            const {x, y, z} = offsetToCube(col, row);
            setHexState(cubeId(x, y, z), 'scanned');
        }
    }
    
    // Claimed: use claim1 (glowing neon outline) - 2x2 area at cols 26-27, rows 22-23  
    for (let col = 26; col <= 27; col++) {
        for (let row = 22; row <= 23; row++) {
            const {x, y, z} = offsetToCube(col, row);
            setHexState(cubeId(x, y, z), 'claimed');
        }
    }
    
    // Visited: use visit1 (soft gradient glow) - 2x2 area at cols 29-30, rows 21-22
    for (let col = 29; col <= 30; col++) {
        for (let row = 21; row <= 22; row++) {
            const {x, y, z} = offsetToCube(col, row);
            setHexState(cubeId(x, y, z), 'visited');
        }
    }
    
    // Mark player's starting position as visited
    const {x: playerX, y: playerY, z: playerZ} = gameState.player.hexLocation;
    const startingHexId = cubeId(playerX, playerY, playerZ);
    setHexState(startingHexId, 'visited');
}

function initializeEventHandlers() {
    // Add Page Visibility API to pause animations when not visible
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also pause on focus/blur for broader browser support
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    // Handle tab switching
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Tab clicked:', e.currentTarget.dataset.screen);
            
            // Remove active from all tabs
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            // Add active to clicked tab
            e.currentTarget.classList.add('active');
            
            // Update screen
            updateScreen(e.currentTarget.dataset.screen);
        });
    });
    
    // Handle center button
    document.getElementById('center-btn').addEventListener('click', centerMapOnPlayer);
    
    // Handle developer menu button
    document.getElementById('dev-menu-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDevMenu();
    });

    // Handle top bar LOG button
    const logBtn = document.querySelector('.top-right');
    if (logBtn) {
        logBtn.style.cursor = 'pointer';
        logBtn.title = 'Open Discovery Log';
        logBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showDiscoveryLog();
        });
    }
    
    // Close dev menu when clicking outside
    document.addEventListener('click', (e) => {
        const devMenu = document.getElementById('dev-menu');
        const devBtn = document.getElementById('dev-menu-btn');
        if (devMenu && !devMenu.contains(e.target) && e.target !== devBtn) {
            devMenu.classList.add('hidden');
        }
    });
    
    // Add click handlers for system symbols in the map
    document.getElementById('ascii-display').addEventListener('click', handleMapClick);
    
    // Add global click handler to dismiss tooltips and highlights
    document.addEventListener('click', (e) => {
        // Only dismiss if clicking outside status boxes and not on the map
        if (!e.target.closest('.hex-status-box') && 
            !e.target.closest('.hex-status-box-top') &&
            !e.target.closest('#ascii-display')) {
            hideAllTooltips();
            clearSectorHighlight();
        }
    });

    // Pinch-to-zoom and pan/drag on the map (SVG inside #ascii-display)
    setupPinchZoomHandlers();
    setupPanHandlers();

    // iOS Safari: prevent browser pinch-zoom gestures so our map zoom handles it
    try {
        // Block all Safari gesture events
        document.addEventListener('gesturestart', (e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            debugLog('Gesture Block', 'gesturestart blocked');
        }, { passive: false });
        document.addEventListener('gesturechange', (e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            debugLog('Gesture Block', 'gesturechange blocked');
        }, { passive: false });
        document.addEventListener('gestureend', (e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            debugLog('Gesture Block', 'gestureend blocked');
        }, { passive: false });
        
        // Block double-tap to zoom
        let lastTap = 0;
        document.addEventListener('touchend', (e) => {
            const currentTime = Date.now();
            const tapLength = currentTime - lastTap;
            if (tapLength < 500 && tapLength > 0) {
                e.preventDefault();
                debugLog('Double-tap Block', 'prevented Safari zoom');
            }
            lastTap = currentTime;
        }, { passive: false });
        
    } catch (e) { /* ignore */ }

    // Bind zoom buttons and bottom nav buttons for consistent behavior
    setupZoomButtonHandlers();
    setupBottomNavButtons();
}

function setupZoomButtonHandlers() {
    const zin = document.getElementById('zoom-in-btn');
    const zout = document.getElementById('zoom-out-btn');
    
    function setupButton(button, zoomFunction, buttonName) {
        if (!button) return;
        
        let isTouching = false;
        let touchStartTime = 0;
        let hasResponded = false;
        
        // iOS Safari optimized touch handling
        function handleTouchStart(e) {
            e.preventDefault();
            e.stopPropagation();
            isTouching = true;
            touchStartTime = Date.now();
            hasResponded = false;
            
            // Add active visual state
            button.style.transform = 'scale(0.90)';
            button.style.background = 'rgba(0, 255, 65, 0.2)';
            
            console.log(`[Zoom] ${buttonName} touch started`);
        }
        
        function handleTouchEnd(e) {
            if (!isTouching) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            const touchDuration = Date.now() - touchStartTime;
            
            // Remove active visual state
            button.style.transform = 'scale(1.0)';
            button.style.background = 'rgba(0, 0, 0, 0.8)';
            
            // Only trigger zoom if it was a quick touch and we haven't responded yet
            if (!hasResponded && touchDuration < 500) {
                hasResponded = true;
                console.log(`[Zoom] ${buttonName} activated via touch`);
                
                // Small delay to ensure touch is complete
                setTimeout(() => {
                    zoomFunction();
                }, 10);
            }
            
            isTouching = false;
        }
        
        function handleTouchCancel(e) {
            // Reset state on touch cancel
            isTouching = false;
            hasResponded = false;
            button.style.transform = 'scale(1.0)';
            button.style.background = 'rgba(0, 0, 0, 0.8)';
            console.log(`[Zoom] ${buttonName} touch cancelled`);
        }
        
        function handleClick(e) {
            // Only handle click if no touch interaction occurred
            if (!hasResponded && !isTouching) {
                e.preventDefault();
                e.stopPropagation();
                console.log(`[Zoom] ${buttonName} activated via click`);
                zoomFunction();
            }
        }
        
        // iOS Safari: touchstart is most reliable
        button.addEventListener('touchstart', handleTouchStart, { passive: false });
        button.addEventListener('touchend', handleTouchEnd, { passive: false });
        button.addEventListener('touchcancel', handleTouchCancel, { passive: false });
        
        // Fallback for non-touch devices
        button.addEventListener('click', handleClick, { passive: false });
        
        // Prevent double handling
        button.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'touch') {
                // Touch events will handle this
                e.preventDefault();
            }
        }, { passive: false });
        
        console.log(`[Zoom] ${buttonName} handlers setup complete`);
    }
    
    setupButton(zin, zoomIn, 'Zoom In');
    setupButton(zout, zoomOut, 'Zoom Out');
}

function setupBottomNavButtons() {
    const btnMap = document.getElementById('nav-map-btn');
    const btnShip = document.getElementById('nav-ship-btn');
    const btnGuild = document.getElementById('nav-guild-btn');
    const btnCrisis = document.getElementById('nav-crisis-btn');
    const btnLog = document.getElementById('nav-log-btn');
    const bind = (el, fn) => {
        if (!el) return;
        const h = (e) => { e.preventDefault(); e.stopPropagation(); fn(); };
        el.addEventListener('click', h, { passive: false });
        el.addEventListener('touchstart', h, { passive: false });
        el.addEventListener('touchend', h, { passive: false });
        el.addEventListener('pointerup', h, { passive: false });
    };
    bind(btnMap, () => updateScreen('map'));
    bind(btnShip, () => updateScreen('ship'));
    bind(btnGuild, () => updateScreen('guild'));
    bind(btnCrisis, () => updateScreen('crisis'));
    bind(btnLog, () => showDiscoveryLog());
}

function applyMapZoomTransform() {
    const wrapper = document.getElementById('map-zoom');
    const svg = document.querySelector('#ascii-display svg');
    const target = wrapper || svg;
    if (!target) return;
    const scale = Math.max(gameState.ui.minZoom, Math.min(gameState.ui.maxZoom, gameState.ui.zoomScale || 1));
    target.style.transformOrigin = '0 0';
    // Safari SVG transforms can require transformBox for correct origin
    try { target.style.transformBox = 'fill-box'; } catch (e) { /* ignore */ }
    target.style.transform = `scale(${scale})`;
}

function setupPinchZoomHandlers() {
    const container = document.querySelector('.main-display');
    if (!container) return;
    let pinch = null;
    let debugMode = false; // Set to true to enable touch debugging

    function log(...args) {
        if (debugMode) console.log('[Zoom Debug]', ...args);
    }

    function getDistance(t1, t2) {
        const dx = t2.clientX - t1.clientX;
        const dy = t2.clientY - t1.clientY;
        return Math.hypot(dx, dy);
    }
    function getMidpoint(t1, t2) {
        return { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
    }

    // iOS Safari-optimized coordinate calculation
    function getContainerRelativePosition(clientX, clientY, container) {
        try {
            const rect = container.getBoundingClientRect();
            // iOS Safari sometimes has timing issues with getBoundingClientRect
            if (!rect || rect.width === 0 || rect.height === 0) {
                log('Invalid container rect, retrying');
                // Small delay and retry for iOS Safari
                return new Promise(resolve => {
                    setTimeout(() => {
                        const retryRect = container.getBoundingClientRect();
                        resolve({
                            x: clientX - retryRect.left,
                            y: clientY - retryRect.top,
                            rect: retryRect
                        });
                    }, 10);
                });
            }
            return {
                x: clientX - rect.left,
                y: clientY - rect.top,
                rect: rect
            };
        } catch (err) {
            log('Error getting container position:', err);
            // Fallback to simple calculation
            return { x: clientX, y: clientY, rect: { left: 0, top: 0 } };
        }
    }

    function endPinch(reason = 'unknown') {
        log('Ending pinch:', reason);
        pinch = null;
        gameState.ui.isPinching = false;
        
        // Shorter suppression - just enough to prevent accidental taps, not block new gestures
        gameState.ui.suppressTapUntil = Date.now() + 100;
        
        // Force reset touch state for iOS Safari
        window.lastTouchCount = 0;
        
        // Clear any stuck touch states with a small delay
        setTimeout(() => {
            debugLog('State Reset', 'touch state cleared');
            updateDebugOverlay();
        }, 50);
        
        debugLog('Pinch Ended', reason);
    }

    // iOS Safari-optimized touch start - handles pinch zoom only
    container.addEventListener('touchstart', (e) => {
        log('touchstart, touches:', e.touches.length, 'mode:', gameState.ui.mapMode);
        window.lastTouchCount = e.touches.length;
        debugLog('Pinch TouchStart', `${e.touches.length} touches`);
        
        if (e.touches.length >= 2) {
            // Two or more fingers = pinch zoom (works in both modes)
            // Force stop any ongoing pan
            if (gameState.ui.isPanning) {
                // Force end pan to allow pinch
                debugLog('Pinch Override', 'stopping pan');
                // Signal pan handlers to stop
                gameState.ui.isPanning = false;
            }
            
            try {
                // Prevent browser from starting native pinch-zoom - critical for iOS
                e.preventDefault();
                e.stopPropagation();
                
                const [t1, t2] = e.touches;
                const startDist = getDistance(t1, t2);
                
                // More lenient minimum distance for iOS Safari
                if (startDist < 10) {
                    debugLog('Pinch Skip', `dist too small: ${startDist.toFixed(0)}`);
                    log('Touch points too close, ignoring pinch');
                    return;
                }
                
                // Store initial anchor point to prevent jumping
                const rect = container.getBoundingClientRect();
                const viewportCenterX = rect.width / 2;
                const viewportCenterY = rect.height / 2;
                const currentScrollX = container.scrollLeft || 0;
                const currentScrollY = container.scrollTop || 0;
                const startScale = gameState.ui.zoomScale || 1;
                
                pinch = {
                    startDist,
                    startScale: startScale,
                    startTime: Date.now(),
                    // Lock the anchor point at pinch start
                    anchorX: (currentScrollX + viewportCenterX) / startScale,
                    anchorY: (currentScrollY + viewportCenterY) / startScale
                };
                
                gameState.ui.isPinching = true;
                log('Pinch started, startDist:', startDist, 'startScale:', pinch.startScale);
                debugLog('Pinch Started', `dist: ${startDist.toFixed(0)}, scale: ${pinch.startScale.toFixed(2)}`);
            } catch (err) {
                log('Error in touchstart:', err);
            }
        } else if (e.touches.length > 2 && pinch) {
            // More than 2 touches, end current pinch
            endPinch('too many touches');
        } else if (e.touches.length >= 2 && !pinch && !gameState.ui.isPinching) {
            // Fallback: try to start pinch even if main detection missed it
            debugLog('Pinch Fallback', 'retry detection');
            try {
                e.preventDefault();
                const [t1, t2] = e.touches;
                const startDist = getDistance(t1, t2);
                
                if (startDist >= 10) {
                    // Store initial anchor point for fallback pinch
                    const rect = container.getBoundingClientRect();
                    const viewportCenterX = rect.width / 2;
                    const viewportCenterY = rect.height / 2;
                    const currentScrollX = container.scrollLeft || 0;
                    const currentScrollY = container.scrollTop || 0;
                    const startScale = gameState.ui.zoomScale || 1;
                    
                    gameState.ui.isPinching = true;
                    pinch = {
                        startDist,
                        startScale: startScale,
                        startTime: Date.now(),
                        anchorX: (currentScrollX + viewportCenterX) / startScale,
                        anchorY: (currentScrollY + viewportCenterY) / startScale
                    };
                    debugLog('Pinch Fallback Start', `dist: ${startDist.toFixed(0)}`);
                }
            } catch (err) {
                debugLog('Pinch Fallback Error', err.message);
            }
        }
    }, { passive: false });

    // iOS Safari-optimized touch move - handles pinch zoom only
    let zoomUpdateInProgress = false;
    let lastZoomTime = 0;
    const ZOOM_THROTTLE = 16; // ~60fps max
    
    container.addEventListener('touchmove', (e) => {
        if (e.touches.length >= 2 && pinch && !zoomUpdateInProgress) {
            // Throttle zoom updates to prevent freezing
            const now = Date.now();
            if (now - lastZoomTime < ZOOM_THROTTLE) {
                return;
            }
            lastZoomTime = now;
            // Two finger pinch zoom
            try {
                e.preventDefault();
                e.stopPropagation();
                
                zoomUpdateInProgress = true;
                
                const [t1, t2] = e.touches;
                const curDist = getDistance(t1, t2);
                
                // Validate distance to prevent erratic behavior
                if (curDist < 10 || !isFinite(curDist)) {
                    log('Invalid distance, skipping frame');
                    zoomUpdateInProgress = false;
                    return;
                }
                
                const distanceRatio = curDist / pinch.startDist;
                const newScaleUnclamped = pinch.startScale * distanceRatio;
                const newScale = Math.max(gameState.ui.minZoom, Math.min(gameState.ui.maxZoom, newScaleUnclamped));
                
                // Only update if there's a meaningful change
                if (Math.abs(newScale - (gameState.ui.zoomScale || 1)) < 0.01) {
                    zoomUpdateInProgress = false;
                    return;
                }
                
                const prevScale = gameState.ui.zoomScale || 1;
                
                // Use the locked anchor point from pinch start to prevent jumping
                const rect = container.getBoundingClientRect();
                const viewportCenterX = rect.width / 2;
                const viewportCenterY = rect.height / 2;
                
                // Use stored anchor point instead of recalculating
                const contentCenterX = pinch.anchorX;
                const contentCenterY = pinch.anchorY;
                
                // Calculate new scroll to keep that same content point centered
                const newScrollX = contentCenterX * newScale - viewportCenterX;
                const newScrollY = contentCenterY * newScale - viewportCenterY;
                
                // Read current scroll for logging purposes
                const currentScrollX = container.scrollLeft || 0;
                const currentScrollY = container.scrollTop || 0;
                
                // Log zoom calculation
                const zoomData = {
                    prevScale: prevScale,
                    newScale: newScale,
                    ratio: distanceRatio,
                    fingerDist: curDist,
                    contentCenterX: contentCenterX,
                    contentCenterY: contentCenterY,
                    currentScrollX: currentScrollX,
                    currentScrollY: currentScrollY,
                    newScrollX: newScrollX,
                    newScrollY: newScrollY,
                    viewportCenterX: viewportCenterX,
                    viewportCenterY: viewportCenterY
                };
                
                // Apply scale and scroll SYNCHRONOUSLY (skip heavy logging during zoom)
                gameState.ui.zoomScale = newScale;
                applyMapZoomTransform();
                
                // Apply scroll immediately (no async)
                container.scrollLeft = newScrollX;
                container.scrollTop = newScrollY;
                
                // Light debug update only (skip heavy operations)
                const actualScrollX = container.scrollLeft || 0;
                const actualScrollY = container.scrollTop || 0;
                const deltaX = actualScrollX - newScrollX;
                const deltaY = actualScrollY - newScrollY;
                
                // Only update debug overlay occasionally to reduce DOM thrashing
                if (now % 3 === 0) { // Every 3rd frame
                    debugZoomData({
                        ...zoomData,
                        actualScrollX: actualScrollX,
                        actualScrollY: actualScrollY,
                        deltaX: deltaX,
                        deltaY: deltaY,
                        timing: 0
                    });
                }
                
                // Skip heavy debug logging during active zoom to prevent freezing
                // Only log occasionally for debugging if needed
                if (now % 5 === 0) {
                    debugLog('Zoom', `${newScale.toFixed(2)}`);
                }
                
                zoomUpdateInProgress = false;
                
            } catch (err) {
                log('Error in touchmove:', err);
                zoomUpdateInProgress = false;
                endPinch('touchmove error');
            }
        } else if (pinch && e.touches.length < 2) {
            endPinch('touch count changed during move');
        } else if (e.touches.length >= 2 && !pinch && !gameState.ui.isPinching) {
            // Fallback: try to start pinch during move if we missed touchstart
            debugLog('Pinch Move Fallback', 'starting during move');
            try {
                const [t1, t2] = e.touches;
                const startDist = getDistance(t1, t2);
                
                if (startDist >= 10) {
                    // Store initial anchor point for move fallback pinch
                    const rect = container.getBoundingClientRect();
                    const viewportCenterX = rect.width / 2;
                    const viewportCenterY = rect.height / 2;
                    const currentScrollX = container.scrollLeft || 0;
                    const currentScrollY = container.scrollTop || 0;
                    const startScale = gameState.ui.zoomScale || 1;
                    
                    gameState.ui.isPinching = true;
                    pinch = {
                        startDist,
                        startScale: startScale,
                        startTime: Date.now(),
                        anchorX: (currentScrollX + viewportCenterX) / startScale,
                        anchorY: (currentScrollY + viewportCenterY) / startScale
                    };
                    debugLog('Pinch Move Start', `dist: ${startDist.toFixed(0)}`);
                }
            } catch (err) {
                debugLog('Move Fallback Error', err.message);
            }
        }
    }, { passive: false });

    // iOS Safari-optimized touch end - handles pinch zoom only
    container.addEventListener('touchend', (e) => {
        window.lastTouchCount = e.touches.length;
        log('touchend, remaining touches:', e.touches.length);
        debugLog('Pinch TouchEnd', `${e.touches.length} touches remaining`);
        
        if (e.touches.length < 2 && pinch) {
            // End pinch if less than 2 touches
            try {
                e.preventDefault();
            } catch (err) {
                log('Could not preventDefault on touchend');
            }
            endPinch('touch ended');
        } else if (e.touches.length === 0) {
            // All touches ended - force cleanup any stuck states
            setTimeout(() => {
                if (!gameState.ui.isPinching && !gameState.ui.isPanning) {
                    window.lastTouchCount = 0;
                    debugLog('Force Reset', 'all touches ended');
                    updateDebugOverlay();
                }
            }, 30);
        }
    }, { passive: false });

    // Handle touch cancel (important for iOS Safari)
    container.addEventListener('touchcancel', (e) => {
        log('touchcancel');
        debugLog('Touch Cancel', 'force cleanup');
        if (pinch) {
            endPinch('touch cancelled');
        }
        // Force reset everything on cancel
        window.lastTouchCount = 0;
        gameState.ui.isPinching = false;
        gameState.ui.isPanning = false;
        
        setTimeout(() => {
            debugLog('Cancel Reset', 'all states cleared');
            updateDebugOverlay();
        }, 20);
    }, { passive: false });

    // iOS Safari safety mechanism - periodic state cleanup
    setInterval(() => {
        // If we think we're pinching but have been for more than 3 seconds without movement, reset
        if (gameState.ui.isPinching && pinch && pinch.startTime) {
            const timeSinceStart = Date.now() - pinch.startTime;
            if (timeSinceStart > 3000) {
                debugLog('Timeout Reset', 'pinch too long');
                endPinch('timeout cleanup');
            }
        }
        
        // If touch count doesn't match any active gestures, reset it
        if (window.lastTouchCount > 0 && !gameState.ui.isPinching && !gameState.ui.isPanning) {
            window.lastTouchCount = 0;
            debugLog('Periodic Reset', 'touch count mismatch');
            updateDebugOverlay();
        }
    }, 1000); // Check every second
    
    log('Pinch zoom handlers setup complete');
}

// Visual debugging functions
function updateDebugOverlay() {
    // Only update if debug overlay is visible
    const debugOverlay = document.getElementById('debug-overlay');
    if (!debugOverlay || debugOverlay.classList.contains('hidden')) return;
    
    const debugMode = document.getElementById('debug-mode');
    const debugPan = document.getElementById('debug-pan');
    const debugPinch = document.getElementById('debug-pinch');
    const debugZoom = document.getElementById('debug-zoom');
    const debugPrevZoom = document.getElementById('debug-prev-zoom');
    const debugScrollX = document.getElementById('debug-scroll-x');
    const debugScrollY = document.getElementById('debug-scroll-y');
    const debugViewW = document.getElementById('debug-view-w');
    const debugViewH = document.getElementById('debug-view-h');
    const debugContentX = document.getElementById('debug-content-x');
    const debugContentY = document.getElementById('debug-content-y');
    const debugNewScrollX = document.getElementById('debug-new-scroll-x');
    const debugNewScrollY = document.getElementById('debug-new-scroll-y');
    const debugFingerDist = document.getElementById('debug-finger-dist');
    const debugRatio = document.getElementById('debug-ratio');
    
    if (debugMode) debugMode.textContent = gameState.ui.mapMode;
    if (debugPan) debugPan.textContent = gameState.ui.isPanning ? 'ACTIVE' : 'inactive';
    if (debugPinch) debugPinch.textContent = gameState.ui.isPinching ? 'ACTIVE' : 'inactive';
    if (debugZoom) debugZoom.textContent = (gameState.ui.zoomScale || 1).toFixed(2);
    
    // Update scroll and viewport info
    const container = document.querySelector('.main-display');
    if (container) {
        const rect = container.getBoundingClientRect();
        if (debugScrollX) debugScrollX.textContent = (container.scrollLeft || 0).toFixed(0);
        if (debugScrollY) debugScrollY.textContent = (container.scrollTop || 0).toFixed(0);
        if (debugViewW) debugViewW.textContent = rect.width.toFixed(0);
        if (debugViewH) debugViewH.textContent = rect.height.toFixed(0);
    }
}

function debugLog(event, details = '') {
    const debugEvent = document.getElementById('debug-event');
    const debugTouches = document.getElementById('debug-touches');
    
    if (debugEvent) debugEvent.textContent = event + (details ? ' - ' + details : '');
    if (debugTouches && window.lastTouchCount !== undefined) {
        debugTouches.textContent = window.lastTouchCount;
    }
    
    updateDebugOverlay();
}

function debugZoomData(data) {
    // Only update if debug overlay is visible
    const debugOverlay = document.getElementById('debug-overlay');
    if (!debugOverlay || debugOverlay.classList.contains('hidden')) return;
    
    // Update all the detailed zoom debug fields
    const debugPrevZoom = document.getElementById('debug-prev-zoom');
    const debugContentX = document.getElementById('debug-content-x');
    const debugContentY = document.getElementById('debug-content-y');
    const debugNewScrollX = document.getElementById('debug-new-scroll-x');
    const debugNewScrollY = document.getElementById('debug-new-scroll-y');
    const debugFingerDist = document.getElementById('debug-finger-dist');
    const debugRatio = document.getElementById('debug-ratio');
    const debugActualX = document.getElementById('debug-actual-x');
    const debugActualY = document.getElementById('debug-actual-y');
    const debugDeltaX = document.getElementById('debug-delta-x');
    const debugDeltaY = document.getElementById('debug-delta-y');
    const debugTiming = document.getElementById('debug-timing');
    
    if (debugPrevZoom && data.prevScale) debugPrevZoom.textContent = data.prevScale.toFixed(2);
    if (debugContentX && data.contentCenterX) debugContentX.textContent = data.contentCenterX.toFixed(0);
    if (debugContentY && data.contentCenterY) debugContentY.textContent = data.contentCenterY.toFixed(0);
    if (debugNewScrollX && data.newScrollX) debugNewScrollX.textContent = data.newScrollX.toFixed(0);
    if (debugNewScrollY && data.newScrollY) debugNewScrollY.textContent = data.newScrollY.toFixed(0);
    if (debugFingerDist && data.fingerDist) debugFingerDist.textContent = data.fingerDist.toFixed(0);
    if (debugRatio && data.ratio) debugRatio.textContent = data.ratio.toFixed(3);
    if (debugActualX && data.actualScrollX) debugActualX.textContent = data.actualScrollX.toFixed(0);
    if (debugActualY && data.actualScrollY) debugActualY.textContent = data.actualScrollY.toFixed(0);
    if (debugDeltaX && data.deltaX) debugDeltaX.textContent = data.deltaX.toFixed(0);
    if (debugDeltaY && data.deltaY) debugDeltaY.textContent = data.deltaY.toFixed(0);
    if (debugTiming && data.timing) debugTiming.textContent = data.timing;
    
    updateDebugOverlay();
}

// Map mode switching
function setMapMode(mode) {
    if (mode !== 'move' && mode !== 'select') return;
    
    gameState.ui.mapMode = mode;
    
    // Update button states
    const moveBtn = document.getElementById('move-mode-btn');
    const selectBtn = document.getElementById('select-mode-btn');
    
    if (moveBtn && selectBtn) {
        if (mode === 'move') {
            moveBtn.classList.add('active');
            selectBtn.classList.remove('active');
        } else {
            moveBtn.classList.remove('active');
            selectBtn.classList.add('active');
        }
    }
    
    // Log mode change
    debugLog('Mode Switch', mode);
    console.log('[Map Mode] Switched to:', mode);
}

// Make setMapMode globally accessible
window.setMapMode = setMapMode;

// Zoom behavior logging system
let zoomBehaviorLog = [];
let logSession = {
    startTime: Date.now(),
    sessionId: 'zoom-' + Date.now(),
    userAgent: navigator.userAgent,
    viewport: { width: 0, height: 0 }
};

function initZoomLogging() {
    // Capture initial viewport info
    const container = document.querySelector('.main-display');
    if (container) {
        const rect = container.getBoundingClientRect();
        logSession.viewport = { width: rect.width, height: rect.height };
    }
    
    zoomBehaviorLog.push({
        timestamp: Date.now() - logSession.startTime,
        event: 'SESSION_START',
        data: { ...logSession }
    });
}

function logZoomBehavior(event, data) {
    const logEntry = {
        timestamp: Date.now() - logSession.startTime,
        event: event,
        data: { ...data }
    };
    
    zoomBehaviorLog.push(logEntry);
    
    // Keep only last 100 entries to prevent memory issues
    if (zoomBehaviorLog.length > 100) {
        zoomBehaviorLog = zoomBehaviorLog.slice(-100);
    }
    
    console.log('[ZOOM LOG]', event, data);
}

function downloadZoomLog() {
    const logData = {
        session: logSession,
        totalEntries: zoomBehaviorLog.length,
        logs: zoomBehaviorLog
    };
    
    const jsonString = JSON.stringify(logData, null, 2);
    
    // Try download first, then show text fallback
    try {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `zoom-behavior-${logSession.sessionId}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log('Zoom behavior log downloaded:', logData.totalEntries, 'entries');
    } catch (err) {
        console.log('Download failed, showing text version:', err);
        showZoomLogText();
    }
}

function showZoomLogText() {
    const logData = {
        session: logSession,
        totalEntries: zoomBehaviorLog.length,
        logs: zoomBehaviorLog
    };
    
    const jsonString = JSON.stringify(logData, null, 2);
    
    // Create a modal to show the text
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.9); z-index: 10000; display: flex; 
        align-items: center; justify-content: center; padding: 20px;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: #000; color: #00FF41; padding: 20px; border-radius: 10px; 
        max-width: 90%; max-height: 90%; overflow: auto; font-family: monospace; 
        font-size: 12px; border: 1px solid #00FF41;
    `;
    
    const header = document.createElement('div');
    header.style.cssText = 'margin-bottom: 10px; font-weight: bold; color: #FFFF00;';
    header.textContent = 'Zoom Behavior Log - Select All & Copy:';
    
    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = `
        position: absolute; top: 10px; right: 10px; background: #333; 
        color: white; border: none; padding: 5px 10px; border-radius: 5px;
    `;
    closeBtn.textContent = '✕ Close';
    closeBtn.onclick = () => document.body.removeChild(modal);
    
    const textarea = document.createElement('textarea');
    textarea.style.cssText = `
        width: 100%; height: 400px; background: #000; color: #00FF41; 
        border: 1px solid #333; font-family: monospace; font-size: 11px; 
        padding: 10px; resize: vertical;
    `;
    textarea.value = jsonString;
    textarea.select();
    
    content.appendChild(header);
    content.appendChild(closeBtn);
    content.appendChild(textarea);
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Try to copy to clipboard
    try {
        textarea.select();
        document.execCommand('copy');
        header.textContent = 'Zoom Behavior Log - COPIED TO CLIPBOARD! (You can also select & copy):';
    } catch (err) {
        console.log('Clipboard copy failed:', err);
    }
}

function clearZoomLog() {
    zoomBehaviorLog = [];
    logSession = {
        startTime: Date.now(),
        sessionId: 'zoom-' + Date.now(),
        userAgent: navigator.userAgent,
        viewport: logSession.viewport
    };
    initZoomLogging();
    console.log('Zoom behavior log cleared and reinitialized');
}

// Make logging functions globally accessible
window.downloadZoomLog = downloadZoomLog;
window.showZoomLogText = showZoomLogText;
window.clearZoomLog = clearZoomLog;

// Debug overlay toggle function
function toggleDebugOverlay() {
    const debugOverlay = document.getElementById('debug-overlay');
    if (!debugOverlay) return;
    
    if (debugOverlay.classList.contains('hidden')) {
        debugOverlay.classList.remove('hidden');
        console.log('Debug overlay enabled');
    } else {
        debugOverlay.classList.add('hidden');
        console.log('Debug overlay disabled');
    }
}

// Make debug overlay toggle globally accessible
window.toggleDebugOverlay = toggleDebugOverlay;

function setupPanHandlers() {
    const container = document.querySelector('.main-display');
    if (!container) return;
    
    let isPanning = false;
    let panStart = { x: 0, y: 0 };
    let scrollStart = { x: 0, y: 0 };
    let lastTouchTime = 0;
    let velocityX = 0;
    let velocityY = 0;
    let lastPanX = 0;
    let lastPanY = 0;
    let panAnimationFrame = null;
    
    function startPan(clientX, clientY) {
        // Only allow panning in move mode
        if (gameState.ui.mapMode !== 'move') {
            return false;
        }
        
        // Don't pan if pinching or if tap was recently suppressed
        if (gameState.ui.isPinching || (gameState.ui.suppressTapUntil && Date.now() < gameState.ui.suppressTapUntil)) {
            return false;
        }
        
        isPanning = true;
        gameState.ui.isPanning = true;
        panStart.x = clientX;
        panStart.y = clientY;
        scrollStart.x = container.scrollLeft || 0;
        scrollStart.y = container.scrollTop || 0;
        lastPanX = clientX;
        lastPanY = clientY;
        lastTouchTime = Date.now();
        velocityX = 0;
        velocityY = 0;
        
        // Cancel any ongoing momentum animation
        if (panAnimationFrame) {
            cancelAnimationFrame(panAnimationFrame);
            panAnimationFrame = null;
        }
        
        // Add panning class for visual feedback
        container.style.cursor = 'grabbing';
        
        console.log('[Pan] Started at', clientX, clientY);
        return true;
    }
    
    function updatePan(clientX, clientY) {
        if (!isPanning) return;
        
        const currentTime = Date.now();
        const timeDelta = Math.max(1, currentTime - lastTouchTime);
        
        const deltaX = clientX - panStart.x;
        const deltaY = clientY - panStart.y;
        
        // Calculate velocity for momentum
        const instantVelocityX = (clientX - lastPanX) / timeDelta;
        const instantVelocityY = (clientY - lastPanY) / timeDelta;
        
        // Smooth velocity with exponential moving average
        velocityX = velocityX * 0.5 + instantVelocityX * 0.5;
        velocityY = velocityY * 0.5 + instantVelocityY * 0.5;
        
        lastPanX = clientX;
        lastPanY = clientY;
        lastTouchTime = currentTime;
        
        // Apply the pan by scrolling (inverted for natural scrolling)
        const newScrollLeft = scrollStart.x - deltaX;
        const newScrollTop = scrollStart.y - deltaY;
        
        container.scrollTo({
            left: newScrollLeft,
            top: newScrollTop,
            behavior: 'instant'
        });
    }
    
    function endPan() {
        if (!isPanning) return;
        
        isPanning = false;
        gameState.ui.isPanning = false;
        container.style.cursor = '';
        
        // Apply momentum if velocity is significant
        if (Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1) {
            applyMomentum();
        }
        
        console.log('[Pan] Ended with velocity', velocityX, velocityY);
        debugLog('Pan Function End', `velocity: ${velocityX.toFixed(2)}, ${velocityY.toFixed(2)}`);
    }
    
    function applyMomentum() {
        const friction = 0.95; // Deceleration factor
        const minVelocity = 0.1;
        
        function animateMomentum() {
            if (Math.abs(velocityX) < minVelocity && Math.abs(velocityY) < minVelocity) {
                velocityX = 0;
                velocityY = 0;
                panAnimationFrame = null;
                return;
            }
            
            // Apply velocity to scroll position
            container.scrollLeft -= velocityX * 10;
            container.scrollTop -= velocityY * 10;
            
            // Apply friction
            velocityX *= friction;
            velocityY *= friction;
            
            panAnimationFrame = requestAnimationFrame(animateMomentum);
        }
        
        animateMomentum();
    }
    
    // Touch handlers for mobile (including iOS Safari)
    container.addEventListener('touchstart', (e) => {
        window.lastTouchCount = e.touches.length;
        debugLog('Pan TouchStart', `${e.touches.length} touches, mode: ${gameState.ui.mapMode}`);
        
        // In move mode, handle panning
        if (gameState.ui.mapMode === 'move') {
            // Only handle single touch for panning (pinch uses 2 touches)
            if (e.touches.length === 1 && !gameState.ui.isPinching) {
                const touch = e.touches[0];
                if (startPan(touch.clientX, touch.clientY)) {
                    // Prevent default to avoid any text selection or other browser behavior
                    e.preventDefault();
                    debugLog('Pan Started', `at ${touch.clientX},${touch.clientY}`);
                }
            } else if (e.touches.length > 1 && isPanning) {
                // Stop panning if user starts pinching
                endPan();
                debugLog('Pan Stopped', 'multi-touch detected');
            }
        }
        // In select mode, let hex selection work normally
    }, { passive: false });
    
    let lastPanTime = 0;
    const PAN_THROTTLE = 16; // ~60fps max
    
    container.addEventListener('touchmove', (e) => {
        window.lastTouchCount = e.touches.length;
        if (isPanning && e.touches.length === 1 && !gameState.ui.isPinching) {
            // Throttle pan updates to prevent freezing
            const now = Date.now();
            if (now - lastPanTime >= PAN_THROTTLE) {
                lastPanTime = now;
                const touch = e.touches[0];
                updatePan(touch.clientX, touch.clientY);
                // Reduce debug logging frequency
                if (now % 3 === 0) {
                    debugLog('Pan', `${touch.clientX},${touch.clientY}`);
                }
            }
        } else if (e.touches.length > 1 && isPanning) {
            // Stop panning if user starts pinching
            endPan();
            debugLog('Pan Interrupted', 'multi-touch');
        }
    }, { passive: false });
    
    container.addEventListener('touchend', (e) => {
        window.lastTouchCount = e.touches.length;
        debugLog('Pan TouchEnd', `${e.touches.length} touches remaining`);
        // End pan if no touches remain
        if (isPanning && e.touches.length === 0) {
            endPan();
            debugLog('Pan Ended', 'no touches left');
        }
    }, { passive: false });
    
    container.addEventListener('touchcancel', () => {
        if (isPanning) {
            endPan();
        }
    }, { passive: false });
    
    // Mouse handlers for desktop
    container.addEventListener('mousedown', (e) => {
        if (e.button === 0) { // Left mouse button only
            if (startPan(e.clientX, e.clientY)) {
                e.preventDefault();
            }
        }
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isPanning) {
            e.preventDefault();
            updatePan(e.clientX, e.clientY);
        }
    });
    
    document.addEventListener('mouseup', () => {
        if (isPanning) {
            endPan();
        }
    });
    
    // Prevent context menu on right-click during pan
    container.addEventListener('contextmenu', (e) => {
        if (isPanning) {
            e.preventDefault();
        }
    });
    
    console.log('[Pan] Pan handlers setup complete');
}

// Button-based zoom controls (keeps viewport center stable)
function zoomToScale(targetScale) {
    const container = document.querySelector('.main-display');
    const svg = document.querySelector('#ascii-display svg');
    const wrapper = document.getElementById('map-zoom');
    if (!container || (!svg && !wrapper)) return;
    const prevScale = gameState.ui.zoomScale || 1;
    const newScale = Math.max(gameState.ui.minZoom, Math.min(gameState.ui.maxZoom, targetScale));
    if (Math.abs(newScale - prevScale) < 0.001) return;
    const rect = container.getBoundingClientRect();
    const viewCX = rect.width / 2;
    const viewCY = rect.height / 2;
    const sx = container.scrollLeft;
    const sy = container.scrollTop;
    const contentCX = (sx + viewCX) / prevScale;
    const contentCY = (sy + viewCY) / prevScale;
    gameState.ui.zoomScale = newScale;
    applyMapZoomTransform();
    const newScrollLeft = contentCX * newScale - viewCX;
    const newScrollTop = contentCY * newScale - viewCY;
    container.scrollTo({ left: newScrollLeft, top: newScrollTop });
}

function zoomIn() {
    const step = 1.25;
    zoomToScale((gameState.ui.zoomScale || 1) * step);
}

function zoomOut() {
    // Jump directly to minimum zoom (25%) as requested
    zoomToScale(gameState.ui.minZoom || 0.25);
}

// Handle clicks on the galaxy map
function handleMapClick(e) {
    // Calculate character-based coordinates from pixel coordinates
    const rect = e.target.getBoundingClientRect();
    const scrollLeft = e.target.scrollLeft || e.target.parentElement.scrollLeft;
    const scrollTop = e.target.scrollTop || e.target.parentElement.scrollTop;
    
    // Estimate character size (approximate)
    const charWidth = 8.4; // Approximate width of monospace characters
    const lineHeight = 19.6; // Approximate line height
    
    const clickX = Math.floor((e.clientX - rect.left + scrollLeft) / charWidth);
    const clickY = Math.floor((e.clientY - rect.top + scrollTop) / lineHeight);
    
    // Get the grid sector for this click
    const sectorKey = getGridSector(clickX, clickY);
    
    // Update UI state
    gameState.ui.selectedSector = sectorKey;
    gameState.ui.highlightedSector = sectorKey;
    
    // Disabled sector tooltips - old orthogonal grid system
    // if (hasKnownSystemInSector(sectorKey)) {
    //     // Show known system info (you'll need to map which system)
    //     showSystemTooltip('sol', e.clientX, e.clientY); // Placeholder
    // } else {
    //     // Show sector scan info
    //     showSectorTooltip(sectorKey, e.clientX, e.clientY);
    // }
    
    // Disabled sector highlight - old orthogonal grid system
    // updateSectorHighlight(sectorKey);
}

// Show system tooltip
function showSystemTooltip(systemId, x, y) {
    const tooltip = document.getElementById('system-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
    
    const system = systemData[systemId];
    if (!system) return;
    
    const tooltipHtml = `
        <div id="system-tooltip" class="system-tooltip" style="left: ${x}px; top: ${y}px;">
            <div class="system-tooltip-content">
                <div class="system-tooltip-header">
                    <h3>${system.name}</h3>
                    <span class="system-type">${system.type}</span>
                </div>
                <div class="system-tooltip-body">
                    <p class="system-description">${system.description}</p>
                    <div class="system-stats">
                        <div class="stat">Population: <span>${system.population}</span></div>
                        <div class="stat">Threat Level: <span>${system.threat}</span></div>
                        <div class="stat">Resources: <span>${system.resources}</span></div>
                    </div>
                </div>
            </div>
        </div>`;
    
    document.body.insertAdjacentHTML('beforeend', tooltipHtml);
    
    // Don't auto-hide - let user click to dismiss
}

// Update screen content
function updateScreen(screenName) {
    console.log('Updating screen to:', screenName);
    
    gameState.currentScreen = screenName;
    const display = document.getElementById('ascii-display');
    
    if (screens[screenName]) {
        const content = screens[screenName]() || '';
        const isHtmlLike = /^\s*</.test(content);
        if (isHtmlLike) {
            // Wrap map SVG with a zoom container for better iOS transform behavior
            if (screenName === 'map') {
                display.innerHTML = `<div id="map-zoom">${content}</div>`;
            } else {
                display.innerHTML = content;
            }
            display.style.whiteSpace = 'normal';
            display.classList.add('html-mode');
            // Reapply map zoom transform if rendering the map
            if (screenName === 'map') {
                try { applyMapZoomTransform(); } catch (e) { /* ignore */ }
            }
        } else {
            display.textContent = content;
            display.style.whiteSpace = 'pre';
            display.classList.remove('html-mode');
        }
    } else {
        display.textContent = `Screen "${screenName}" not found.`;
        display.style.whiteSpace = 'pre';
    }
    
    // Update status panel
    updateStatusPanel();
    
    // Update action buttons based on screen
    updateActionButtons(screenName);
    
    // Show/hide mode buttons based on screen
    const moveBtn = document.getElementById('move-mode-btn');
    const selectBtn = document.getElementById('select-mode-btn');
    if (moveBtn && selectBtn) {
        if (screenName === 'map') {
            moveBtn.style.display = 'block';
            selectBtn.style.display = 'block';
        } else {
            moveBtn.style.display = 'none';
            selectBtn.style.display = 'none';
        }
    }
    
    // Re-attach hex click handlers if on map screen
    if (screenName === 'map') {
        attachHexHandlers();
        // Center map on player ship after a brief delay to ensure SVG is rendered
        setTimeout(() => centerMapOnPlayer(), 500);
        
        // Start orbital animation if player is in a system (with transition)
        setTimeout(() => {
            const {x, y, z} = gameState.player.hexLocation;
            const knownSystem = Object.values(gameState.galaxy.knownSystems)
                .find(system => system.x === x && system.y === y && system.z === z);
            const genSystemId = `sys_${x}_${y}_${z}`;
            const generatedSystem = gameState.galaxy.generatedSystems.get(genSystemId);
            const systemData = knownSystem || generatedSystem;
            if (systemData && (systemData.type || '').toLowerCase() !== 'empty') {
                const hexWidth = 130;
                const hexHeight = hexWidth * (Math.sqrt(3) / 2);
                const center = cubeToPixel(x, y, z, hexWidth, hexHeight);
                startOrbitWithTransition(center.x, center.y, 35);
            }
        }, 600);
    }
}

// Update static status panel
function updateStatusPanel() {
    const locEl = document.getElementById('current-location');
    const apEl = document.getElementById('action-points');
    const crEl = document.getElementById('credits');
    const shipEl = document.getElementById('ship-name');
    if (locEl) locEl.textContent = gameState.player.location;
    if (apEl) apEl.textContent = `${gameState.player.actionPoints}/${gameState.player.maxActionPoints}`;
    if (crEl) crEl.textContent = gameState.player.credits.toLocaleString();
    if (shipEl) shipEl.textContent = gameState.player.shipName;
}

// Update action buttons based on current screen
function updateActionButtons(screen) {
    // Legend and center buttons are always visible
    // Action buttons are now in the hex status box for each selected hex
}

// Handle light drive action (range-limited)
function handleLightDrive() {
    if (gameState.currentScreen === 'map') {
        // Don't allow navigation if ship is already moving
        if (gameState.animation.isShipMoving) {
            return;
        }
        
        // Check if a hex is selected
        if (!gameState.ui.selectedHex) {
            alert('Select a destination hex first.');
            return;
        }
        
        // Check if trying to navigate to current location
        const {x: destX, y: destY, z: destZ} = parseCubeId(gameState.ui.selectedHex);
        const {x: playerX, y: playerY, z: playerZ} = gameState.player.hexLocation;
        if (destX === playerX && destY === playerY && destZ === playerZ) {
            alert('Already at this location!');
            return;
        }
        
        // Distance & dynamic AP cost
        const dist = cubeDistance(destX, destY, destZ, playerX, playerY, playerZ);
        if (dist < 1 || dist > 5) {
            showGameDialog('Out of Range', 'Light Drive can reach up to 5 hexes. Select a closer destination.');
            return;
        }
        const apCost = 1 + dist; // 1→2AP, 5→6AP
        if (gameState.player.actionPoints < apCost) {
            showGameDialog('Insufficient AP', `Light Drive ${dist} hex(es) costs ${apCost} AP. Your AP are depleted.`);
            return;
        }
        
        // Record AP cost for completion and start animation
        gameState.ui.pendingNavApCost = apCost;
        // Start light drive animation
        animateShipWarp(gameState.ui.selectedHex);
        
    } else if (gameState.currentScreen === 'ship') {
        if (gameState.player.credits >= 100) {
            gameState.player.credits -= 100;
            alert('Ship repairs completed. Hull integrity restored to 100%.');
            updateScreen('ship');
        } else {
            alert('Insufficient credits for repairs!');
        }
    } else if (gameState.currentScreen === 'guild') {
        alert('Guild missions interface would open here.');
    } else if (gameState.currentScreen === 'crisis') {
        if (gameState.player.actionPoints >= 6) {
            gameState.player.actionPoints -= 6;
            gameState.player.credits += 500;
            alert('Investigation successful! Ancient technology recovered.');
            updateScreen('ship');
        }
    }
}

// Handle warp drive action (warp lane endpoints only)
function handleWarpDrive() {
    if (gameState.currentScreen === 'map') {
        // Don't allow navigation if ship is already moving
        if (gameState.animation.isShipMoving) {
            return;
        }
        
        // Check if a hex is selected
        if (!gameState.ui.selectedHex) {
            alert('Select a destination system first.');
            return;
        }
        
        // Check if player has enough action points (5 AP for warp drive)
        if (gameState.player.actionPoints < 5) {
            showGameDialog('Insufficient AP', 'Warp Drive requires 5 AP. Your AP are depleted.');
            return;
        }
        
        // Check if trying to warp to current location
        const {x: destX, y: destY, z: destZ} = parseCubeId(gameState.ui.selectedHex);
        const {x: playerX, y: playerY, z: playerZ} = gameState.player.hexLocation;
        if (destX === playerX && destY === playerY && destZ === playerZ) {
            alert('Already at this location!');
            return;
        }
        
        // Validation is handled by showWarpDestinations(), so this should always be valid
        
        // Start warp drive animation (curved path animation)
        animateWarpDrive(gameState.ui.selectedHex);
        
    }
}

// Show warp destination selection dialog
function showWarpDestinations() {
    const availableDestinations = getAvailableWarpDestinations();
    
    if (availableDestinations.length === 0) {
        alert('No warp lanes available from this location.');
        return;
    }
    
    if (availableDestinations.length === 1) {
        // Only one destination - warp directly
        const destinationSystem = gameState.galaxy.knownSystems[availableDestinations[0]];
        const {x, y, z} = offsetToCube(destinationSystem.col, destinationSystem.row);
        const destHexId = cubeId(x, y, z);
        gameState.ui.selectedHex = destHexId;
        handleWarpDrive();
    } else {
        // Multiple destinations - show selection arrows on warp lanes
        showWarpSelectionArrows(availableDestinations);
    }
}

// Display selection arrows on warp lanes
function showWarpSelectionArrows(availableDestinations) {
    const svg = document.querySelector('#ascii-display svg');
    if (!svg) return;
    
    // Find which known system the player is at
    const {x, y, z} = gameState.player.hexLocation;
    const {col: playerCol, row: playerRow} = cubeToOffset(x, y, z);
    
    // Find the current system from knownSystems using cube coordinates
    let currentSystemKey = null;
    let currentSystem = null;
    for (const [key, system] of Object.entries(gameState.galaxy.knownSystems)) {
        // Compare cube coordinates directly
        if (system.x === x && system.y === y && system.z === z) {
            currentSystemKey = key;
            currentSystem = system;
            break;
        }
    }
    
    if (!currentSystem) {
        console.error('Player not at a known system!');
        return;
    }
    
    const hexWidth = gameState.galaxy.hexGrid.hexWidth;
    const hexHeight = hexWidth * (Math.sqrt(3) / 2);
    const currentPos = cubeToPixel(currentSystem.x, currentSystem.y, currentSystem.z, hexWidth, hexHeight);
    
    // Remove any existing selection arrows
    const existingArrows = svg.querySelector('#warp-selection-arrows');
    if (existingArrows) existingArrows.remove();
    
    // Create selection arrows group
    let arrowsGroup = '<g id="warp-selection-arrows">';
    
    // Debug: Show current player position (using stored system coordinates)
    arrowsGroup += `<circle cx="${currentPos.x}" cy="${currentPos.y}" r="10" fill="cyan" opacity="0.8"/>`;
    arrowsGroup += `<text x="${currentPos.x + 15}" y="${currentPos.y}" fill="cyan" font-size="12">${currentSystemKey}: ${currentCol},${currentRow}</text>`;
    
    availableDestinations.forEach((systemKey, index) => {
        const destinationSystem = gameState.galaxy.knownSystems[systemKey];
        const destPos = cubeToPixel(destinationSystem.x, destinationSystem.y, destinationSystem.z, hexWidth, hexHeight);
        
        // Find the actual warp lane to determine its direction
        let laneDirection = null;
        for (const lane of gameState.galaxy.warpLanes) {
            if (lane.from === currentSystemKey && lane.to === systemKey) {
                laneDirection = 'forward';
                break;
            } else if (lane.to === currentSystemKey && lane.from === systemKey) {
                laneDirection = 'reverse';
                break;
            }
        }
        
        // Use the EXACT same function that draws the warp lanes, but respect the lane direction!
        let debugRoute;
        if (laneDirection === 'reverse') {
            // Lane is defined as destination→current, so draw it that way to match the green lane
            debugRoute = createCurvedRoute(destPos.x, destPos.y, currentPos.x, currentPos.y);
        } else {
            // Lane is defined as current→destination
            debugRoute = createCurvedRoute(currentPos.x, currentPos.y, destPos.x, destPos.y);
        }
        // Replace the green stroke with yellow for debug visibility
        const yellowDebugRoute = debugRoute.replace('stroke="#00FF41"', 'stroke="yellow"')
                                          .replace('stroke-width="2"', 'stroke-width="4"')
                                          .replace('stroke-opacity="0.6"', 'stroke-opacity="0.9"')
                                          .replace('stroke-dasharray="8,4"', 'stroke-dasharray="none"');
        arrowsGroup += yellowDebugRoute;
        
        // Now extract the control point from the curve calculation (same as createCurvedRoute)
        // BUT respect the lane direction!
        let controlX, controlY;
        if (laneDirection === 'reverse') {
            // Lane goes from dest to current, so calculate control point that way
            const midX = (destPos.x + currentPos.x) / 2;
            const midY = (destPos.y + currentPos.y) / 2;
            const dx = currentPos.x - destPos.x;  // Note: reversed!
            const dy = currentPos.y - destPos.y;  // Note: reversed!
            controlX = midX - dy * 0.2;
            controlY = midY + dx * 0.2;
        } else {
            // Lane goes from current to dest
            const midX = (currentPos.x + destPos.x) / 2;
            const midY = (currentPos.y + destPos.y) / 2;
            const dx = destPos.x - currentPos.x;
            const dy = destPos.y - currentPos.y;
            controlX = midX - dy * 0.2;
            controlY = midY + dx * 0.2;
        }
        
        // Debug: Mark control point
        arrowsGroup += `<circle cx="${controlX}" cy="${controlY}" r="5" fill="blue" opacity="0.8"/>`;
        
        // Debug: Mark destination
        arrowsGroup += `<circle cx="${destPos.x}" cy="${destPos.y}" r="8" fill="green" opacity="0.8"/>`;
        arrowsGroup += `<text x="${destPos.x + 10}" y="${destPos.y}" fill="green" font-size="12">${systemKey}: ${destCol},${destRow}</text>`;
        
        // Debug: Log values to find NaN source
        console.log(`Lane ${currentSystemKey} to ${systemKey}:`, {
            laneDirection,
            currentPos,
            destPos,
            controlX,
            controlY
        });
        
        // Position arrow along the curve - but for reversed lanes, we start from the other end!
        let arrowX, arrowY, t;
        if (laneDirection === 'reverse') {
            // For reversed lanes, we want the arrow near the current position
            // But the curve goes from dest to current, so use high t value (95% = near the end which is current)
            t = 0.95;
            arrowX = Math.pow(1-t, 2) * destPos.x + 2*(1-t)*t * controlX + Math.pow(t, 2) * currentPos.x;
            arrowY = Math.pow(1-t, 2) * destPos.y + 2*(1-t)*t * controlY + Math.pow(t, 2) * currentPos.y;
        } else {
            // For forward lanes, arrow near the start (current position)
            t = 0.05;
            arrowX = Math.pow(1-t, 2) * currentPos.x + 2*(1-t)*t * controlX + Math.pow(t, 2) * destPos.x;
            arrowY = Math.pow(1-t, 2) * currentPos.y + 2*(1-t)*t * controlY + Math.pow(t, 2) * destPos.y;
        }
        
        console.log(`Arrow position for ${systemKey}:`, { arrowX, arrowY, t });
        
        // Debug: Show actual arrow position
        arrowsGroup += `<circle cx="${arrowX}" cy="${arrowY}" r="12" fill="red" opacity="0.9"/>`;
        arrowsGroup += `<text x="${arrowX + 15}" y="${arrowY + 5}" fill="red" font-size="14" font-weight="bold">→${systemKey}</text>`;
        
        // Calculate arrow rotation using curve tangent at arrow position
        let nextX, nextY;
        if (laneDirection === 'reverse') {
            // For reversed lanes, calculate tangent on the reversed curve
            const nextT = Math.max(t - 0.01, 0); // Go backwards along curve
            nextX = Math.pow(1-nextT, 2) * destPos.x + 2*(1-nextT)*nextT * controlX + Math.pow(nextT, 2) * currentPos.x;
            nextY = Math.pow(1-nextT, 2) * destPos.y + 2*(1-nextT)*nextT * controlY + Math.pow(nextT, 2) * currentPos.y;
        } else {
            // For forward lanes
            const nextT = Math.min(t + 0.01, 1);
            nextX = Math.pow(1-nextT, 2) * currentPos.x + 2*(1-nextT)*nextT * controlX + Math.pow(nextT, 2) * destPos.x;
            nextY = Math.pow(1-nextT, 2) * currentPos.y + 2*(1-nextT)*nextT * controlY + Math.pow(nextT, 2) * destPos.y;
        }
        const arrowAngle = Math.atan2(nextY - arrowY, nextX - arrowX) * (180 / Math.PI);
        
        // Skip if arrow position is invalid
        if (isNaN(arrowX) || isNaN(arrowY)) {
            console.error(`Invalid arrow position for ${systemKey}: x=${arrowX}, y=${arrowY}, controlX=${controlX}, controlY=${controlY}`);
            console.error(`Current: ${JSON.stringify(currentPos)}, Dest: ${JSON.stringify(destPos)}`);
            // Don't add this arrow, but continue with others
        } else {
        
        // Create pulsing arrow (arrow rotates, text stays horizontal)
        arrowsGroup += `<g class="warp-selection-arrow" 
                          transform="translate(${arrowX}, ${arrowY})"
                          style="cursor: pointer;"
                          onclick="selectWarpDestination('${systemKey}')">
                          <path d="M -10,-8 L -10,8 L 15,0 Z" 
                                fill="#00FF41" 
                                stroke="#FFFFFF" 
                                stroke-width="2" 
                                opacity="0.9"
                                transform="rotate(${arrowAngle})">
                            <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" />
                            <animateTransform attributeName="transform" 
                                              type="scale" 
                                              values="1;1.2;1" 
                                              dur="1s" 
                                              repeatCount="indefinite" 
                                              additive="sum"/>
                          </path>
                          <text x="0" y="-25" text-anchor="middle" fill="#00FF41" font-size="12" font-weight="bold">
                            ${destinationSystem.name || systemKey}
                            <animate attributeName="opacity" values="0.7;1;0.7" dur="1s" repeatCount="indefinite" />
                          </text>
                        </g>`;
        } // Close the else block for valid arrow positions
    });
    
    arrowsGroup += '</g>';
    svg.insertAdjacentHTML('beforeend', arrowsGroup);
}

// Handle warp destination selection from arrow click
function selectWarpDestination(systemKey) {
    // Remove selection arrows
    const arrowsGroup = document.querySelector('#warp-selection-arrows');
    if (arrowsGroup) arrowsGroup.remove();
    
    // Set destination and start warp
    const destinationSystem = gameState.galaxy.knownSystems[systemKey];
    // Systems are already stored in cube coordinates!
    const destHexId = cubeId(destinationSystem.x, destinationSystem.y, destinationSystem.z);
    gameState.ui.selectedHex = destHexId;
    handleWarpDrive();
}

// Handle scan action
function handleScan() {
    if (gameState.currentScreen === 'map') {
        if (gameState.ui.selectedHex) {
            scanCurrentHex();
        } else {
            alert('Select a hex on the map first, then scan.');
        }
    } else if (gameState.currentScreen === 'ship') {
        alert('Ship upgrade interface would open here.');
    } else if (gameState.currentScreen === 'guild') {
        alert('Guild voting interface would open here.');
    }
}

// Show sector tooltip with scan data
function showSectorTooltip(sectorKey, x, y) {
    const tooltip = document.getElementById('sector-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
    
    const isScanned = gameState.galaxy.grid.scannedSectors.has(sectorKey);
    const sectorData = gameState.galaxy.grid.sectorData.get(sectorKey);
    const markerData = gameState.galaxy.grid.markedSectors.get(sectorKey);
    
    let content = '';
    if (!isScanned) {
        content = `
            <div class="sector-tooltip-header">
                <h3>Sector ${sectorKey}</h3>
                <span class="sector-status">UNSCANNED</span>
            </div>
            <div class="sector-tooltip-body">
                <p class="sector-description">Unknown sector. Scanning required to reveal contents.</p>
                <div class="scan-cost">Scan Cost: 1 AP</div>
            </div>`;
    } else {
        const { probability, discoveryType } = sectorData;
        content = `
            <div class="sector-tooltip-header">
                <h3>Sector ${sectorKey}</h3>
                <span class="sector-status">SCANNED</span>
            </div>
            <div class="sector-tooltip-body">
                <p class="sector-description">Long-range sensors detect ${probability}% chance of ${discoveryType} discovery.</p>
                <div class="sector-stats">
                    <div class="stat">Discovery Type: <span>${discoveryType}</span></div>
                    <div class="stat">Probability: <span>${probability}%</span></div>
                </div>
                ${markerData ? `<div class="sector-marker">Marked: ${markerData.type}</div>` : ''}
            </div>`;
    }
    
    const tooltipHtml = `
        <div id="sector-tooltip" class="system-tooltip" style="left: ${x}px; top: ${y}px;">
            <div class="system-tooltip-content">
                ${content}
            </div>
        </div>`;
    
    document.body.insertAdjacentHTML('beforeend', tooltipHtml);
}

// Update sector visual highlight
function updateSectorHighlight(sectorKey) {
    // Remove existing highlights
    const existingHighlights = document.querySelectorAll('.sector-highlight');
    existingHighlights.forEach(el => el.remove());
    
    // Calculate sector bounds in character coordinates
    const bounds = getSectorBounds(sectorKey);
    
    // Convert character coordinates to pixel coordinates
    const charWidth = 8.4;
    const lineHeight = 19.6;
    
    const pixelBounds = {
        x: bounds.x1 * charWidth,
        y: bounds.y1 * lineHeight,
        width: (bounds.x2 - bounds.x1) * charWidth,
        height: (bounds.y2 - bounds.y1) * lineHeight
    };
    
    // Create highlight overlay
    const highlight = document.createElement('div');
    highlight.className = 'sector-highlight';
    highlight.style.cssText = `
        position: absolute;
        left: ${pixelBounds.x}px;
        top: ${pixelBounds.y}px;
        width: ${pixelBounds.width}px;
        height: ${pixelBounds.height}px;
        background: rgba(0, 255, 65, 0.1);
        border: 2px solid #00FF41;
        pointer-events: none;
        z-index: 100;
    `;
    
    // Add to the main display container
    const mainDisplay = document.querySelector('.main-display');
    if (mainDisplay) {
        mainDisplay.style.position = 'relative';
        mainDisplay.appendChild(highlight);
    }
}

// Hex interaction handlers
function attachHexHandlers() {
    // Attach click handlers to hex cells
    const hexCells = document.querySelectorAll('.hex-cell');
    hexCells.forEach(cell => {
        cell.addEventListener('click', handleHexClick);
        cell.addEventListener('touchstart', handleHexClick);
    });
}

function handleHexClick(e) {
    // Only handle hex clicks in select mode
    if (gameState.ui.mapMode !== 'select') {
        return;
    }
    
    // Ignore if a pinch gesture is active or recently ended
    if (gameState.ui && (gameState.ui.isPinching || (gameState.ui.suppressTapUntil && Date.now() < gameState.ui.suppressTapUntil))) {
        return;
    }
    // Ignore multi-touch starts
    if (e && e.touches && e.touches.length > 1) {
        return;
    }
    e.stopPropagation();
    
    // Block interactions during ship movement
    if (gameState.animation.isShipMoving) {
        return;
    }
    
    const col = parseInt(e.target.getAttribute('data-hex-col'));
    const row = parseInt(e.target.getAttribute('data-hex-row'));
    const {x, y, z} = offsetToCube(col, row);
    const hexId = cubeId(x, y, z);
    
    // If in tile state mode, apply state instead of normal interaction
    if (gameState.ui.tileStateMode) {
        applyTileState(col, row);
        return;
    }
    
    // Update UI state immediately
    gameState.ui.selectedHex = hexId;
    gameState.ui.highlightedHex = hexId;
    
    // Clear previous highlights and highlight new cell immediately
    highlightHex(e.target);
    
    // Show status box immediately
    showHexStatusBox(hexId);
}

function highlightHex(hexElement) {
    // Remove ALL previous highlights (both visual and class)
    const prevHighlights = document.querySelectorAll('.hex-highlighted');
    prevHighlights.forEach(el => {
        el.classList.remove('hex-highlighted');
        el.style.stroke = 'transparent';
        el.style.strokeWidth = '1';
        el.style.strokeOpacity = '0';
        el.style.fill = 'transparent';
    });
    
    // Make ONLY the selected hex visible and highlighted
    hexElement.classList.add('hex-highlighted');
    hexElement.style.stroke = '#00FF41';
    hexElement.style.strokeWidth = '3';
    hexElement.style.strokeOpacity = '1';
    hexElement.style.fill = 'rgba(0, 255, 65, 0.1)';
}

function showHexStatusBox(hexId) {
    // Hide existing status box
    hideHexStatusBox();
    // Auto-reveal wormhole path when clicking a termination
    if (isWormholeTermination(hexId)) {
        gameState.ui.revealedWormhole = hexId;
        updateWormholesOnly();
    }
    
    const {x, y, z} = parseCubeId(hexId);
    const {col, row} = cubeToOffset(x, y, z);
    const isScanned = gameState.galaxy.hexGrid.scannedHexes.has(hexId);
    const isVisited = gameState.galaxy.hexGrid.visitedHexes.has(hexId);
    const isClaimed = gameState.galaxy.hexGrid.claimedHexes.has(hexId);
    const hexData = gameState.galaxy.hexGrid.hexData.get(hexId);
    const markerData = gameState.galaxy.hexGrid.markedHexes.get(hexId);
    
    // Generate scan buttons only if not visited or claimed and capability allows
    const canScan = !isVisited && !isClaimed;
    let scanButton = '';
    if (canScan) {
        if (hasScanCapability('quick')) {
            scanButton += `<button class="hex-action-btn" onclick="scanCurrentHex()">Quick Scan (1 AP)</button>`;
        } else {
            scanButton += `<button class="hex-action-btn" disabled title="Scanner unavailable. Upgrade ship.">Quick Scan</button>`;
        }
        if (hasScanCapability('sweep')) {
            scanButton += `<button class="hex-action-btn" onclick="sweepScan()">Sweep Scan (2 AP)</button>`;
        }
        if (hasScanCapability('focus')) {
            scanButton += `<button class="hex-action-btn" onclick="focusedScan()">Focused Scan (2 AP)</button>`;
        }
    } else {
        scanButton = `<button class="hex-action-btn" disabled title="Already ${isVisited ? 'visited' : 'claimed'} - no need to scan">Scan</button>`;
    }
    
    // Check for discovered resources
    const hexResources = gameState.galaxy.resources.hexResources.get(hexId);

    function getSystemIcon(t) {
        const k = (t || '').toLowerCase();
        if (k.includes('home') || k === 'homeworld') return '★';
        if (k.includes('outpost')) return '●';
        if (k.includes('hub')) return '◈';
        if (k.includes('blackhole')) return '☯';
        if (k.includes('research')) return '⌬';
        if (k.includes('mining')) return '⛏';
        if (k.includes('industrial')) return '⚙';
        if (k.includes('pirate')) return '☠';
        if (k.includes('frontier')) return '⛺';
        return '◎';
    }
    function getSiteIcon(s) {
        const k = (s || '').toLowerCase();
        if (k.includes('asteroid')) return '⛏';
        if (k.includes('comet')) return '❄';
        if (k.includes('derelict')) return '⚙';
        if (k.includes('trader')) return '🚀';
        if (k.includes('gas')) return '⚗';
        if (k.includes('ruins')) return '🏛';
        if (k.includes('nebula')) return '☁';
        if (k.includes('pirate')) return '💰';
        if (k.includes('probe')) return '🛰';
        if (k.includes('phenomena')) return '⭐';
        return '⬢';
    }
    function renderChips() {
        const chips = [];
        if (isClaimed) chips.push('<span class="chip claimed">CLAIMED</span>');
        else if (isVisited) chips.push('<span class="chip visited">VISITED</span>');
        else if (isScanned) chips.push('<span class="chip scanned">SCANNED</span>');
        return `<div class="chips">${chips.join('')}</div>`;
    }
    function renderMeta() {
        const player = gameState.player.hexLocation;
        const dist = cubeDistance(player.x, player.y, player.z, x, y, z);
        const ap = `${gameState.player.actionPoints}/${gameState.player.maxActionPoints}`;
        return `<div class="meta-line">Cube ${hexId} • Offset ${col},${row} • Dist ${dist}H • AP ${ap}</div>`;
    }
    
    // Check if this hex contains a system (known or generated)
    const knownSystem = Object.values(gameState.galaxy.knownSystems)
        .find(system => system.x === x && system.y === y && system.z === z);
    const genSystemId = `sys_${x}_${y}_${z}`;
    const generatedSystem = gameState.galaxy.generatedSystems.get(genSystemId);
    const systemData = knownSystem || generatedSystem;
    
    let content = '';
    const chipsHtml = renderChips();
    const metaHtml = renderMeta();
    // Only reveal resource site details when the hex is visited or claimed
    if ((isVisited || isClaimed) && hexResources && !systemData) {
        // Special resource site discovered
        const tradableResources = Array.from(hexResources.tradable.entries())
            .filter(([type, data]) => data.current > 0);
        const extractableResources = Array.from(hexResources.extractable.entries())
            .filter(([type, data]) => data.current > 0);
        
        const resourceList = [];
        tradableResources.forEach(([type, data]) => {
            resourceList.push(`${data.current} ${type} (Trade)`);
        });
        extractableResources.forEach(([type, data]) => {
            const availability = checkResourceAvailability(type);
            const status = availability.canExtract ? 'Extract' : 'Locked';
            resourceList.push(`${data.current} ${type} (${status})`);
        });

        // Build compact resource badges for popup
        const badgeSet = new Set();
        function makeBadge(type, source){
            const info = RESOURCE_TYPES[type];
            if (!info) return '';
            const short = (info.category === 'Legal' ? 'L' : 'I') + info.rarity;
            const cls = info.category === 'Legal' ? 'badge-legal' : 'badge-illegal';
            const icon = source === 'tradable' ? '💼' : '⛏';
            const key = `${type}:${source}`;
            if (badgeSet.has(key)) return '';
            badgeSet.add(key);
            return `<span class="resource-badge ${cls}" title="${type} ${source}">${icon} ${short}</span>`;
        }
        const badges = [];
        tradableResources.forEach(([type]) => { const b = makeBadge(type, 'tradable'); if (b) badges.push(b); });
        extractableResources.forEach(([type]) => { const b = makeBadge(type, 'extractable'); if (b) badges.push(b); });
        
        const titleIcon = getSiteIcon(hexResources.siteName || hexResources.siteType || 'Site');
        // Build resource cards grid
        const cards = [];
        for (const [type, data] of hexResources.tradable) {
            const info = RESOURCE_TYPES[type];
            const badge = info ? (info.category === 'Legal' ? `💼 L${info.rarity}` : `💼 I${info.rarity}`) : '💼';
            cards.push(`<div class="res-card"><span class="res-icon">${badge}</span><span class="qty">x${data.current}</span><button class="res-btn">Collect</button></div>`);
        }
        for (const [type, data] of hexResources.extractable) {
            const info = RESOURCE_TYPES[type];
            const badge = info ? (info.category === 'Legal' ? `⛏ L${info.rarity}` : `⛏ I${info.rarity}`) : '⛏';
            const can = info ? (!info.extractionEquipment || gameState.player.ship.extractionEquipment.has(info.extractionEquipment)) : false;
            const disabled = can ? '' : 'disabled title="Requires equipment"';
            cards.push(`<div class="res-card"><span class="res-icon">${badge}</span><span class="qty">x${data.current}</span><button class="res-btn" ${disabled}>Extract</button></div>`);
        }
        const actionsRow = `<div class="actions-row">${generateDriveButtons(col, row)}<button class="hex-action-btn" onclick="showResourceInterface('${hexId}')">Resources</button><button class="hex-action-btn">Mark</button></div>`;
        content = `
            <div class="status-box-header">
                <div class="status-title"><span class="icon">${titleIcon}</span> ${hexResources.siteName || 'Resource Site'}</div>
                ${chipsHtml}
                <button class="close-btn" onclick="hideHexStatusBox()">✕</button>
            </div>
            ${metaHtml}
            <div class="status-box-body">
                <div class="resource-badges">${badges.join('')}</div>
                <p class="desc">${hexResources.description || ''}</p>
                <div class="resource-grid">${cards.slice(0,6).join('')}${cards.length>6?`<div class="res-more">+${cards.length-6} more</div>`:''}</div>
                ${actionsRow}
                ${markerData ? `<div class="hex-marker">Marked: ${markerData.type}</div>` : ''}
            </div>`;
    } else if ((isVisited || isClaimed) && systemData) {
        const titleIcon = getSystemIcon(systemData.type);
        // Add Trade button if player is at this location
        const isPlayerHere = (gameState.player.hexLocation.x === x && 
                             gameState.player.hexLocation.y === y && 
                             gameState.player.hexLocation.z === z);
        const tradeButton = isPlayerHere ? 
            `<button class="hex-action-btn" onclick="openTradingWindow()">Trade</button>` : '';
        const actionsRow = `<div class="actions-row">${generateDriveButtons(col, row)}${scanButton}${tradeButton}<button class="hex-action-btn">Mark</button><button class="hex-action-btn">Details</button></div>`;
        content = `
            <div class="status-box-header">
                <div class="status-title"><span class="icon">${titleIcon}</span> ${systemData.name || 'System'}</div>
                ${chipsHtml}
                <button class="close-btn" onclick="hideHexStatusBox()">✕</button>
            </div>
            ${metaHtml}
            <div class="status-box-body">
                <div class="system-stats">Type: ${(systemData.type || 'system').toUpperCase()}</div>
                ${actionsRow}
            </div>`;
    } else if (isVisited || isClaimed) {
        const actionsRow = `<div class="actions-row">${generateDriveButtons(col, row)}${scanButton}<button class="hex-action-btn">Mark</button></div>`;
        content = `
            <div class="status-box-header">
                <div class="status-title"><span class="icon">⬢</span> Empty Space</div>
                ${chipsHtml}
                <button class="close-btn" onclick="hideHexStatusBox()">✕</button>
            </div>
            ${metaHtml}
            <div class="status-box-body">
                <p>No significant features detected in this sector.</p>
                ${actionsRow}
            </div>`;
    } else if (!isScanned) {
        const actionsRow = `<div class="actions-row">${scanButton}${generateDriveButtons(col, row)}<button class="hex-action-btn">Mark</button></div>`;
        content = `
            <div class="status-box-header">
                <div class="status-title"><span class="icon">⬢</span> Hex ${hexId}</div>
                ${chipsHtml}
                <button class="close-btn" onclick="hideHexStatusBox()">✕</button>
            </div>
            ${metaHtml}
            <div class="status-box-body">
                <p>Unknown hex. Scanning required to reveal contents.</p>
                ${actionsRow}
            </div>`;
    } else {
        // Scanned state (not visited/claimed)
        const scan = hexData && hexData.scan;
        if (scan) {
            const pPct = Math.round(scan.p * 100);
            const confLabel = scan.conf === 'strong' ? 'strong' : (scan.conf === 'med' ? 'medium' : 'weak');
            const actionsRow = `<div class="actions-row">${generateDriveButtons(col, row)}${scanButton}<button class="hex-action-btn">Mark</button></div>`;
            content = `
                <div class="status-box-header">
                    <div class="status-title"><span class="icon">⬢</span> Hex ${hexId}</div>
                    ${chipsHtml}
                    <button class="close-btn" onclick="hideHexStatusBox()">✕</button>
                </div>
                ${metaHtml}
                <div class="status-box-body">
                    <div class="scan-card"><div class="big-p">${pPct}%</div><div class="hint">Hint: <strong>${scan.dir}</strong> (${confLabel})</div></div>
                    ${actionsRow}
                    ${markerData ? `<div class="hex-marker">Marked: ${markerData.type}</div>` : ''}
                </div>`;
        } else {
            const actionsRow = `<div class="actions-row">${generateDriveButtons(col, row)}${scanButton}<button class="hex-action-btn">Mark</button></div>`;
            content = `
                <div class="status-box-header">
                    <div class="status-title"><span class="icon">⬢</span> Hex ${hexId}</div>
                    ${chipsHtml}
                    <button class="close-btn" onclick="hideHexStatusBox()">✕</button>
                </div>
                ${metaHtml}
                <div class="status-box-body">
                    <p>Long-range scan completed. No significant features detected in this sector.</p>
                    ${actionsRow}
                    ${markerData ? `<div class="hex-marker">Marked: ${markerData.type}</div>` : ''}
                </div>`;
        }
    }

    // If this hex is a wormhole termination, add a reveal/hide button
    if (isWormholeTermination(hexId)) {
        const reveal = gameState.ui.revealedWormhole === hexId;
        const btn = `<button class="hex-action-btn" onclick="toggleWormholeReveal('${hexId}')">${reveal ? 'Hide' : 'Reveal'} Wormhole Path</button>`;
        content = content.replace('<div class="hex-actions">', `<div class="hex-actions">${btn}`);
    }
    
    const statusBox = document.createElement('div');
    statusBox.id = 'hex-status-box';
    statusBox.className = 'hex-status-box-top active';
    statusBox.innerHTML = content;
    
    // Add click handler to dismiss when touching the status box itself
    statusBox.addEventListener('click', (e) => {
        // Only dismiss if clicking on the status box background, not buttons
        if (e.target === statusBox || e.target.classList.contains('status-box-header') || e.target.classList.contains('status-box-body')) {
            hideHexStatusBox();
            clearAllHexHighlights();
        }
    });
    
    document.body.appendChild(statusBox);

    // Append NPC Encounter section if player is in this hex and an NPC is co-located
    try {
        const player = gameState.player.hexLocation;
        const playerHex = cubeId(player.x, player.y, player.z);
        if (hexId === playerHex && gameState.npc && gameState.npc._encounter) {
            const npc = gameState.npc._encounter;
            const body = statusBox.querySelector('.status-box-body');
            if (body) {
                const roleLabel = npc.role === 'trader' ? 'Trader' : (npc.role === 'pirate' ? 'Pirate' : 'Research');
                const actions = [];
                actions.push(`<button class="hex-action-btn" onclick="hailNpc('${npc.id}')">Hail</button>`);
                if (npc.role === 'trader') actions.push(`<button class="hex-action-btn" onclick="tradeWithNpc('${npc.id}')">Trade</button>`);
                if (npc.role === 'pirate') actions.push(`<button class="hex-action-btn" onclick="fleeNpc('${npc.id}')">Flee</button>`);
                if (npc.role === 'research') actions.push(`<button class="hex-action-btn" onclick="infoFromNpc('${npc.id}')">Info</button>`);
                const html = `
                    <div class="npc-encounter">
                        <div class="status-box-subheader"><span class="icon">🚀</span> NPC Encounter</div>
                        <div class="npc-row">
                            <div class="npc-meta">Type: ${roleLabel} • Rep: ${npc.reputation || 0}</div>
                            <div class="actions-row">${actions.join('')}</div>
                        </div>
                    </div>`;
                body.insertAdjacentHTML('beforeend', html);
            }
        }
    } catch (e) { /* ignore */ }
}

function hideHexStatusBox() {
    const statusBox = document.getElementById('hex-status-box');
    if (statusBox) {
        statusBox.remove();
    }
    // Hide any auto-revealed wormhole path
    gameState.ui.revealedWormhole = null;
    updateWormholesOnly();
}

function formatHex(id) { return id; }

function getSystemDetailsAtHex(hexId) {
    const { x, y, z } = parseCubeId(hexId);
    const genId = `sys_${x}_${y}_${z}`;
    const generated = gameState.galaxy.generatedSystems.get(genId);
    if (generated) return { name: generated.name, type: generated.type, x, y, z };
    const knownEntry = Object.entries(gameState.galaxy.knownSystems).find(([_, s]) => s.x === x && s.y === y && s.z === z);
    if (knownEntry) {
        const [key, s] = knownEntry;
        return { name: s.name || key, type: s.type || 'known', x, y, z };
    }
    return null;
}

function getWormholeDetailsAtHex(hexId) {
    const lanes = gameState.galaxy.wormholes?.lanes || [];
    const connects = lanes.filter(l => l.a === hexId || l.b === hexId).map(l => ({ other: l.a === hexId ? l.b : l.a }));
    return connects;
}

function getResourceDetailsAtHex(hexId) {
    const r = gameState.galaxy.resources.hexResources.get(hexId);
    if (!r) return null;
    const name = r.siteName || r.specialSite?.name || 'Resource Site';
    const description = r.description || r.specialSite?.description || '';
    const tags = [r.dangerous ? 'Hazardous' : null, r.oneTime ? 'One-Time' : null, r.variable ? 'Variable' : null].filter(Boolean).join(' · ');
    return { name, description, tags };
}

function showDiscoveryLog() {
    const existing = document.getElementById('discovery-log');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'discovery-log';
    const content = document.createElement('div');
    content.className = 'modal-content';

    // Toolbar (filters + sorting)
    const toolbar = `
        <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-bottom:10px;">
            <div style="display:flex; gap:8px; align-items:center;">
                <label style="display:flex; gap:4px; align-items:center;"><input type="checkbox" id="flt-sys" checked> Systems</label>
                <label style="display:flex; gap:4px; align-items:center;"><input type="checkbox" id="flt-res" checked> Resources</label>
                <label style="display:flex; gap:4px; align-items:center;"><input type="checkbox" id="flt-wh" checked> Wormholes</label>
                <label style="display:flex; gap:4px; align-items:center;"><input type="checkbox" id="flt-haz"> Hazards only</label>
            </div>
            <div style="margin-left:auto; display:flex; gap:6px; align-items:center;">
                <span style="color:#88CC99; font-size:12px;">Sort by</span>
                <select id="sort-mode" style="background:#001A08; color:#00FF41; border:1px solid #004D1A; padding:4px;">
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="name">Name</option>
                    <option value="kind">Kind</option>
                </select>
            </div>
        </div>`;

    content.innerHTML = `
        <div class="modal-header">Discovery Log</div>
        ${toolbar}
        <div class="modal-body" style="max-height:60vh; overflow:auto;">
            <div class="log-container"><div id="log-list"></div></div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:12px;">
            <button class="dev-menu-item" style="width:auto; padding:6px 12px;" id="discovery-log-close">Close</button>
        </div>`;

    modal.appendChild(content);
    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    content.querySelector('#discovery-log-close').addEventListener('click', close);

    // Render helper
    function render() {
        const list = content.querySelector('#log-list');
        if (!list) return;
        const d = gameState.galaxy.discoveries || { log: [] };
        let entries = Array.isArray(d.log) ? d.log.slice() : [];

        // Filters
        const fltSys = content.querySelector('#flt-sys').checked;
        const fltRes = content.querySelector('#flt-res').checked;
        const fltWh = content.querySelector('#flt-wh').checked;
        const fltHaz = content.querySelector('#flt-haz').checked;
        entries = entries.filter(e => {
            if (e.kind === 'system' && !fltSys) return false;
            if (e.kind === 'resource' && !fltRes) return false;
            if (e.kind === 'wormhole' && !fltWh) return false;
            if (fltHaz && e.kind === 'resource' && !(e.flags && e.flags.dangerous)) return false;
            return true;
        });

        // Sorting
        const sortMode = content.querySelector('#sort-mode').value;
        entries.sort((a, b) => {
            if (sortMode === 'oldest') return (a.timestamp||0) - (b.timestamp||0);
            if (sortMode === 'name') {
                const an = (a.meta && a.meta.name) ? a.meta.name : '';
                const bn = (b.meta && b.meta.name) ? b.meta.name : '';
                return an.localeCompare(bn);
            }
            if (sortMode === 'kind') return a.kind.localeCompare(b.kind) || ((b.timestamp||0) - (a.timestamp||0));
            // default newest
            return (b.timestamp||0) - (a.timestamp||0);
        });

        // Build rows
        const fmtTime = (ts) => {
            if (!ts) return '';
            try { return new Date(ts).toLocaleString(); } catch { return String(ts); }
        };
        const rows = entries.map(e => {
            const name = (e.meta && e.meta.name) || (e.kind === 'wormhole' ? 'Wormhole Terminus' : (e.kind === 'resource' ? 'Resource Site' : 'System'));
            const subtype = (e.kind === 'system') ? (e.meta && e.meta.type || '') : (e.kind === 'resource' ? (e.flags && e.flags.dangerous ? 'Hazardous' : 'Resource') : 'Wormhole');
            const meta = fmtTime(e.timestamp);
            return `<div class="log-row">
                <span class="log-name">${name}</span>
                <span class="log-type">${subtype}</span>
                <span class="log-meta">${meta}</span>
                <button class="resource-btn" data-replay="${e.timestamp}">Replay</button>
            </div>`;
        }).join('');
        list.innerHTML = rows || '<div class="log-empty">No discoveries yet.</div>';

        // Bind replay buttons
        list.querySelectorAll('button[data-replay]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-replay');
                const entry = entries.find(x => String(x.timestamp) === id);
                if (entry) showGameDialog(entry.title, entry.body);
            });
        });
    }

    // Hook controls
    content.querySelector('#flt-sys').addEventListener('change', render);
    content.querySelector('#flt-res').addEventListener('change', render);
    content.querySelector('#flt-wh').addEventListener('change', render);
    content.querySelector('#flt-haz').addEventListener('change', render);
    content.querySelector('#sort-mode').addEventListener('change', render);

    render();
}

// Global animations enable/disable toggle
function setAnimationsEnabled(enabled) {
    gameState.animation.animationsEnabled = !!enabled;
    if (!enabled) {
        pauseAnimations();
    } else {
        // Re-enable SVG animations
        try {
            const svg = document.querySelector('#ascii-display svg');
            if (svg && typeof svg.unpauseAnimations === 'function') {
                svg.unpauseAnimations();
            }
        } catch (e) { /* ignore */ }
        gameState.animation.isPaused = false;
        // Restart orbital if applicable
        const {x, y, z} = gameState.player.hexLocation;
        const knownSystem = Object.values(gameState.galaxy.knownSystems)
            .find(system => system.x === x && system.y === y && system.z === z);
        const genSystemId = `sys_${x}_${y}_${z}`;
        const generatedSystem = gameState.galaxy.generatedSystems.get(genSystemId);
        const systemData = knownSystem || generatedSystem;
        if (systemData && (systemData.type || '').toLowerCase() !== 'empty') {
            const hexWidth = 130;
            const hexHeight = hexWidth * (Math.sqrt(3) / 2);
            const center = cubeToPixel(x, y, z, hexWidth, hexHeight);
            startOrbitalAnimation(center.x, center.y, 35);
        }
        // Also recompute NPC encounters after resume
        try { _recomputeNpcPositions(); } catch (e) { /* ignore */ }
    }
}

// Smoothly move the ship from center to first orbit position, then start orbit animation
function startOrbitWithTransition(centerX, centerY, orbitRadius, durationMs = 500) {
    stopOrbitalAnimation();
    const shipEl = document.querySelector('#player-ship .player-ship-symbol');
    if (!shipEl) return;
    if (!gameState.animation.animationsEnabled) {
        // No transition; just place at orbit and leave static
        const angleDeg = (typeof gameState.player.orbitalAngle === 'number') ? gameState.player.orbitalAngle : 0;
        const radians = angleDeg * Math.PI / 180;
        const x = centerX + Math.cos(radians) * orbitRadius;
        const y = centerY + Math.sin(radians) * orbitRadius;
        const r = angleDeg + 90;
        shipEl.setAttribute('transform', `translate(${x}, ${y}) rotate(${r})`);
        return;
    }
    const startTransform = shipEl.getAttribute('transform') || `translate(${centerX}, ${centerY}) rotate(0)`;
    // Determine target position on orbit using current orbitalAngle
    const angleDeg = (typeof gameState.player.orbitalAngle === 'number') ? gameState.player.orbitalAngle : 0;
    const radians = angleDeg * Math.PI / 180;
    const targetX = centerX + Math.cos(radians) * orbitRadius;
    const targetY = centerY + Math.sin(radians) * orbitRadius;
    const targetRot = angleDeg + 90;
    // Parse current translate and rotate
    const match = /translate\(([-\d\.]+),\s*([-\d\.]+)\)\s*rotate\(([-\d\.]+)\)/.exec(startTransform);
    let fromX = centerX, fromY = centerY, fromRot = 0;
    if (match) {
        fromX = parseFloat(match[1]);
        fromY = parseFloat(match[2]);
        fromRot = parseFloat(match[3]);
    }
    const t0 = performance.now();
    function step(now) {
        const t = Math.min(1, (now - t0) / durationMs);
        const ease = t * t * (3 - 2 * t); // smoothstep
        const x = fromX + (targetX - fromX) * ease;
        const y = fromY + (targetY - fromY) * ease;
        const r = fromRot + (targetRot - fromRot) * ease;
        shipEl.setAttribute('transform', `translate(${x}, ${y}) rotate(${r})`);
        if (t < 1) {
            requestAnimationFrame(step);
        } else {
            // Promote element to orbiting id and start continuous animation
            gameState.player.orbitalAngle = angleDeg; // preserve angle for orbit start
            shipEl.id = 'orbiting-ship';
            startOrbitalAnimation(centerX, centerY, orbitRadius);
        }
    }
    requestAnimationFrame(step);
}

// Game-styled dialog (modal) for warnings and info
function showGameDialog(title, message) {
    // Remove existing dialog if present
    const existing = document.getElementById('game-dialog');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'game-dialog';

    const content = document.createElement('div');
    content.className = 'modal-content';
    content.innerHTML = `
        <div class="modal-header">${title || 'Notice'}</div>
        <div class="modal-body" style="margin:10px 0 14px 0; line-height:1.5;">${message || ''}</div>
        <div style="display:flex; justify-content:flex-end; gap:8px;">
            <button class="dev-menu-item" style="width:auto; padding:6px 12px;" id="game-dialog-ok">OK</button>
        </div>
    `;
    modal.appendChild(content);
    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    content.querySelector('#game-dialog-ok').addEventListener('click', close);
}

// Build discovery narrative (title/body/meta) for reuse (dialog + log)
function buildDiscoveryNarrative(kind, payload) {
    let title = 'Discovery';
    let body = '';
    let meta = {};

    if (kind === 'system') {
        const { name, type, x, y, z, details } = payload;
        title = `Discovery: ${name}`;
        const flavor = {
            homeworld: 'Familiar beacons welcome your return. Civilization hums below.',
            outpost: 'A lonely transponder clicks through the static. An outpost endures.',
            hub: 'Traffic lanes braid the void. Commerce and whispers flow here.',
            research: 'Sterile light flickers amid experiments best left unnamed.',
            industrial: 'Refineries pulse in rhythm; profit smolders in the dark.',
            mining: 'Tethers and booms claw at the rock, hungry for ore.',
            frontier: 'New flags in old stars. Frontiers rarely stay quiet.',
            pirate: 'Cold eyes track your signature. Choose your approach wisely.',
            blackhole: 'Space groans. Instruments lie. The night looks back. ',
            default: 'A new star on your charts. Opportunity awaits.'
        };
        const typeKey = (type || 'default').toLowerCase();
        const line = flavor[typeKey] || flavor.default;
        const info = [];
        if (details?.description) info.push(details.description);
        if (details?.population) info.push(`Population: ${details.population}`);
        if (details?.threat) info.push(`Threat: ${details.threat}`);
        if (details?.resources) info.push(`Known assets: ${details.resources}`);
        body = `"${line}"

Coordinates: ${x},${y},${z}
Type: ${type || 'Unknown'}${info.length ? `
${info.join('\n')}` : ''}`;
        meta = { name, type, x, y, z };
    } else if (kind === 'resource') {
        const { siteName, description, hexId, dangerous, oneTime } = payload;
        title = `Discovery: ${siteName}`;
        const tags = [dangerous ? 'Hazardous' : null, oneTime ? 'One-Time Site' : null].filter(Boolean);
        const tagLine = tags.length ? ` [${tags.join(' · ')}]` : '';
        const flavor = dangerous ? 'Caution: Unstable readings spiking across the board.' : 'Sensors confirm viable yields nearby.';
        body = `"${flavor}"

Hex: ${hexId}${tagLine}
${description || ''}`;
        meta = { name: siteName, type: 'resource', tags: tags.join(' · ') };
    } else if (kind === 'wormhole') {
        const { hexId } = payload;
        title = `Discovery: Wormhole Terminus`;
        const flavor = 'An event horizon ripples against reality, whispering of elsewhere.';
        body = `"${flavor}"

Hex: ${hexId}
Destination: Unknown`;
        meta = { name: 'Wormhole Terminus', type: 'wormhole' };
    }

    return { title, body, meta };
}

// Discovery dialog with small narrative flair
function showDiscoveryDialog(kind, payload) {
    const { title, body } = buildDiscoveryNarrative(kind, payload);
    showGameDialog(title, body);
}

// Evaluate and show first-time discovery dialogs for a destination
function handleFirstDiscoveries(destinationHexId, discoveredResources) {
    try {
        if (!gameState.galaxy.discoveries) {
            gameState.galaxy.discoveries = { systems: new Set(), resources: new Set(), wormholes: new Set() };
        }

        const { x, y, z } = parseCubeId(destinationHexId);
        const systemId = `sys_${x}_${y}_${z}`;
        const generatedSystem = gameState.galaxy.generatedSystems.get(systemId);
        const knownSystemEntry = Object.entries(gameState.galaxy.knownSystems).find(([_, sys]) => sys.x === x && sys.y === y && sys.z === z);
        const knownSystem = knownSystemEntry ? { key: knownSystemEntry[0], ...knownSystemEntry[1] } : null;

        // System first
        if ((generatedSystem || knownSystem) && !gameState.galaxy.discoveries.systems.has(destinationHexId)) {
            const sys = generatedSystem || knownSystem;
            let details = null;
            const sysKey = knownSystem ? knownSystem.key : null;
            if (sysKey && typeof systemData !== 'undefined') {
                details = systemData[sysKey.toLowerCase()] || null;
            }
            const built = buildDiscoveryNarrative('system', { name: sys.name, type: sys.type, x, y, z, details });
            gameState.galaxy.discoveries.systems.add(destinationHexId);
            gameState.galaxy.discoveries.log.push({ kind: 'system', hexId: destinationHexId, timestamp: Date.now(), title: built.title, body: built.body, meta: built.meta });
            showGameDialog(built.title, built.body);
            return; // show one at a time
        }

        // Wormhole next
        const lanes = (gameState.galaxy.wormholes && Array.isArray(gameState.galaxy.wormholes.lanes)) ? gameState.galaxy.wormholes.lanes : [];
        const isWormholeEnd = lanes.some(l => l.a === destinationHexId || l.b === destinationHexId);
        if (isWormholeEnd && !gameState.galaxy.discoveries.wormholes.has(destinationHexId)) {
            const built = buildDiscoveryNarrative('wormhole', { hexId: destinationHexId });
            gameState.galaxy.discoveries.wormholes.add(destinationHexId);
            gameState.galaxy.discoveries.log.push({ kind: 'wormhole', hexId: destinationHexId, timestamp: Date.now(), title: built.title, body: built.body, meta: built.meta });
            showGameDialog(built.title, built.body);
            return;
        }

        // Resource last
        if (discoveredResources && !gameState.galaxy.discoveries.resources.has(destinationHexId)) {
            const siteName = discoveredResources.siteName || (discoveredResources.specialSite && discoveredResources.specialSite.name) || 'Resource Site';
            const description = discoveredResources.description || (discoveredResources.specialSite && discoveredResources.specialSite.description) || '';
            const built = buildDiscoveryNarrative('resource', { siteName, description, hexId: destinationHexId, dangerous: !!discoveredResources.dangerous, oneTime: !!discoveredResources.oneTime });
            gameState.galaxy.discoveries.resources.add(destinationHexId);
            gameState.galaxy.discoveries.log.push({ kind: 'resource', hexId: destinationHexId, timestamp: Date.now(), title: built.title, body: built.body, meta: built.meta, flags: { dangerous: !!discoveredResources.dangerous, oneTime: !!discoveredResources.oneTime } });
            showGameDialog(built.title, built.body);
        }
    } catch (e) {
        console.warn('Discovery handling failed:', e);
    }
}

function showResourceInterface(hexId) {
    const resources = gameState.galaxy.resources.hexResources.get(hexId);
    if (!resources) return;
    
    // Support both new (siteName/description) and old (specialSite) shapes
    const site = resources.specialSite || { name: resources.siteName || 'Resource Site', description: resources.description || '' };
    const player = gameState.player;
    
    let interfaceContent = `
        <div class="resource-interface-header">
            <h3>${site.name}</h3>
            <button onclick="hideResourceInterface()" class="close-btn">✕</button>
        </div>
        <div class="resource-interface-body">
            <div class="site-description">
                <p>${site.description}</p>
                <p class="hex-coords">Hex ${hexId}</p>
            </div>
            
            <div class="cargo-status">
                <h4>Cargo Hold: ${player.cargo.usedSpace}/${player.cargo.capacity} units</h4>
            </div>`;
    
    // Show tradable resources
    if (resources.tradable && resources.tradable.size > 0) {
        interfaceContent += `
            <div class="resource-section">
                <h4>Available Resources (Ready for Collection)</h4>
                <div class="resource-list">`;
        
        for (const [resourceType, quantity] of resources.tradable) {
            const resourceInfo = RESOURCE_TYPES[resourceType];
            const canTrade = player.cargo.usedSpace < player.cargo.capacity && quantity > 0;
            const buttonClass = canTrade ? 'resource-btn' : 'resource-btn disabled';
            const buttonText = canTrade ? 'Take (Free)' : (quantity === 0 ? 'Depleted' : 'Cargo Full');
            
            interfaceContent += `
                <div class="resource-item">
                    <div class="resource-info">
                        <span class="resource-name">${resourceType}</span>
                        <span class="resource-category ${resourceInfo.category.toLowerCase()}">${resourceInfo.category}</span>
                        <span class="resource-quantity">×${quantity}</span>
                        <span class="resource-price">${resourceInfo.basePrice[0]}-${resourceInfo.basePrice[1]} credits</span>
                    </div>
                    <button class="${buttonClass}" onclick="tradeResource('${hexId}', '${resourceType}', 'tradable')" ${!canTrade ? 'disabled' : ''}>${buttonText}</button>
                </div>`;
        }
        
        interfaceContent += `</div></div>`;
    }
    
    // Show extractable resources
    if (resources.extractable && resources.extractable.size > 0) {
        interfaceContent += `
            <div class="resource-section">
                <h4>Extractable Resources (1 AP Required)</h4>
                <div class="resource-list">`;
        
        for (const [resourceType, quantity] of resources.extractable) {
            const resourceInfo = RESOURCE_TYPES[resourceType];
            const hasEquipment = !resourceInfo.extractionEquipment || player.ship.extractionEquipment.has(resourceInfo.extractionEquipment);
            const canExtract = hasEquipment && player.cargo.usedSpace < player.cargo.capacity && quantity > 0 && player.actionPoints >= 1;
            
            let buttonText = 'Extract (1 AP)';
            let buttonClass = 'resource-btn';
            
            if (!hasEquipment) {
                buttonText = `Need ${resourceInfo.extractionEquipment}`;
                buttonClass = 'resource-btn disabled';
            } else if (quantity === 0) {
                buttonText = 'Depleted';
                buttonClass = 'resource-btn disabled';
            } else if (player.cargo.usedSpace >= player.cargo.capacity) {
                buttonText = 'Cargo Full';
                buttonClass = 'resource-btn disabled';
            } else if (player.actionPoints < 1) {
                buttonText = 'No AP';
                buttonClass = 'resource-btn disabled';
            }
            
            interfaceContent += `
                <div class="resource-item">
                    <div class="resource-info">
                        <span class="resource-name">${resourceType}</span>
                        <span class="resource-category ${resourceInfo.category.toLowerCase()}">${resourceInfo.category}</span>
                        <span class="resource-quantity">×${quantity}</span>
                        <span class="resource-price">${resourceInfo.basePrice[0]}-${resourceInfo.basePrice[1]} credits</span>
                        ${resourceInfo.extractionEquipment ? `<span class="equipment-required">Requires: ${resourceInfo.extractionEquipment}</span>` : ''}
                    </div>
                    <button class="${buttonClass}" onclick="tradeResource('${hexId}', '${resourceType}', 'extractable')" ${!canExtract ? 'disabled' : ''}>${buttonText}</button>
                </div>`;
        }
        
        interfaceContent += `</div></div>`;
    }
    
    interfaceContent += `
        </div>`;
    
    const resourceInterface = document.createElement('div');
    resourceInterface.id = 'resource-interface';
    resourceInterface.className = 'resource-interface';
    resourceInterface.innerHTML = interfaceContent;
    
    document.body.appendChild(resourceInterface);
}

function hideResourceInterface() {
    const resourceInterface = document.getElementById('resource-interface');
    if (resourceInterface) {
        resourceInterface.remove();
    }
}

function tradeResource(hexId, resourceType, sourceType) {
    const resources = gameState.galaxy.resources.hexResources.get(hexId);
    if (!resources) return;
    
    const player = gameState.player;
    const resourceInfo = RESOURCE_TYPES[resourceType];
    
    // Check cargo space
    if (player.cargo.usedSpace >= player.cargo.capacity) {
        alert('Cargo hold is full!');
        return;
    }
    
    let sourceMap;
    let apCost = 0;
    
    if (sourceType === 'tradable') {
        sourceMap = resources.tradable;
    } else if (sourceType === 'extractable') {
        sourceMap = resources.extractable;
        apCost = 1;
        
        // Check equipment requirement
        if (resourceInfo.extractionEquipment && !player.ship.extractionEquipment.has(resourceInfo.extractionEquipment)) {
            alert(`Extraction requires: ${resourceInfo.extractionEquipment}`);
            return;
        }
        
        // Check AP
        if (player.actionPoints < apCost) {
            alert('Insufficient Action Points for extraction!');
            return;
        }
    }
    
    const currentQuantity = sourceMap.get(resourceType) || 0;
    if (currentQuantity <= 0) {
        alert('Resource depleted!');
        return;
    }
    
    // Deduct AP if extracting
    if (apCost > 0) {
        player.actionPoints -= apCost;
    }
    
    // Remove from source
    sourceMap.set(resourceType, currentQuantity - 1);
    
    // Add to cargo
    const currentCargoAmount = player.cargo.contents.get(resourceType) || 0;
    player.cargo.contents.set(resourceType, currentCargoAmount + 1);
    player.cargo.usedSpace += 1;
    
    // Refresh the interface
    hideResourceInterface();
    showResourceInterface(hexId);
    
    // Update UI
    updatePlayerUI();
    // Save after sale
    autoSave();
    // Save after action
    autoSave();
}

// Extraction Equipment System
const EXTRACTION_EQUIPMENT = {
    'Basic Mining Drill': {
        cost: 500,
        description: 'Basic extraction tool for common materials',
        unlocks: ['Legal_2', 'Illegal_2']
    },
    'Advanced Mining Drill': {
        cost: 1500,
        description: 'Heavy-duty extraction for rare materials',
        unlocks: ['Legal_3', 'Illegal_3']
    },
    'Quantum Extractor': {
        cost: 5000,
        description: 'Exotic matter collection device',
        unlocks: ['Legal_4', 'Illegal_4']
    },
    'Molecular Harvester': {
        cost: 15000,
        description: 'Gas and particle harvesting system',
        unlocks: ['Legal_5', 'Illegal_5']
    },
    'Exotic Matter Processor': {
        cost: 50000,
        description: 'Dangerous artifact handling equipment',
        unlocks: ['Legal_6', 'Illegal_6']
    }
};

function showEquipmentShop() {
    let shopContent = `
        <div class="resource-interface-header">
            <h3>Equipment Shop</h3>
            <button onclick="hideEquipmentShop()" class="close-btn">✕</button>
        </div>
        <div class="resource-interface-body">
            <div class="cargo-status">
                <h4>Credits: ¢${gameState.player.credits}</h4>
            </div>
            
            <div class="resource-section">
                <h4>Owned Equipment</h4>
                <div class="equipment-list">`;
    
    if (gameState.player.ship.extractionEquipment.size === 0) {
        shopContent += '<p style="color: #666; font-style: italic;">No equipment owned</p>';
    } else {
        for (const equipment of gameState.player.ship.extractionEquipment) {
            const equipData = EXTRACTION_EQUIPMENT[equipment];
            shopContent += `
                <div class="equipment-item owned">
                    <div class="equipment-info">
                        <span class="equipment-name">${equipment}</span>
                        <span class="equipment-description">${equipData.description}</span>
                    </div>
                    <span class="owned-label">OWNED</span>
                </div>`;
        }
    }
    
    shopContent += `</div></div>
            
            <div class="resource-section">
                <h4>Available Equipment</h4>
                <div class="equipment-list">`;
    
    for (const [equipName, equipData] of Object.entries(EXTRACTION_EQUIPMENT)) {
        const owned = gameState.player.ship.extractionEquipment.has(equipName);
        const canAfford = gameState.player.credits >= equipData.cost;
        
        if (owned) continue; // Skip owned equipment
        
        const buttonClass = canAfford ? 'resource-btn' : 'resource-btn disabled';
        const buttonText = canAfford ? `Buy ¢${equipData.cost}` : 'Insufficient Credits';
        
        shopContent += `
            <div class="equipment-item">
                <div class="equipment-info">
                    <span class="equipment-name">${equipName}</span>
                    <span class="equipment-description">${equipData.description}</span>
                    <span class="equipment-unlocks">Unlocks: ${equipData.unlocks.join(', ')}</span>
                </div>
                <button class="${buttonClass}" onclick="buyEquipment('${equipName}')" ${!canAfford ? 'disabled' : ''}>${buttonText}</button>
            </div>`;
    }
    
    shopContent += `</div></div></div>`;
    
    const equipmentShop = document.createElement('div');
    equipmentShop.id = 'equipment-shop';
    equipmentShop.className = 'resource-interface';
    equipmentShop.innerHTML = shopContent;
    
    document.body.appendChild(equipmentShop);
}

function hideEquipmentShop() {
    const equipmentShop = document.getElementById('equipment-shop');
    if (equipmentShop) {
        equipmentShop.remove();
    }
}

function buyEquipment(equipmentName) {
    const equipment = EXTRACTION_EQUIPMENT[equipmentName];
    const player = gameState.player;
    
    if (player.credits < equipment.cost) {
        alert('Insufficient credits!');
        return;
    }
    
    if (player.ship.extractionEquipment.has(equipmentName)) {
        alert('Equipment already owned!');
        return;
    }
    
    // Purchase equipment
    player.credits -= equipment.cost;
    player.ship.extractionEquipment.add(equipmentName);
    
    // Refresh the shop
    hideEquipmentShop();
    showEquipmentShop();
    
    // Update UI
    updatePlayerUI();
    
    alert(`${equipmentName} purchased successfully!`);
    // Save purchase
    autoSave();
}

// System Market Specializations
const SYSTEM_MARKETS = {
    'sol': {
        name: 'Sol System',
        type: 'core-world',
        securityLevel: 'high',
        specialization: 'industrial',
        description: 'Major industrial hub with high security. No illegal goods accepted.',
        priceModifiers: {
            Legal_1: 1.2,
            Legal_2: 1.3,
            Legal_3: 1.1,
            Legal_4: 0.9,
            Legal_5: 0.8,
            Legal_6: 0.7
        },
        acceptsIllegal: false,
        catchRate: 0.8
    },
    'mars': {
        name: 'Mars Outpost',
        type: 'frontier-outpost',
        securityLevel: 'medium',
        specialization: 'mining',
        description: 'Frontier mining operation. Lower security allows some illegal trade.',
        priceModifiers: {
            Legal_1: 1.4,
            Legal_2: 1.5,
            Legal_3: 1.2,
            Legal_4: 1.0,
            Legal_5: 0.9,
            Legal_6: 0.8,
            Illegal_1: 0.8,
            Illegal_2: 0.9,
            Illegal_3: 1.0
        },
        acceptsIllegal: true,
        catchRate: 0.3
    },
    'nexus': {
        name: 'Nexus Gateway',
        type: 'research-station',
        securityLevel: 'medium',
        specialization: 'research',
        description: 'Research facility seeking exotic materials. Premium prices for rare resources.',
        priceModifiers: {
            Legal_1: 0.8,
            Legal_2: 0.9,
            Legal_3: 1.0,
            Legal_4: 1.4,
            Legal_5: 1.6,
            Legal_6: 1.8,
            Illegal_4: 1.2,
            Illegal_5: 1.4,
            Illegal_6: 1.5
        },
        acceptsIllegal: true,
        catchRate: 0.2
    },
    'void': {
        name: 'The Void',
        type: 'anomaly',
        securityLevel: 'none',
        specialization: 'exotic',
        description: 'Mysterious black hole system. Dangerous but offers access to exotic materials and technologies.',
        priceModifiers: {
            Legal_5: 2.0,
            Legal_6: 2.5,
            Illegal_4: 2.0,
            Illegal_5: 2.2,
            Illegal_6: 3.0
        },
        acceptsIllegal: true,
        catchRate: 0.0 // No law enforcement here
    }
};

function showSystemMarket(systemId) {
    const system = SYSTEM_MARKETS[systemId];
    if (!system) return;
    
    const player = gameState.player;
    let marketContent = `
        <div class="resource-interface-header">
            <h3>${system.name} Market</h3>
            <button onclick="hideSystemMarket()" class="close-btn">✕</button>
        </div>
        <div class="resource-interface-body">
            <div class="market-info">
                <p class="market-description">${system.description}</p>
                <div class="market-stats">
                    <span class="market-stat security-${system.securityLevel}">Security: ${system.securityLevel.toUpperCase()}</span>
                    <span class="market-stat">Type: ${system.type}</span>
                    <span class="market-stat">Specialization: ${system.specialization}</span>
                </div>
            </div>
            
            <div class="cargo-status">
                <h4>Your Cargo: ${player.cargo.usedSpace}/${player.cargo.capacity} units | Credits: ¢${player.credits}</h4>
            </div>`;
    
    // Show sellable cargo
    if (player.cargo.contents.size > 0) {
        marketContent += `
            <div class="resource-section">
                <h4>Sell Resources</h4>
                <div class="resource-list">`;
        
        for (const [resourceType, quantity] of player.cargo.contents) {
            const resourceInfo = RESOURCE_TYPES[resourceType];
            const isIllegal = resourceInfo.category === 'Illegal';
            const modifier = system.priceModifiers[resourceType] || 1.0;
            const basePrice = Math.floor((resourceInfo.basePrice[0] + resourceInfo.basePrice[1]) / 2);
            const sellPrice = Math.floor(basePrice * modifier);
            
            let canSell = true;
            let sellButtonText = `Sell ¢${sellPrice} each`;
            let sellButtonClass = 'resource-btn';
            
            if (isIllegal && !system.acceptsIllegal) {
                canSell = false;
                sellButtonText = 'Illegal - Not Accepted';
                sellButtonClass = 'resource-btn disabled';
            } else if (isIllegal && system.acceptsIllegal) {
                sellButtonText = `Sell ¢${sellPrice} each (${Math.floor(system.catchRate * 100)}% risk)`;
                sellButtonClass = 'resource-btn illegal';
            }
            
            marketContent += `
                <div class="resource-item">
                    <div class="resource-info">
                        <span class="resource-name">${resourceType}</span>
                        <span class="resource-category ${resourceInfo.category.toLowerCase()}">${resourceInfo.category}</span>
                        <span class="resource-quantity">×${quantity}</span>
                        <span class="resource-price">Base: ¢${resourceInfo.basePrice[0]}-${resourceInfo.basePrice[1]} | Market: ¢${sellPrice}</span>
                        ${modifier !== 1.0 ? `<span class="price-modifier">${modifier > 1.0 ? '+' : ''}${Math.floor((modifier - 1.0) * 100)}% market bonus</span>` : ''}
                    </div>
                    <div class="sell-controls">
                        <button class="${sellButtonClass}" onclick="sellResource('${systemId}', '${resourceType}', 1)" ${!canSell ? 'disabled' : ''}>Sell 1</button>
                        ${quantity > 1 ? `<button class="${sellButtonClass}" onclick="sellResource('${systemId}', '${resourceType}', ${quantity})" ${!canSell ? 'disabled' : ''}>Sell All</button>` : ''}
                    </div>
                </div>`;
        }
        
        marketContent += `</div></div>`;
    } else {
        marketContent += `
            <div class="resource-section">
                <p style="color: #666; font-style: italic; text-align: center; padding: 20px;">No resources in cargo to sell</p>
            </div>`;
    }
    
    marketContent += `</div>`;
    
    const systemMarket = document.createElement('div');
    systemMarket.id = 'system-market';
    systemMarket.className = 'resource-interface';
    systemMarket.innerHTML = marketContent;
    
    document.body.appendChild(systemMarket);
}

function hideSystemMarket() {
    const systemMarket = document.getElementById('system-market');
    if (systemMarket) {
        systemMarket.remove();
    }
}

function sellResource(systemId, resourceType, quantity) {
    const system = SYSTEM_MARKETS[systemId];
    const player = gameState.player;
    const resourceInfo = RESOURCE_TYPES[resourceType];
    
    const currentQuantity = player.cargo.contents.get(resourceType) || 0;
    if (currentQuantity < quantity) {
        alert('Insufficient resources in cargo!');
        return;
    }
    
    const isIllegal = resourceInfo.category === 'Illegal';
    
    // Check for illegal trade consequences
    if (isIllegal && system.acceptsIllegal) {
        if (Math.random() < system.catchRate) {
            handleIllegalTradeCaught(systemId, resourceType, quantity);
            return;
        }
    }
    
    // Calculate sale price
    const modifier = system.priceModifiers[resourceType] || 1.0;
    const basePrice = Math.floor((resourceInfo.basePrice[0] + resourceInfo.basePrice[1]) / 2);
    const sellPrice = Math.floor(basePrice * modifier);
    const totalCredits = sellPrice * quantity;
    
    // Execute sale
    const newQuantity = currentQuantity - quantity;
    if (newQuantity <= 0) {
        player.cargo.contents.delete(resourceType);
    } else {
        player.cargo.contents.set(resourceType, newQuantity);
    }
    
    player.cargo.usedSpace -= quantity;
    player.credits += totalCredits;
    
    // Refresh market interface
    hideSystemMarket();
    showSystemMarket(systemId);
    
    // Update UI
    updatePlayerUI();
    
    alert(`Sold ${quantity}x ${resourceType} for ¢${totalCredits}!`);
}

function handleIllegalTradeCaught(systemId, resourceType, quantity) {
    const system = SYSTEM_MARKETS[systemId];
    const player = gameState.player;
    const resourceInfo = RESOURCE_TYPES[resourceType];
    
    // Calculate fine (2-5x the resource value)
    const basePrice = Math.floor((resourceInfo.basePrice[0] + resourceInfo.basePrice[1]) / 2);
    const fineMultiplier = Math.random() * 3 + 2; // 2-5x
    const totalFine = Math.floor(basePrice * fineMultiplier * quantity);
    
    // Confiscate illegal goods
    const currentQuantity = player.cargo.contents.get(resourceType) || 0;
    const confiscatedAmount = Math.min(currentQuantity, quantity);
    
    if (confiscatedAmount > 0) {
        const newQuantity = currentQuantity - confiscatedAmount;
        if (newQuantity <= 0) {
            player.cargo.contents.delete(resourceType);
        } else {
            player.cargo.contents.set(resourceType, newQuantity);
        }
        player.cargo.usedSpace -= confiscatedAmount;
    }
    
    // Apply fine (can't go below 0 credits)
    player.credits = Math.max(0, player.credits - totalFine);
    
    // Show consequence message
    let message = `CAUGHT TRADING ILLEGAL GOODS!\n\n`;
    message += `${system.name} Security confiscated ${confiscatedAmount}x ${resourceType}\n`;
    message += `Fine imposed: ¢${totalFine}\n`;
    message += `Remaining credits: ¢${player.credits}`;
    
    alert(message);
    
    // Refresh interfaces
    hideSystemMarket();
    showSystemMarket(systemId);
    updatePlayerUI();
    autoSave();
}

// Daily Resource Regeneration System
function initializeRegenerationSystem() {
    // Set up daily regeneration timer
    scheduleNextRegeneration();
    
    // Check if we missed a regeneration while offline
    checkMissedRegeneration();
}

function scheduleNextRegeneration() {
    const now = new Date();
    const midnight = new Date();
    
    // Set to midnight EST (UTC-5, accounting for daylight saving time)
    const estOffset = -5; // EST is UTC-5
    midnight.setUTCHours(5, 0, 0, 0); // 5 AM UTC = Midnight EST
    
    // If it's already past midnight today, schedule for tomorrow
    if (now >= midnight) {
        midnight.setUTCDate(midnight.getUTCDate() + 1);
    }
    
    const timeUntilMidnight = midnight.getTime() - now.getTime();
    
    setTimeout(() => {
        performDailyRegeneration();
        scheduleNextRegeneration(); // Schedule the next one
    }, timeUntilMidnight);
    
    console.log(`Next regeneration scheduled for: ${midnight.toISOString()}`);
}

function checkMissedRegeneration() {
    const lastRegen = gameState.galaxy.resources.lastRegeneration;
    if (!lastRegen) {
        // First time playing, set last regeneration to now
        gameState.galaxy.resources.lastRegeneration = new Date().toISOString();
        return;
    }
    
    const lastRegenDate = new Date(lastRegen);
    const now = new Date();
    
    // Check if we've passed midnight EST since last regeneration
    const lastRegenMidnight = getNextMidnightEST(lastRegenDate);
    
    if (now >= lastRegenMidnight) {
        console.log('Performing missed regeneration...');
        performDailyRegeneration();
    }
}

function getNextMidnightEST(fromDate) {
    const midnight = new Date(fromDate);
    midnight.setUTCHours(5, 0, 0, 0); // 5 AM UTC = Midnight EST
    
    // If the given time is already past midnight, get next day's midnight
    if (fromDate >= midnight) {
        midnight.setUTCDate(midnight.getUTCDate() + 1);
    }
    
    return midnight;
}

function performDailyRegeneration() {
    console.log('Performing daily resource regeneration...');
    
    let totalResourcesRegenerated = 0;
    let sitesRegenerated = 0;
    
    // Regenerate resources at all discovered sites
    for (const [hexId, resources] of gameState.galaxy.resources.hexResources) {
        if (regenerateHexResources(hexId, resources)) {
            sitesRegenerated++;
        }
    }
    
    // Update last regeneration timestamp
    gameState.galaxy.resources.lastRegeneration = new Date().toISOString();
    
    // Show notification if player is online
    if (sitesRegenerated > 0) {
        showRegenNotification(sitesRegenerated);
    }
    
    console.log(`Regenerated resources at ${sitesRegenerated} sites`);
}

function regenerateHexResources(hexId, resources) {
    let regenerated = false;
    const siteType = resources && resources.specialSite && resources.specialSite.type ? resources.specialSite.type : 'default';
    
    // Regenerate tradable resources
    if (resources.tradable) {
        for (const [resourceType, entry] of resources.tradable) {
            if (!entry || typeof entry.current !== 'number') continue;
            const maxCapacity = Math.max(entry.max || 0, getMaxResourceCapacity(resourceType, siteType, 'tradable'));
            if (entry.current < maxCapacity) {
                const regenAmount = Math.max(1, entry.regenRate ? Math.floor(entry.regenRate * maxCapacity) : getRegenerationAmount(resourceType, 'tradable'));
                entry.current = Math.min(maxCapacity, entry.current + regenAmount);
                entry.max = maxCapacity;
                resources.tradable.set(resourceType, entry);
                regenerated = true;
            }
        }
    }
    
    // Regenerate extractable resources
    if (resources.extractable) {
        for (const [resourceType, entry] of resources.extractable) {
            if (!entry || typeof entry.current !== 'number') continue;
            const maxCapacity = Math.max(entry.max || 0, getMaxResourceCapacity(resourceType, siteType, 'extractable'));
            if (entry.current < maxCapacity) {
                const regenAmount = Math.max(1, entry.regenRate ? Math.floor(entry.regenRate * maxCapacity) : getRegenerationAmount(resourceType, 'extractable'));
                entry.current = Math.min(maxCapacity, entry.current + regenAmount);
                entry.max = maxCapacity;
                resources.extractable.set(resourceType, entry);
                regenerated = true;
            }
        }
    }
    
    return regenerated;
}

function getMaxResourceCapacity(resourceType, siteType, resourceCategory) {
    const resourceInfo = RESOURCE_TYPES[resourceType];
    let baseCapacity;
    
    // Safeguard: default to mid rarity if unknown type (for migrated/legacy saves)
    const rarity = (resourceInfo && typeof resourceInfo.rarity === 'number') ? resourceInfo.rarity : 3;
    
    // Base capacity based on rarity (rarer resources have lower capacity)
    switch(rarity) {
        case 1: baseCapacity = 3; break;
        case 2: baseCapacity = 3; break;
        case 3: baseCapacity = 2; break;
        case 4: baseCapacity = 2; break;
        case 5: baseCapacity = 1; break;
        case 6: baseCapacity = 1; break;
        default: baseCapacity = 2; break;
    }
    
    // Extractable resources have lower capacity than tradable
    if (resourceCategory === 'extractable') {
        baseCapacity = Math.max(1, Math.floor(baseCapacity * 0.7));
    }
    
    return baseCapacity;
}

function getRegenerationAmount(resourceType, resourceCategory) {
    const resourceInfo = RESOURCE_TYPES[resourceType];
    let baseRegen;
    
    // Safeguard: default to mid rarity for unknown types
    const rarity = (resourceInfo && typeof resourceInfo.rarity === 'number') ? resourceInfo.rarity : 3;
    
    // Base regeneration based on rarity (rarer resources regenerate slower)
    switch(rarity) {
        case 1: baseRegen = 2; break;
        case 2: baseRegen = 2; break;
        case 3: baseRegen = 1; break;
        case 4: baseRegen = 1; break;
        case 5: baseRegen = 1; break;
        case 6: baseRegen = 1; break;
        default: baseRegen = 1; break;
    }
    
    // Extractable resources regenerate slower
    if (resourceCategory === 'extractable') {
        baseRegen = Math.max(1, Math.floor(baseRegen * 0.5));
    }
    
    return baseRegen;
}

function showRegenNotification(sitesCount) {
    const notification = document.createElement('div');
    notification.className = 'regen-notification';
    notification.innerHTML = `
        <div class="regen-notification-content">
            <h4>Daily Regeneration Complete</h4>
            <p>Resources regenerated at ${sitesCount} discovered sites.</p>
            <button onclick="hideRegenNotification()" class="resource-btn">Acknowledge</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        hideRegenNotification();
    }, 10000);
}

function hideRegenNotification() {
    const notification = document.querySelector('.regen-notification');
    if (notification) {
        notification.remove();
    }
}

function scanCurrentHex() {
    if (!gameState.ui.selectedHex) return;
    
    // Block scanning during ship movement
    if (gameState.animation.isShipMoving) {
        return;
    }
    
    if (gameState.player.actionPoints < 1) {
        showGameDialog('Insufficient AP', 'Quick Scan requires 1 AP. Your AP are depleted.');
        return;
    }
    
    // Don't allow scanning visited or claimed hexes - no point!
    if (gameState.galaxy.hexGrid.visitedHexes.has(gameState.ui.selectedHex)) {
        alert('This hex has already been visited - no need to scan!');
        return;
    }
    
    if (gameState.galaxy.hexGrid.claimedHexes.has(gameState.ui.selectedHex)) {
        alert('This hex has already been claimed - no need to scan!');
        return;
    }
    
    gameState.player.actionPoints -= 1;
    setHexState(gameState.ui.selectedHex, 'scanned');
    // Capture a scan reading (stubbed for now)
    try {
        const reading = getScanReading(gameState.ui.selectedHex, 'quick');
        const existing = gameState.galaxy.hexGrid.hexData.get(gameState.ui.selectedHex) || {};
        gameState.galaxy.hexGrid.hexData.set(gameState.ui.selectedHex, {
            ...existing,
            scan: { ...reading, ts: Date.now() }
        });
        console.log('[SCAN] Reading:', reading);
    } catch (e) {
        console.warn('[SCAN] getScanReading failed:', e);
    }
    console.log('[SCAN] Marked scanned:', gameState.ui.selectedHex, 'Totals:', {
        scanned: gameState.galaxy.hexGrid.scannedHexes.size,
        visited: gameState.galaxy.hexGrid.visitedHexes.size,
        claimed: gameState.galaxy.hexGrid.claimedHexes.size
    });
    
    // Generate scan data
    if (!gameState.galaxy.hexGrid.hexData.has(gameState.ui.selectedHex)) {
        const discoveryTypes = ['planet', 'asteroid', 'artifact', 'station', 'anomaly', 'resources'];
        const probability = Math.floor(Math.random() * 91); // 0-90
        const discoveryType = discoveryTypes[Math.floor(Math.random() * discoveryTypes.length)];
        
        gameState.galaxy.hexGrid.hexData.set(gameState.ui.selectedHex, { probability, discoveryType });
    }
    
    // Update only hex states, preserving stars and systems
    updateHexStatesPreservingBackground();
    
    // Refresh status box with new scan data
    showHexStatusBox(gameState.ui.selectedHex);
    updateStatusPanel(); // Update action points display
}

// Tooltip and highlight management (legacy - keeping for compatibility)
function hideAllTooltips() {
    const systemTooltips = document.querySelectorAll('#system-tooltip');
    const sectorTooltips = document.querySelectorAll('#sector-tooltip');
    systemTooltips.forEach(tooltip => tooltip.remove());
    sectorTooltips.forEach(tooltip => tooltip.remove());
    hideHexStatusBox();
}

function clearAllHexHighlights() {
    const hexHighlights = document.querySelectorAll('.hex-highlighted');
    hexHighlights.forEach(hex => {
        hex.classList.remove('hex-highlighted');
        hex.style.stroke = 'transparent';
        hex.style.strokeWidth = '1';
        hex.style.strokeOpacity = '0';
        hex.style.fill = 'transparent';
    });
    
    gameState.ui.selectedHex = null;
    gameState.ui.highlightedHex = null;
}

function clearSectorHighlight() {
    const highlights = document.querySelectorAll('.sector-highlight');
    highlights.forEach(highlight => highlight.remove());
    
    clearAllHexHighlights();
}


// Animate ship warp drive movement
function animateShipWarp(destinationHexId) {
    // Set animation state to block interactions
    gameState.animation.isShipMoving = true;
    
    // Get current and destination positions
    const {x: currentX, y: currentY, z: currentZ} = gameState.player.hexLocation;
    const {x: destX, y: destY, z: destZ} = parseCubeId(destinationHexId);
    const {col: destCol, row: destRow} = cubeToOffset(destX, destY, destZ);
    
    const hexWidth = 130;
    const hexHeight = hexWidth * (Math.sqrt(3) / 2);
    
    const currentPos = cubeToPixel(currentX, currentY, currentZ, hexWidth, hexHeight);
    const destPos = cubeToPixel(destX, destY, destZ, hexWidth, hexHeight);
    
    // Get the ship element
    const shipElement = document.querySelector('.player-ship-symbol');
    if (!shipElement) return;
    
    // Calculate direction vector and rotation angle
    const deltaX = destPos.x - currentPos.x;
    const deltaY = destPos.y - currentPos.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const directionX = deltaX / distance;
    const directionY = deltaY / distance;
    
    // Calculate rotation angle (in degrees)
    // Triangle points up by default (0 degrees), so we adjust for that
    const rotationAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
    
    // Store the rotation for persistence
    gameState.player.shipRotation = rotationAngle;
    
    // Phase 0a: Begin rotation
    shipElement.style.transition = 'all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)';
    const partialAngle = rotationAngle * 0.6;
    shipElement.setAttribute('transform', `translate(${currentPos.x}, ${currentPos.y}) rotate(${partialAngle})`);
    
    setTimeout(() => {
        // Phase 0b: Complete rotation
        shipElement.style.transition = 'all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)';
        shipElement.setAttribute('transform', `translate(${currentPos.x}, ${currentPos.y}) rotate(${rotationAngle})`);
        
        setTimeout(() => {
            // Phase 1a: Tiny forward movement
            shipElement.style.transition = 'all 0.1s cubic-bezier(0.25, 0.1, 0.25, 1)';
            const move1X = currentPos.x + (directionX * 4);
            const move1Y = currentPos.y + (directionY * 4);
            shipElement.setAttribute('transform', `translate(${move1X}, ${move1Y}) rotate(${rotationAngle})`);
            
            setTimeout(() => {
                // Phase 1b: Small forward movement
                shipElement.style.transition = 'all 0.1s cubic-bezier(0.25, 0.1, 0.25, 1)';
                const move2X = currentPos.x + (directionX * 8);
                const move2Y = currentPos.y + (directionY * 8);
                shipElement.setAttribute('transform', `translate(${move2X}, ${move2Y}) rotate(${rotationAngle})`);
                
                setTimeout(() => {
                    // Phase 1c: Medium forward movement
                    shipElement.style.transition = 'all 0.1s cubic-bezier(0.25, 0.1, 0.25, 1)';
                    const move3X = currentPos.x + (directionX * 12);
                    const move3Y = currentPos.y + (directionY * 12);
                    shipElement.setAttribute('transform', `translate(${move3X}, ${move3Y}) rotate(${rotationAngle})`);
                    
                    setTimeout(() => {
                        // Phase 1d: Final pre-warp movement
                        shipElement.style.transition = 'all 0.1s cubic-bezier(0.25, 0.1, 0.25, 1)';
                        const move4X = currentPos.x + (directionX * 15);
                        const move4Y = currentPos.y + (directionY * 15);
                        shipElement.setAttribute('transform', `translate(${move4X}, ${move4Y}) rotate(${rotationAngle})`);
                        
                        setTimeout(() => {
                            // Phase 2a: Micro stretch
                            shipElement.style.transition = 'all 0.08s cubic-bezier(0.42, 0, 0.58, 1)';
                            shipElement.setAttribute('transform', `translate(${move4X}, ${move4Y}) rotate(${rotationAngle}) scale(0.95, 1.1)`);
                            
                            setTimeout(() => {
                                // Phase 2b: Small stretch
                                shipElement.style.transition = 'all 0.07s cubic-bezier(0.42, 0, 0.58, 1)';
                                shipElement.setAttribute('transform', `translate(${move4X}, ${move4Y}) rotate(${rotationAngle}) scale(0.8, 1.3)`);
                                
                                setTimeout(() => {
                                    // Phase 2c: Medium stretch
                                    shipElement.style.transition = 'all 0.08s cubic-bezier(0.42, 0, 0.58, 1)';
                                    shipElement.setAttribute('transform', `translate(${move4X}, ${move4Y}) rotate(${rotationAngle}) scale(0.7, 1.6)`);
                                    
                                    setTimeout(() => {
                                        // Phase 2d: Large stretch
                                        shipElement.style.transition = 'all 0.07s cubic-bezier(0.42, 0, 0.58, 1)';
                                        shipElement.setAttribute('transform', `translate(${move4X}, ${move4Y}) rotate(${rotationAngle}) scale(0.6, 1.8)`);
                                        
                                        setTimeout(() => {
                                            // Phase 2e: Major stretch
                                            shipElement.style.transition = 'all 0.05s cubic-bezier(0.42, 0, 1, 1)';
                                            shipElement.setAttribute('transform', `translate(${move4X}, ${move4Y}) rotate(${rotationAngle}) scale(0.5, 2.2)`);
                                            
                                            setTimeout(() => {
                                                // Phase 2f: Extreme stretch
                                                shipElement.style.transition = 'all 0.05s cubic-bezier(0.42, 0, 1, 1)';
                                                shipElement.setAttribute('transform', `translate(${move4X}, ${move4Y}) rotate(${rotationAngle}) scale(0.4, 2.5)`);
                                                
                                                setTimeout(() => {
                                                    // Phase 2g: Near-maximum stretch
                                                    shipElement.style.transition = 'all 0.04s cubic-bezier(0.42, 0, 1, 1)';
                                                    shipElement.setAttribute('transform', `translate(${move4X}, ${move4Y}) rotate(${rotationAngle}) scale(0.3, 3.2)`);
                                                    
                                                    setTimeout(() => {
                                                        // Phase 2h: Maximum stretch
                                                        shipElement.style.transition = 'all 0.04s cubic-bezier(0.42, 0, 1, 1)';
                                                        shipElement.setAttribute('transform', `translate(${move4X}, ${move4Y}) rotate(${rotationAngle}) scale(0.2, 4)`);
                                                        
                                                        setTimeout(() => {
                                                            // Phase 3a: First micro jump
                                                            shipElement.style.transition = 'all 0.03s ease-out';
                                                            const jump1X = currentPos.x + (deltaX * 0.15);
                                                            const jump1Y = currentPos.y + (deltaY * 0.15);
                                                            shipElement.setAttribute('transform', `translate(${jump1X}, ${jump1Y}) rotate(${rotationAngle}) scale(0.2, 4)`);
                                                            
                                                            setTimeout(() => {
                                                                // Phase 3b: Second micro jump
                                                                shipElement.style.transition = 'all 0.03s ease-out';
                                                                const jump2X = currentPos.x + (deltaX * 0.3);
                                                                const jump2Y = currentPos.y + (deltaY * 0.3);
                                                                shipElement.setAttribute('transform', `translate(${jump2X}, ${jump2Y}) rotate(${rotationAngle}) scale(0.2, 4)`);
                                                                
                                                                setTimeout(() => {
                                                                    // Phase 3c: Major jump
                                                                    shipElement.style.transition = 'all 0.02s ease-out';
                                                                    const jump3X = currentPos.x + (deltaX * 0.6);
                                                                    const jump3Y = currentPos.y + (deltaY * 0.6);
                                                                    shipElement.setAttribute('transform', `translate(${jump3X}, ${jump3Y}) rotate(${rotationAngle}) scale(0.2, 4)`);
                                                                    
                                                                    setTimeout(() => {
                                                                        // Phase 3d: Final jump
                                                                        shipElement.style.transition = 'all 0.02s ease-out';
                                                                        const preDestX = destPos.x - (directionX * 25);
                                                                        const preDestY = destPos.y - (directionY * 25);
                                                                        shipElement.setAttribute('transform', `translate(${preDestX}, ${preDestY}) rotate(${rotationAngle}) scale(0.2, 4)`);
                                                                        
                                                                        setTimeout(() => {
                                                                            // Phase 4a: Begin deceleration
                                                                            shipElement.style.transition = 'all 0.05s cubic-bezier(0, 0.42, 0.58, 1)';
                                                                            shipElement.setAttribute('transform', `translate(${preDestX}, ${preDestY}) rotate(${rotationAngle}) scale(0.3, 3)`);
                                                                            
                                                                            setTimeout(() => {
                                                                                // Phase 4b: First recovery
                                                                                shipElement.style.transition = 'all 0.05s cubic-bezier(0, 0.42, 0.58, 1)';
                                                                                shipElement.setAttribute('transform', `translate(${preDestX}, ${preDestY}) rotate(${rotationAngle}) scale(0.4, 2.2)`);
                                                                                
                                                                                setTimeout(() => {
                                                                                    // Phase 4c: Second recovery
                                                                                    shipElement.style.transition = 'all 0.05s cubic-bezier(0, 0.42, 0.58, 1)';
                                                                                    shipElement.setAttribute('transform', `translate(${preDestX}, ${preDestY}) rotate(${rotationAngle}) scale(0.5, 1.9)`);
                                                                                    
                                                                                    setTimeout(() => {
                                                                                        // Phase 4d: Third recovery
                                                                                        shipElement.style.transition = 'all 0.05s cubic-bezier(0, 0.42, 0.58, 1)';
                                                                                        shipElement.setAttribute('transform', `translate(${preDestX}, ${preDestY}) rotate(${rotationAngle}) scale(0.6, 1.6)`);
                                                                                        
                                                                                        setTimeout(() => {
                                                                                            // Phase 4e: Fourth recovery
                                                                                            shipElement.style.transition = 'all 0.05s cubic-bezier(0, 0.42, 0.58, 1)';
                                                                                            shipElement.setAttribute('transform', `translate(${preDestX}, ${preDestY}) rotate(${rotationAngle}) scale(0.7, 1.5)`);
                                                                                            
                                                                                            setTimeout(() => {
                                                                                                // Phase 4f: Position adjustment
                                                                                                shipElement.style.transition = 'all 0.06s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                                                                                                const near1X = destPos.x - (directionX * 15);
                                                                                                const near1Y = destPos.y - (directionY * 15);
                                                                                                shipElement.setAttribute('transform', `translate(${near1X}, ${near1Y}) rotate(${rotationAngle}) scale(0.8, 1.3)`);
                                                                                                
                                                                                                setTimeout(() => {
                                                                                                    // Phase 4g: Near final position
                                                                                                    shipElement.style.transition = 'all 0.06s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                                                                                                    const near2X = destPos.x - (directionX * 8);
                                                                                                    const near2Y = destPos.y - (directionY * 8);
                                                                                                    shipElement.setAttribute('transform', `translate(${near2X}, ${near2Y}) rotate(${rotationAngle}) scale(0.9, 1.1)`);
                                                                                                    
                                                                                                    setTimeout(() => {
                                                                                                        // Phase 4h: Almost final
                                                                                                        shipElement.style.transition = 'all 0.07s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                                                                                                        const near3X = destPos.x - (directionX * 3);
                                                                                                        const near3Y = destPos.y - (directionY * 3);
                                                                                                        shipElement.setAttribute('transform', `translate(${near3X}, ${near3Y}) rotate(${rotationAngle}) scale(0.95, 1.05)`);
                                                                                                        
                                                                                                        setTimeout(() => {
                                                                                                            // Phase 4i: Final approach
                                                                                                            shipElement.style.transition = 'all 0.07s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                                                                                                            shipElement.setAttribute('transform', `translate(${destPos.x}, ${destPos.y}) rotate(${rotationAngle}) scale(1, 1)`);
                                                                                                            
                                                                                                            setTimeout(() => {
            // Animation complete - update game state (use pending light drive AP cost if present)
            const ap = (gameState.ui && gameState.ui.pendingNavApCost) ? gameState.ui.pendingNavApCost : 2;
            completeShipNavigation(destCol, destRow, ap);
            if (gameState.ui) gameState.ui.pendingNavApCost = null;
                                                                                                            }, 70);
                                                                                                            
                                                                                                        }, 70);
                                                                                                    }, 60);
                                                                                                }, 60);
                                                                                            }, 50);
                                                                                        }, 50);
                                                                                    }, 50);
                                                                                }, 50);
                                                                            }, 50);
                                                                        }, 20);
                                                                    }, 20);
                                                                }, 30);
                                                            }, 30);
                                                        }, 40);
                                                    }, 40);
                                                }, 50);
                                            }, 50);
                                        }, 70);
                                    }, 80);
                                }, 80);
                            }, 100);
                        }, 100);
                    }, 100);
                }, 100);
            }, 100);
        }, 250);
    }, 250);
}

// Animate warp drive travel along curved warp lane
function animateWarpDrive(destinationHexId) {
    // Set animation state to block interactions
    gameState.animation.isShipMoving = true;
    
    // Get current and destination positions
    const {x: currentX, y: currentY, z: currentZ} = gameState.player.hexLocation;
    const {x: destX, y: destY, z: destZ} = parseCubeId(destinationHexId);
    const {col: destCol, row: destRow} = cubeToOffset(destX, destY, destZ);
    
    // Hide the warp lane path during travel
    const travelRoutes = document.querySelector('#travel-routes');
    if (travelRoutes) {
        travelRoutes.style.opacity = '0';
        travelRoutes.style.transition = 'opacity 0.3s ease-out';
    }
    
    const hexWidth = 130;
    const hexHeight = hexWidth * (Math.sqrt(3) / 2);
    
    const currentPos = cubeToPixel(currentX, currentY, currentZ, hexWidth, hexHeight);
    const destPos = cubeToPixel(destX, destY, destZ, hexWidth, hexHeight);
    
    // Debug: Log positions
    console.log('Warp animation:', {
        currentPos,
        destPos,
        currentCube: {x: currentX, y: currentY, z: currentZ},
        destCube: {x: destX, y: destY, z: destZ}
    });
    
    // Validate positions
    if (!currentPos || !destPos || isNaN(currentPos.x) || isNaN(currentPos.y) || isNaN(destPos.x) || isNaN(destPos.y)) {
        console.error('Invalid positions for warp animation!', {currentPos, destPos});
        gameState.animation.isShipMoving = false;
        return;
    }
    
    // Find the actual warp lane to determine its direction
    const currentSystemKey = Object.keys(gameState.galaxy.knownSystems).find(key => {
        const system = gameState.galaxy.knownSystems[key];
        return system.x === currentX && system.y === currentY && system.z === currentZ;
    });
    
    const destSystemKey = Object.keys(gameState.galaxy.knownSystems).find(key => {
        const system = gameState.galaxy.knownSystems[key];
        return system.x === destX && system.y === destY && system.z === destZ;
    });
    
    console.log('System keys found:', {currentSystemKey, destSystemKey});
    
    let laneDirection = 'forward';
    if (currentSystemKey && destSystemKey) {
        for (const lane of gameState.galaxy.warpLanes) {
            if (lane.from === currentSystemKey && lane.to === destSystemKey) {
                laneDirection = 'forward';
                break;
            } else if (lane.to === currentSystemKey && lane.from === destSystemKey) {
                laneDirection = 'reverse';
                break;
            }
        }
    }
    
    // Calculate curved path respecting lane direction
    let controlX, controlY;
    if (laneDirection === 'reverse') {
        // Lane is defined from dest to current, so calculate control point that way
        const midX = (destPos.x + currentPos.x) / 2;
        const midY = (destPos.y + currentPos.y) / 2;
        const dx = currentPos.x - destPos.x;
        const dy = currentPos.y - destPos.y;
        controlX = midX - dy * 0.2;
        controlY = midY + dx * 0.2;
    } else {
        // Lane is defined from current to dest
        const midX = (currentPos.x + destPos.x) / 2;
        const midY = (currentPos.y + destPos.y) / 2;
        const dx = destPos.x - currentPos.x;
        const dy = destPos.y - currentPos.y;
        controlX = midX - dy * 0.2;
        controlY = midY + dx * 0.2;
    }
    
    // If a forced control point is provided (wormholes), use it for alignment with rendered path
    if (gameState.ui && gameState.ui.forcedWarpControl) {
        controlX = gameState.ui.forcedWarpControl.x;
        controlY = gameState.ui.forcedWarpControl.y;
    }
    console.log('Control point calculated:', {controlX, controlY, laneDirection, forced: !!(gameState.ui && gameState.ui.forcedWarpControl)});
    
    // Validate control points
    if (isNaN(controlX) || isNaN(controlY)) {
        console.error('Invalid control points!', {controlX, controlY});
        gameState.animation.isShipMoving = false;
        return;
    }
    
    // Get the ship element
    const shipElement = document.querySelector('.player-ship-symbol');
    if (!shipElement) return;
    
    // Calculate starting and ending tangent angles
    const startTangentAngle = gameState.player.shipRotation || 0;
    
    // Calculate ending tangent angle (direction at destination)
    const endT = 0.99;
    const endX = Math.pow(1-endT, 2) * currentPos.x + 2*(1-endT)*endT * controlX + Math.pow(endT, 2) * destPos.x;
    const endY = Math.pow(1-endT, 2) * currentPos.y + 2*(1-endT)*endT * controlY + Math.pow(endT, 2) * destPos.y;
    const nextEndT = 1.0;
    const nextEndX = Math.pow(1-nextEndT, 2) * currentPos.x + 2*(1-nextEndT)*nextEndT * controlX + Math.pow(nextEndT, 2) * destPos.x;
    const nextEndY = Math.pow(1-nextEndT, 2) * currentPos.y + 2*(1-nextEndT)*nextEndT * controlY + Math.pow(nextEndT, 2) * destPos.y;
    const endTangentAngle = Math.atan2(nextEndY - endY, nextEndX - endX) * (180 / Math.PI) + 90;
    
    // Store the ending rotation for after warp completes
    gameState.player.shipRotation = endTangentAngle;
    
    // Create path for animation
    const totalSteps = 100; // Smooth curve with 100 steps
    const stepDuration = 100; // 10 seconds total (100ms per step)
    let currentStep = 0;
    
    function animateAlongCurve() {
        if (currentStep >= totalSteps) {
            // Animation complete - restore warp lanes visibility
            const travelRoutes = document.querySelector('#travel-routes');
            if (travelRoutes) {
                travelRoutes.style.transition = 'opacity 0.5s ease-in';
                travelRoutes.style.opacity = '1';
            }
            completeShipNavigation(destCol, destRow, 5); // 5 AP for warp drive
            // Clear any forced wormhole control after travel completes
            if (gameState.ui) gameState.ui.forcedWarpControl = null;
            return;
        }
        
        const t = currentStep / totalSteps;
        
        // Quadratic Bezier curve calculation - respect lane direction
        let x, y, nextX, nextY;
        if (laneDirection === 'reverse') {
            // Animate along the reversed curve (from dest to current)
            const reverseT = 1 - t; // Reverse the t value
            x = Math.pow(1-reverseT, 2) * destPos.x + 2*(1-reverseT)*reverseT * controlX + Math.pow(reverseT, 2) * currentPos.x;
            y = Math.pow(1-reverseT, 2) * destPos.y + 2*(1-reverseT)*reverseT * controlY + Math.pow(reverseT, 2) * currentPos.y;
            
            // Calculate direction for ship rotation (tangent to curve)
            const nextReverseT = Math.max(reverseT - 0.01, 0);
            nextX = Math.pow(1-nextReverseT, 2) * destPos.x + 2*(1-nextReverseT)*nextReverseT * controlX + Math.pow(nextReverseT, 2) * currentPos.x;
            nextY = Math.pow(1-nextReverseT, 2) * destPos.y + 2*(1-nextReverseT)*nextReverseT * controlY + Math.pow(nextReverseT, 2) * currentPos.y;
        } else {
            // Normal forward animation
            x = Math.pow(1-t, 2) * currentPos.x + 2*(1-t)*t * controlX + Math.pow(t, 2) * destPos.x;
            y = Math.pow(1-t, 2) * currentPos.y + 2*(1-t)*t * controlY + Math.pow(t, 2) * destPos.y;
            
            // Calculate direction for ship rotation (tangent to curve)
            const nextT = Math.min(t + 0.01, 1);
            nextX = Math.pow(1-nextT, 2) * currentPos.x + 2*(1-nextT)*nextT * controlX + Math.pow(nextT, 2) * destPos.x;
            nextY = Math.pow(1-nextT, 2) * currentPos.y + 2*(1-nextT)*nextT * controlY + Math.pow(nextT, 2) * destPos.y;
        }
        const tangentAngle = Math.atan2(nextY - y, nextX - x) * (180 / Math.PI) + 90;
        
        // Elongation effect during travel (more pronounced in middle)
        const elongationFactor = 1 + Math.sin(t * Math.PI) * 2; // Peak elongation at 50%
        const scaleX = 0.3;
        const scaleY = elongationFactor;
        
        // Update ship position, rotation, and elongation
        shipElement.setAttribute('transform', `translate(${x}, ${y}) rotate(${tangentAngle}) scale(${scaleX}, ${scaleY})`);
        
        // Follow the ship with the camera using scroll position
        const mainDisplay = document.querySelector('.main-display');
        if (mainDisplay) {
            const displayRect = mainDisplay.getBoundingClientRect();
            
            // Calculate scroll position to center on current ship position
            const targetScrollLeft = x - displayRect.width / 2;
            const targetScrollTop = y - displayRect.height / 2;
            
            // Smooth scroll to follow the ship
            mainDisplay.scrollTo({
                left: targetScrollLeft,
                top: targetScrollTop,
                behavior: 'auto'  // Instant for smooth animation following
            });
        }
        
        currentStep++;
        setTimeout(animateAlongCurve, stepDuration);
    }
    
    // Start the curved animation
    animateAlongCurve();
}

// Complete ship navigation after animation
function completeShipNavigation(destCol, destRow, apCost = 2) {
    // Convert destination offset coordinates to cube coordinates
    const {x: destX, y: destY, z: destZ} = offsetToCube(destCol, destRow);
    
    // Update player position to cube coordinates
    gameState.player.hexLocation.x = destX;
    gameState.player.hexLocation.y = destY;
    gameState.player.hexLocation.z = destZ;
    
    // Mark destination hex as visited (and remove from other states)
    const destinationHexId = cubeId(destX, destY, destZ);
    setHexState(destinationHexId, 'visited');
    
    // Discover resources at destination hex
    const discoveredResources = generateResourcesForHex(destinationHexId);
    if (discoveredResources) {
        console.log(`🌟 Discovered ${discoveredResources.siteName} at ${destinationHexId}!`);
    }
    
    // Check if there's a system at destination hex
    const {x, y, z} = parseCubeId(destinationHexId);
    const systemId = `sys_${x}_${y}_${z}`;
    const discoveredSystem = gameState.galaxy.generatedSystems.get(systemId);
    if (discoveredSystem) {
        console.log(`🌟 Discovered system: ${discoveredSystem.name} at ${destinationHexId}!`);
    }
    
    // Trigger first-time discovery notification (if applicable)
    handleFirstDiscoveries(destinationHexId, discoveredResources);

    // Deduct action points
    gameState.player.actionPoints = Math.max(0, gameState.player.actionPoints - apCost);
    
    // Clear selection and highlights
    hideHexStatusBox();
    clearAllHexHighlights();
    
    // Re-enable interactions
    gameState.animation.isShipMoving = false;
    
    // Update only hex states, preserving stars and systems
    updateHexStatesPreservingBackground();
    // Update discovered systems layer so new systems render immediately
    updateDiscoveredSystemsOnly();
    // Update player ship position
    updatePlayerShipOnly();
    // Recompute NPC encounters after arriving
    try { _recomputeNpcPositions(); } catch (e) { /* ignore */ }
    updateStatusPanel();
    
    // Center on new ship position
    setTimeout(() => centerMapOnPlayer(), 100);
    
    // Auto-save after navigation
    autoSave();
}

// Check if player is at a warp lane endpoint
function getAvailableWarpDestinations() {
    const {x, y, z} = gameState.player.hexLocation;
    const {col: playerCol, row: playerRow} = cubeToOffset(x, y, z);
    
    // Find which system the player is currently in
    const currentSystem = Object.entries(gameState.galaxy.knownSystems)
        .find(([key, system]) => system.x === x && system.y === y && system.z === z);
    
    if (!currentSystem) return [];
    
    const currentSystemKey = currentSystem[0];
    const availableDestinations = [];
    
    // Check all warp lanes for connections from current system
    gameState.galaxy.warpLanes.forEach(lane => {
        if (lane.from === currentSystemKey) {
            availableDestinations.push(lane.to);
        } else if (lane.to === currentSystemKey) {
            availableDestinations.push(lane.from);
        }
    });
    
    return availableDestinations;
}

// Check if a destination is reachable via warp drive
function canWarpToDestination(destCol, destRow) {
    const availableDestinations = getAvailableWarpDestinations();
    
    return availableDestinations.some(systemKey => {
        const system = gameState.galaxy.knownSystems[systemKey];
        // Convert destination offset to cube and compare
        const {x: destX, y: destY, z: destZ} = offsetToCube(destCol, destRow);
        return system && system.x === destX && system.y === destY && system.z === destZ;
    });
}

// Calculate cube distance between two hex positions
function cubeDistance(x1, y1, z1, x2, y2, z2) {
    return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2), Math.abs(z1 - z2));
}

// Check if two cube coordinates are adjacent (distance = 1)
function isAdjacentCube(x1, y1, z1, x2, y2, z2) {
    return cubeDistance(x1, y1, z1, x2, y2, z2) === 1;
}

// Rebuild only the discovered systems layer
function updateDiscoveredSystemsOnly() {
    const svg = document.querySelector('#ascii-display svg');
    if (!svg) return;
    const hexWidth = gameState.galaxy.hexGrid.hexWidth;
    const hexHeight = hexWidth * (Math.sqrt(3) / 2);
    const newGroup = generateDiscoveredSystems(hexWidth, hexHeight);
    const existing = svg.querySelector('#discovered-systems');
    if (existing) {
        existing.outerHTML = newGroup;
        return;
    }
    // Insert after region borders if present, else after hex grid, else append
    const borders = svg.querySelector('#region-borders');
    if (borders) {
        borders.insertAdjacentHTML('afterend', newGroup);
        return;
    }
    const grid = svg.querySelector('#hex-grid');
    if (grid) {
        grid.insertAdjacentHTML('afterend', newGroup);
    } else {
        svg.insertAdjacentHTML('beforeend', newGroup);
    }
}

// =========================
// NPC SYSTEM (deterministic, low CPU)
// =========================

// PRNG for deterministic generation from seed
function _mulberry32(seed) {
    let t = seed >>> 0;
    return function() {
        t += 0x6D2B79F5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

function _randInt(rng, min, max) { // inclusive min, inclusive max
    return Math.floor(rng() * (max - min + 1)) + min;
}

function _choice(rng, arr) {
    return arr[Math.floor(rng() * arr.length)];
}

function _computeNpcPhase() {
    const STEP_MS = 10 * 60 * 1000; // 10 minutes per hex
    return Math.floor(Date.now() / STEP_MS);
}

function _allSystemsList() {
    const list = [];
    for (const s of Object.values(gameState.galaxy.knownSystems)) list.push({ x: s.x, y: s.y, z: s.z });
    for (const [, s] of gameState.galaxy.generatedSystems) list.push({ x: s.x, y: s.y, z: s.z });
    return list;
}

function _linePath(from, to) {
    // Hex line interpolation (cube lerp + rounding)
    // Reference: https://www.redblobgames.com/grids/hexagons/#line-drawing
    const N = cubeDistance(from.x, from.y, from.z, to.x, to.y, to.z);
    const results = [];
    const ax = from.x, ay = from.y, az = from.z;
    const bx = to.x, by = to.y, bz = to.z;
    for (let i = 0; i <= N; i++) {
        const t = N === 0 ? 0 : i / N;
        // Lerp in cube space
        const rx = ax + (bx - ax) * t;
        const ry = ay + (by - ay) * t;
        const rz = az + (bz - az) * t;
        // Cube round
        let cx = Math.round(rx), cy = Math.round(ry), cz = Math.round(rz);
        const dx = Math.abs(cx - rx), dy = Math.abs(cy - ry), dz = Math.abs(cz - rz);
        if (dx > dy && dx > dz) cx = -cy - cz;
        else if (dy > dz) cy = -cx - cz;
        else cz = -cx - cy;
        results.push({ x: cx, y: cy, z: cz });
    }
    return results;
}

function _withinBounds(hex) {
    // Convert to offset and check grid bounds
    const { col, row } = cubeToOffset(hex.x, hex.y, hex.z);
    return col >= 0 && row >= 0 && col < gameState.galaxy.hexGrid.cols && row < gameState.galaxy.hexGrid.rows;
}

function _reflectIntoBounds(hex) {
    // If out of bounds, clamp via reflection by stepping toward center (30,-30,0)
    let cur = { ...hex };
    let guard = 0;
    while (!_withinBounds(cur) && guard++ < 12) {
        // Move one step toward center
        const center = { x: 30, y: -30, z: 0 };
        // pick dir that reduces distance
        let best = cur;
        let bestD = cubeDistance(cur.x, cur.y, cur.z, center.x, center.y, center.z);
        for (const d of CUBE_DIRS) {
            const n = { x: cur.x + d.x, y: cur.y + d.y, z: cur.z + d.z };
            const nd = cubeDistance(n.x, n.y, n.z, center.x, center.y, center.z);
            if (nd < bestD) { bestD = nd; best = n; }
        }
        cur = best;
    }
    return cur;
}

function _buildLoopPath(rng, origin, systems) {
    // Choose 3–5 distinct systems; ensure spread
    const count = _randInt(rng, 3, 5);
    const picks = [];
    const used = new Set();
    // include closest system from origin first
    if (systems.length) {
        let best = null, bestD = Infinity;
        for (const s of systems) {
            const d = cubeDistance(origin.x, origin.y, origin.z, s.x, s.y, s.z);
            if (d < bestD) { bestD = d; best = s; }
        }
        if (best) { picks.push(best); used.add(cubeId(best.x, best.y, best.z)); }
    }
    // pick others
    let guard = 0;
    while (picks.length < count && guard++ < systems.length * 2) {
        const s = _choice(rng, systems);
        const id = cubeId(s.x, s.y, s.z);
        if (used.has(id)) continue;
        // keep some distance from last pick
        const last = picks[picks.length - 1];
        const d = cubeDistance(last.x, last.y, last.z, s.x, s.y, s.z);
        if (d >= 6) { picks.push(s); used.add(id); }
    }
    if (picks.length === 0) picks.push(origin);
    // Make closed loop back to first
    const seq = [origin, ...picks, picks[0]];
    const path = [];
    for (let i = 0; i < seq.length - 1; i++) {
        const a = seq[i], b = seq[i + 1];
        const seg = _linePath(a, b);
        for (let j = 0; j < seg.length; j++) {
            let h = seg[j];
            if (!_withinBounds(h)) h = _reflectIntoBounds(h);
            const id = cubeId(h.x, h.y, h.z);
            if (path.length === 0 || path[path.length - 1] !== id) path.push(id);
        }
        // Dwell one tick at system waypoint
        const lastHex = path[path.length - 1];
        path.push(lastHex);
    }
    // Ensure decent length
    return path;
}

function _buildWanderPath(rng, origin) {
    const path = [];
    const L = _randInt(rng, 300, 800);
    let cur = { ...origin };
    // initial heading
    let heading = _choice(rng, CUBE_DIRS);
    for (let i = 0; i < L; i++) {
        const id = cubeId(cur.x, cur.y, cur.z);
        if (path.length === 0 || path[path.length - 1] !== id) path.push(id);
        // Occasionally dwell at systems
        const sys = gameState.galaxy.generatedSystems.get(`sys_${cur.x}_${cur.y}_${cur.z}`) ||
                    Object.values(gameState.galaxy.knownSystems).find(s => s.x === cur.x && s.y === cur.y && s.z === cur.z);
        if (sys) path.push(id); // dwell one tick

        // Turn behavior: 60% continue, 20% left, 20% right
        const r = rng();
        let dirIdx = CUBE_DIRS.findIndex(d => d.x === heading.x && d.y === heading.y && d.z === heading.z);
        if (dirIdx < 0) dirIdx = 0;
        if (r < 0.2) dirIdx = (dirIdx + 5) % 6; // left
        else if (r < 0.4) dirIdx = (dirIdx + 1) % 6; // right
        heading = CUBE_DIRS[dirIdx];
        // Step
        cur = { x: cur.x + heading.x, y: cur.y + heading.y, z: cur.z + heading.z };
        if (!_withinBounds(cur)) {
            cur = _reflectIntoBounds(cur);
            // pick a new random heading
            heading = _choice(rng, CUBE_DIRS);
        }
    }
    return path;
}

function _generateNpcShips() {
    const cols = gameState.galaxy.hexGrid.cols;
    const rows = gameState.galaxy.hexGrid.rows;
    const totalCells = cols * rows;
    const desired = Math.max(1, Math.round(totalCells * 0.01));
    const result = [];

    const player = gameState.player.hexLocation;
    const playerId = cubeId(player.x, player.y, player.z);

    const seedBase = Math.floor(Date.now() % 2147483647);
    const globalRng = _mulberry32(seedBase);

    const shipTypes = ['scout1', 'scout2', 'scout3', 'scout4'];

    const rolePick = (rng) => {
        const r = rng();
        if (r < 0.55) return 'trader';
        if (r < 0.80) return 'pirate';
        return 'research';
    };

    const systems = _allSystemsList();

    let attempts = 0;
    while (result.length < desired && attempts++ < desired * 50) {
        const seed = _randInt(globalRng, 1, 0x7fffffff);
        const rng = _mulberry32(seed);
        // random origin within bounds
        const col = _randInt(rng, 0, cols - 1);
        const row = _randInt(rng, 0, rows - 1);
        const origin = offsetToCube(col, row);
        const d = cubeDistance(origin.x, origin.y, origin.z, player.x, player.y, player.z);
        if (d < 10) continue; // stay away from player start
        const role = rolePick(rng);
        const shipType = _choice(rng, shipTypes);
        const pattern = (rng() < 0.4 && systems.length >= 3) ? 'loop' : 'wander';
        let path;
        if (pattern === 'loop') path = _buildLoopPath(rng, origin, systems);
        else path = _buildWanderPath(rng, origin);
        if (!Array.isArray(path) || path.length < 20) continue;
        const phaseOffset = _randInt(rng, 0, path.length - 1);
        const npc = {
            id: `npc_${result.length}_${seed}`,
            seed,
            role,
            shipType,
            origin,
            pattern,
            path,
            loopLength: path.length,
            phaseOffset,
            speedMinutesPerHex: 10,
            dwellMinutes: 10,
            reputation: 0,
            lastInteraction: null
        };
        result.push(npc);
    }
    return result;
}

function _getNpcPathIndex(npc, phase) {
    return (phase + (npc.phaseOffset || 0)) % npc.path.length;
}

function getNpcPosition(npc, phase) {
    const idx = _getNpcPathIndex(npc, phase);
    const hexId = npc.path[idx];
    return hexId;
}

function _resolveNpcCollisions(intended) {
    // intended: array of { npc, hexId }
    const byHex = new Map();
    for (const item of intended) {
        const key = item.hexId;
        if (!byHex.has(key)) byHex.set(key, []);
        byHex.get(key).push(item);
    }
    const final = new Map(); // npc.id -> hexId
    for (const [hexId, list] of byHex) {
        if (list.length === 1) {
            final.set(list[0].npc.id, hexId);
            continue;
        }
        // Keep lowest-id (stable) in place
        list.sort((a, b) => a.npc.id.localeCompare(b.npc.id));
        final.set(list[0].npc.id, hexId);
        // Others dwell in their previous tile (phase-1)
        for (let i = 1; i < list.length; i++) {
            const npc = list[i].npc;
            const path = npc.path;
            const prevIdx = (_getNpcPathIndex(npc, gameState.npc._phase - 1) + path.length) % path.length;
            const prevHex = path[prevIdx];
            // If still colliding with someone else, they keep dwelling; no recursion to keep this O(N)
            final.set(npc.id, prevHex);
        }
    }
    return final;
}

function _recomputeNpcPositions() {
    const phase = _computeNpcPhase();
    gameState.npc._phase = phase;
    const intended = [];
    for (const npc of gameState.npc.ships) {
        intended.push({ npc, hexId: getNpcPosition(npc, phase) });
    }
    const finalMap = _resolveNpcCollisions(intended);
    gameState.npc._pos = finalMap; // Map npcId -> hexId
    // Determine encounter at player tile
    const player = gameState.player.hexLocation;
    const playerHex = cubeId(player.x, player.y, player.z);
    let encounter = null;
    for (const npc of gameState.npc.ships) {
        const hexId = finalMap.get(npc.id);
        if (hexId === playerHex) { encounter = npc; break; }
    }
    gameState.npc._encounter = encounter;
    updateNpcEncounterLayer();
    // If status box shows player hex, refresh its NPC section
    const current = gameState.ui.selectedHex;
    if (current && current === playerHex) {
        // Reopen to refresh content
        showHexStatusBox(current);
    }
}

function updateNpcEncounterLayer() {
    const svg = document.querySelector('#ascii-display svg');
    if (!svg) return;
    const existing = svg.querySelector('#npc-ships');
    if (existing) existing.remove();
    const npc = gameState.npc._encounter;
    if (!npc) return;
    // Render single NPC near player center, facing center
    const hexWidth = gameState.galaxy.hexGrid.hexWidth;
    const hexHeight = hexWidth * (Math.sqrt(3) / 2);
    const { x, y, z } = gameState.player.hexLocation;
    const c = cubeToPixel(x, y, z, hexWidth, hexHeight);
    const offset = 18;
    // place NPC opposite to current player ship rotation if available
    const rot = (gameState.player.shipRotation || 0);
    const rad = (rot - 90) * Math.PI / 180; // player facing forward -> NPC offset opposite
    const nx = c.x - Math.cos(rad) * offset;
    const ny = c.y - Math.sin(rad) * offset;
    const faceAngle = Math.atan2(c.y - ny, c.x - nx) * 180 / Math.PI + 90;
    const shipAssets = {
        'scout1': 'assets/scout_class_1.png',
        'scout2': 'assets/scout_class_2.png',
        'scout3': 'assets/scout_class_3.png',
        'scout4': 'assets/scout_class_4.png'
    };
    const asset = shipAssets[npc.shipType] || shipAssets['scout1'];
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('id', 'npc-ships');
    group.setAttribute('pointer-events', 'none');
    group.innerHTML = `<g class="npc-ship" transform="translate(${nx}, ${ny}) rotate(${faceAngle})">
        <image href="${asset}" x="-16" y="-16" width="32" height="32" opacity="0.95" />
      </g>`;
    svg.appendChild(group);
    if (gameState.npc._debugPaths) {
        try { renderNpcPathDebug(); } catch (e) { /* ignore */ }
    }
}

function initializeNpcSystem() {
    // Ensure container exists
    gameState.npc = gameState.npc || { ships: [] };
    // Generate on first run
    if (!gameState.npc.ships || gameState.npc.ships.length === 0) {
        try {
            const ships = _generateNpcShips();
            gameState.npc.ships = ships;
            console.log(`NPC: generated ${ships.length} ships`);
            saveGameState();
        } catch (e) {
            console.error('Failed generating NPC ships', e);
            gameState.npc.ships = [];
        }
    }
    // Initial recompute
    _recomputeNpcPositions();
    // Low cadence timer (~15s)
    if (gameState.npc._timer) clearInterval(gameState.npc._timer);
    gameState.npc._timer = setInterval(() => {
        const newPhase = _computeNpcPhase();
        if (gameState.npc._phase !== newPhase) {
            _recomputeNpcPositions();
        } else {
            // Also recompute if player tile changed (rare outside nav handler)
            _recomputeNpcPositions();
        }
    }, 15000);
}

// Simple role interactions (free)
function hailNpc(npcId) {
    const npc = (gameState.npc.ships || []).find(n => n.id === npcId);
    if (!npc) return;
    let title = 'Hailing';
    let body = '';
    if (npc.role === 'trader') body = 'Trader: Greetings, captain. Interested in a quick deal?';
    else if (npc.role === 'pirate') body = 'Pirate: This is our turf. Watch yourself.';
    else body = 'Researcher: Fascinating readings in this region. Care to share data?';
    showGameDialog(title, body);
    npc.lastInteraction = { ts: Date.now(), kind: 'hail' };
}

function tradeWithNpc(npcId) {
    const npc = (gameState.npc.ships || []).find(n => n.id === npcId);
    if (!npc || npc.role !== 'trader') return;
    
    // Generate or retrieve NPC market
    const npcMarketId = `npc_${npcId}`;
    if (!gameState.markets) {
        gameState.markets = new Map();
    }
    
    // Generate fresh market for this NPC if not cached or if it's been a while
    const lastGenerated = npc.marketGeneratedAt || 0;
    const hoursSinceGenerated = (Date.now() - lastGenerated) / (1000 * 60 * 60);
    
    if (!gameState.markets.has(npcMarketId) || hoursSinceGenerated > 1) {
        const npcMarket = generateNpcMarket(npc);
        gameState.markets.set(npcMarketId, npcMarket);
        npc.marketGeneratedAt = Date.now();
    }
    
    // Open trading window with NPC market
    openTradingWindowForNpc(npcMarketId, npc);
}

// Generate special market for NPC traders
function generateNpcMarket(npc) {
    const market = {
        systemName: `${npc.name || 'Trader Ship'}`,
        security: { name: 'Mobile Trader', catchRate: 0.05, illegalPenalty: 0.30 }, // Low risk, good illegal prices
        buyPrices: new Map(),
        sellPrices: new Map(),
        inventory: new Map(),
        isNpc: true,
        npcId: npc.id
    };
    
    // NPC traders have limited but interesting inventory
    const resourcePool = Object.keys(RESOURCE_TYPES);
    const numResources = 5 + Math.floor(Math.random() * 4); // 5-8 different resources
    
    // Ensure at least one illegal good for excitement
    const selectedResources = ['Contraband'];
    
    // Add random resources
    while (selectedResources.length < numResources) {
        const resource = resourcePool[Math.floor(Math.random() * resourcePool.length)];
        if (!selectedResources.includes(resource)) {
            selectedResources.push(resource);
        }
    }
    
    // Generate prices with NPC trader advantages
    for (const resourceName of selectedResources) {
        const resourceData = RESOURCE_TYPES[resourceName];
        const [minPrice, maxPrice] = resourceData.basePrice;
        
        // NPC traders offer competitive prices
        const basePrice = minPrice + Math.random() * (maxPrice - minPrice);
        
        if (resourceData.category === 'Illegal') {
            // Better prices for illegal goods from mobile traders
            const buyPrice = Math.floor(basePrice * 1.2);
            const sellPrice = Math.floor(basePrice * 0.95); // Great sell prices
            market.buyPrices.set(resourceName, buyPrice);
            market.sellPrices.set(resourceName, sellPrice);
        } else {
            // Normal prices for legal goods
            const buyPrice = Math.floor(basePrice);
            const sellPrice = Math.floor(basePrice * 0.8);
            market.buyPrices.set(resourceName, buyPrice);
            market.sellPrices.set(resourceName, sellPrice);
        }
        
        // Limited inventory (2-6 units)
        const inventory = 2 + Math.floor(Math.random() * 5);
        market.inventory.set(resourceName, inventory);
    }
    
    return market;
}

// Open trading window for NPC
function openTradingWindowForNpc(marketId, npc) {
    const market = gameState.markets.get(marketId);
    if (!market) return;
    
    // Update UI for NPC trading
    document.getElementById('market-system-name').textContent = market.systemName;
    document.getElementById('market-security').textContent = `Mobile Trader - Low Security`;
    document.getElementById('market-security').className = 'security-level security-frontier';
    
    document.getElementById('trade-credits').textContent = gameState.player.credits;
    document.getElementById('trade-cargo-used').textContent = gameState.player.cargo.usedSpace;
    document.getElementById('trade-cargo-capacity').textContent = gameState.player.cargo.capacity;
    
    // Store current market context
    gameState.currentMarketId = marketId;
    gameState.currentMarketType = 'npc';
    
    // Populate buy/sell lists
    populateBuyList(market);
    populateSellList(market);
    
    // Show the modal
    document.getElementById('trading-window').classList.remove('hidden');
    
    // Record interaction
    npc.lastInteraction = { ts: Date.now(), kind: 'trade' };
}

function fleeNpc(npcId) {
    const npc = (gameState.npc.ships || []).find(n => n.id === npcId);
    if (!npc) return;
    showGameDialog('Flee', 'You disengage and keep your distance.');
    npc.lastInteraction = { ts: Date.now(), kind: 'flee' };
}

function infoFromNpc(npcId) {
    const npc = (gameState.npc.ships || []).find(n => n.id === npcId);
    if (!npc) return;
    showGameDialog('Shared Research', 'The researcher transmits hints about a nearby anomaly.');
    npc.lastInteraction = { ts: Date.now(), kind: 'info' };
}

// =========================
// DEV TOOLS: NPC
// =========================
function devRecomputeNpcs() {
    try {
        _recomputeNpcPositions();
        showGameDialog('NPCs', 'NPC positions recomputed.');
    } catch (e) {
        alert('Failed to recompute NPCs: ' + e.message);
    }
}

function devListNpcs() {
    try {
        if (!gameState.npc._pos) _recomputeNpcPositions();
        const phase = gameState.npc._phase || _computeNpcPhase();
        const rows = [];
        const player = gameState.player.hexLocation;
        const playerHex = cubeId(player.x, player.y, player.z);
        for (const npc of gameState.npc.ships) {
            const hexId = gameState.npc._pos?.get(npc.id) || getNpcPosition(npc, phase);
            const { x, y, z } = parseCubeId(hexId);
            const d = cubeDistance(player.x, player.y, player.z, x, y, z);
            rows.push({ id: npc.id, role: npc.role, ship: npc.shipType, hexId, d });
        }
        rows.sort((a,b)=>a.d - b.d);
        const top = rows.slice(0, 12).map(r => `${r.d}H • ${r.role} • ${r.ship} • ${r.id} @ ${r.hexId}${r.hexId===playerHex?' (HERE)':''}`);
        const more = rows.length > 12 ? `\n… and ${rows.length - 12} more` : '';
        showGameDialog('NPCs (nearest first)', top.join('\n') + more);
    } catch (e) {
        alert('Failed to list NPCs: ' + e.message);
    }
}

function _clearNpcPathDebug() {
    const svg = document.querySelector('#ascii-display svg');
    if (!svg) return;
    const g = svg.querySelector('#npc-paths-debug');
    if (g) g.remove();
}

function renderNpcPathDebug(npcArg) {
    _clearNpcPathDebug();
    const svg = document.querySelector('#ascii-display svg');
    if (!svg) return;
    const hexWidth = gameState.galaxy.hexGrid.hexWidth;
    const hexHeight = hexWidth * (Math.sqrt(3) / 2);
    const phase = gameState.npc._phase || _computeNpcPhase();
    let npc = npcArg || gameState.npc._encounter;
    if (!npc) {
        showGameDialog('NPC Path', 'No encounter in this hex. Path overlay disabled.');
        return;
    }
    // Build sampled points to keep DOM small
    const pts = [];
    const step = Math.max(1, Math.ceil(npc.path.length / 300));
    for (let i = 0; i < npc.path.length; i += step) {
        const { x, y, z } = parseCubeId(npc.path[i]);
        const p = cubeToPixel(x, y, z, hexWidth, hexHeight);
        pts.push(`${p.x},${p.y}`);
    }
    const curIdx = _getNpcPathIndex(npc, phase);
    const curHex = parseCubeId(npc.path[curIdx]);
    const cur = cubeToPixel(curHex.x, curHex.y, curHex.z, hexWidth, hexHeight);
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('id', 'npc-paths-debug');
    g.setAttribute('pointer-events', 'none');
    g.innerHTML = `
      <polyline points="${pts.join(' ')}" fill="none" stroke="#00FF41" stroke-opacity="0.25" stroke-width="2" />
      <circle cx="${cur.x}" cy="${cur.y}" r="6" fill="#00FF41" fill-opacity="0.6" />
    `;
    const playerShip = svg.querySelector('#player-ship');
    if (playerShip) playerShip.insertAdjacentElement('beforebegin', g);
    else svg.appendChild(g);
}

function toggleNpcPathDebug() {
    gameState.npc._debugPaths = !gameState.npc._debugPaths;
    if (gameState.npc._debugPaths) renderNpcPathDebug();
    else _clearNpcPathDebug();
}

function devShowNearestNpcPath() {
    try {
        if (!gameState.npc._pos) _recomputeNpcPositions();
        const player = gameState.player.hexLocation;
        let best = null, bestD = Infinity;
        const phase = gameState.npc._phase || _computeNpcPhase();
        for (const npc of gameState.npc.ships) {
            const hexId = gameState.npc._pos?.get(npc.id) || getNpcPosition(npc, phase);
            const { x, y, z } = parseCubeId(hexId);
            const d = cubeDistance(player.x, player.y, player.z, x, y, z);
            if (d < bestD) { bestD = d; best = npc; }
        }
        if (!best) { alert('No NPCs found'); return; }
        renderNpcPathDebug(best);
        showGameDialog('Nearest NPC Path', `${best.role} • ${best.shipType} • distance ${bestD}H\nPath overlay rendered.`);
    } catch (e) {
        alert('Failed: ' + e.message);
    }
}

function devTeleportToNearestNpc() {
    try {
        if (!gameState.npc._pos) _recomputeNpcPositions();
        const player = gameState.player.hexLocation;
        let best = null, bestD = Infinity;
        const phase = gameState.npc._phase || _computeNpcPhase();
        for (const npc of gameState.npc.ships) {
            const hexId = gameState.npc._pos?.get(npc.id) || getNpcPosition(npc, phase);
            const { x, y, z } = parseCubeId(hexId);
            const d = cubeDistance(player.x, player.y, player.z, x, y, z);
            if (d < bestD) { bestD = d; best = { npc, hexId, x, y, z }; }
        }
        if (!best) { alert('No NPCs found'); return; }
        // Teleport without AP cost
        const destHexId = best.hexId;
        gameState.player.hexLocation = { x: best.x, y: best.y, z: best.z };
        setHexState(destHexId, 'visited');
        // First-time discovery handling
        handleFirstDiscoveries(destHexId, gameState.galaxy.resources.hexResources.get(destHexId));
        _recomputeNpcPositions();
        updateScreen('map');
        updatePlayerShipOnly();
        updateStatusPanel();
        centerMapOnPlayer();
        showGameDialog('Teleported', `Teleported to nearest NPC (${bestD}H): ${best.npc.role} • ${best.npc.shipType}`);
    } catch (e) {
        alert('Failed teleport: ' + e.message);
    }
}

// Sweep Scan: scans in a small radius around the selected hex (or player) and records readings
function sweepScan() {
    if (gameState.animation.isShipMoving) return;
    if (!hasScanCapability('sweep')) {
        alert('Sweep Scan unavailable. Upgrade your ship or enable dev unlock.');
        return;
    }
    const centerHexId = gameState.ui.selectedHex || cubeId(gameState.player.hexLocation.x, gameState.player.hexLocation.y, gameState.player.hexLocation.z);
    if (!centerHexId) return;

    // AP check (2 AP)
    const apCost = 2;
        if (gameState.player.actionPoints < apCost) {
            showGameDialog('Insufficient AP', 'Sweep Scan requires 2 AP. Your AP are depleted.');
            return;
        }

    const ship = gameState.player.shipType || 'scout1';
    const params = SCAN_PARAMS[ship] || SCAN_PARAMS['scout1'];
    const radius = Math.max(1, params.sweepRadius || 2);

    const { x: cx, y: cy, z: cz } = parseCubeId(centerHexId);
    const scannedHexIds = [];

    // Iterate cube coordinates within distance <= radius
    for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = Math.max(-radius, -dx - radius); dy <= Math.min(radius, -dx + radius); dy++) {
            const dz = -dx - dy;
            const x = cx + dx, y = cy + dy, z = cz + dz;
            const hexId = cubeId(x, y, z);
            // Record reading
            try {
                const reading = getScanReading(hexId, 'sweep');
                const existing = gameState.galaxy.hexGrid.hexData.get(hexId) || {};
                gameState.galaxy.hexGrid.hexData.set(hexId, { ...existing, scan: { ...reading, ts: Date.now() } });
            } catch (e) { /* ignore */ }
            // Set scanned state if not visited/claimed
            if (!gameState.galaxy.hexGrid.visitedHexes.has(hexId) && !gameState.galaxy.hexGrid.claimedHexes.has(hexId)) {
                setHexState(hexId, 'scanned');
                scannedHexIds.push(hexId);
            }
        }
    }

    // Deduct AP and refresh
    gameState.player.actionPoints = Math.max(0, gameState.player.actionPoints - apCost);
    updateHexStatesPreservingBackground();
    showHexStatusBox(centerHexId);
    updateStatusPanel();
    // Render transient overlay arrows for scanned hexes
    const overlaySet = new Set(scannedHexIds);
    overlaySet.add(centerHexId);
    renderScanOverlay(Array.from(overlaySet));
    console.log(`[SWEEP] radius=${radius}, scanned ${scannedHexIds.length} hexes`);
    autoSave();
}

// Transient overlay for scan results (arrows/pips)
function removeScanOverlay() {
    const svg = document.querySelector('#ascii-display svg');
    if (!svg) return;
    const existing = svg.querySelector('#scan-overlay');
    if (existing) existing.remove();
    if (gameState.ui && gameState.ui.scanOverlayTimeout) {
        clearTimeout(gameState.ui.scanOverlayTimeout);
        gameState.ui.scanOverlayTimeout = null;
    }
}

function dirToAngleRad(dir) {
    // 0 rad = E; negative angles point upward.
    switch ((dir || '').toUpperCase()) {
        case 'E': return 0;
        case 'NE': return -Math.PI / 3;      // -60°
        case 'NW': return -2 * Math.PI / 3;  // -120°
        case 'W': return Math.PI;            // 180°
        case 'SW': return 2 * Math.PI / 3;   // 120°
        case 'SE': return Math.PI / 3;       // 60°
        case 'N': return -Math.PI / 2;
        case 'S': return Math.PI / 2;
        default: return 0;
    }
}

function renderScanOverlay(hexIds, durationMs = 4000) {
    const svg = document.querySelector('#ascii-display svg');
    if (!svg) return;
    removeScanOverlay();
    const hexWidth = 130;
    const hexHeight = hexWidth * (Math.sqrt(3) / 2);
    let group = '<g id="scan-overlay" opacity="0.95" pointer-events="none">';
    for (const hexId of hexIds) {
        const data = gameState.galaxy.hexGrid.hexData.get(hexId);
        const scan = data && data.scan;
        if (!scan) continue;
        const { x, y, z } = parseCubeId(hexId);
        const center = cubeToPixel(x, y, z, hexWidth, hexHeight);
        const radius = hexWidth / 2;
        const len = Math.max(8, Math.min(16, radius * 0.35));
        const angle = dirToAngleRad(scan.dir);
        const endX = center.x + len * Math.cos(angle);
        const endY = center.y + len * Math.sin(angle);
        const color = '#66CCFF';
        const op = scan.conf === 'strong' ? 0.95 : (scan.conf === 'med' ? 0.8 : 0.6);
        group += `
          <g class="scan-arrow" data-hex="${hexId}">
            <line x1="${center.x}" y1="${center.y}" x2="${endX}" y2="${endY}" stroke="${color}" stroke-width="2" stroke-linecap="round" opacity="${op}" />
            <circle cx="${endX}" cy="${endY}" r="2" fill="${color}" opacity="${op}" />
          </g>`;
    }
    group += '</g>';
    // Insert near top (before player ship) so arrows are visible
    const ship = svg.querySelector('#player-ship');
    if (ship) ship.insertAdjacentHTML('beforebegin', group);
    else svg.insertAdjacentHTML('beforeend', group);
    // Auto-remove after duration
    gameState.ui.scanOverlayTimeout = setTimeout(removeScanOverlay, durationMs);
}

// Check if two cube coordinates are within a given range (inclusive)
function isWithinCubeRange(x1, y1, z1, x2, y2, z2, range) {
    return cubeDistance(x1, y1, z1, x2, y2, z2) <= range;
}

// Check if a destination is adjacent (for light drive)
function isAdjacentHex(destCol, destRow) {
    const {x, y, z} = gameState.player.hexLocation;
    const {col: playerCol, row: playerRow} = cubeToOffset(x, y, z);
    
    // Debug logging
    console.log(`Checking adjacency: Player(${playerCol},${playerRow}) to Dest(${destCol},${destRow})`);
    
    // Try simpler approach - check all 6 hex directions manually
    const directions = [
        [0, -1],   // North
        [1, -1],   // Northeast  
        [1, 0],    // Southeast
        [0, 1],    // South
        [-1, 1],   // Southwest
        [-1, 0]    // Northwest
    ];
    
    // Adjust for odd/even rows in offset coordinates
    const evenRowDirections = [
        [0, -1], [1, -1], [1, 0], [0, 1], [-1, 0], [-1, -1]
    ];
    const oddRowDirections = [
        [0, -1], [1, -1], [1, 0], [0, 1], [-1, 0], [-1, -1]
    ];
    
    const dirs = (playerRow % 2 === 0) ? evenRowDirections : oddRowDirections;
    
    for (let [dCol, dRow] of dirs) {
        const neighborCol = playerCol + dCol;
        const neighborRow = playerRow + dRow;
        if (neighborCol === destCol && neighborRow === destRow) {
            console.log(`Found adjacent match: ${destCol},${destRow}`);
            return true;
        }
    }
    
    console.log(`Not adjacent: ${destCol},${destRow}`);
    return false;
}

// Generate appropriate drive buttons based on destination
function generateDriveButtons(destCol, destRow) {
    let buttons = '';
    
    const {x: playerX, y: playerY, z: playerZ} = gameState.player.hexLocation;
    
    // Convert destination offset to cube for comparison
    const {x: destX, y: destY, z: destZ} = offsetToCube(destCol, destRow);
    
    const isCurrentLocation = (destX === playerX && destY === playerY && destZ === playerZ);
    const dist = cubeDistance(destX, destY, destZ, playerX, playerY, playerZ);
    const inRange = dist >= 1 && dist <= 5;
    const apCost = inRange ? (1 + dist) : null;
    
    if (isCurrentLocation) {
        // Player clicked on their current location - check for warp lanes
        const availableDestinations = getAvailableWarpDestinations();
        const atWormhole = isWormholeTermination(cubeId(playerX, playerY, playerZ));
        if (availableDestinations.length > 0) {
            buttons += `<button class="hex-action-btn" onclick="showWarpDestinations()">Warp Drive (5 AP)</button>`;
        } else if (atWormhole) {
            buttons += `<button class="hex-action-btn" onclick="handleWormholeWarp()">Warp Drive (5 AP)</button>`;
        } else {
            buttons += `<button class="hex-action-btn" disabled>No Warp Lanes</button>`;
        }
    } else {
        // Player clicked on different location - check light drive only
        if (inRange) {
            const title = (gameState.player.actionPoints < apCost) ? `title="Need ${apCost} AP"` : '';
            // Always allow click; handler will show a game-styled dialog if AP are insufficient
            buttons += `<button class="hex-action-btn" onclick="handleLightDrive()" ${title}>Light Drive (${apCost} AP)</button>`;
        } else {
            buttons += `<button class="hex-action-btn" disabled>Too Far for Light Drive</button>`;
        }
    }
    
    return buttons;
}

// Dev tool: Clear all wormholes
function clearWormholes() {
    gameState.galaxy.wormholes = { lanes: [] };
    console.log('Cleared all wormholes.');
    updateScreen('map');
    autoSave();
    toggleDevMenu();
}

// Dev tool: Procedurally generate wormholes per design rules
function generateWormholes(silent = false) {
    const cols = gameState.galaxy.hexGrid.cols;
    const rows = gameState.galaxy.hexGrid.rows;
    const hexWidth = gameState.galaxy.hexGrid.hexWidth;
    const hexHeight = hexWidth * (Math.sqrt(3) / 2);
    const svgWidth = cols * hexWidth * 0.75 + hexWidth * 0.25;
    const svgHeight = rows * hexHeight + hexHeight * 0.5;
    const mapDiagonal = Math.hypot(svgWidth, svgHeight);
    const minLen = 0.25 * mapDiagonal;
    const maxLen = 0.8 * mapDiagonal;

    const totalCells = cols * rows;
    const targetLanes = Math.floor(totalCells / 100);

    // Build blocked set: systems + resource tiles
    const blocked = new Set();
    for (const sys of Object.values(gameState.galaxy.knownSystems)) {
        blocked.add(cubeId(sys.x, sys.y, sys.z));
    }
    for (const [sysId, sys] of gameState.galaxy.generatedSystems) {
        if (sys && allFinite(sys.x, sys.y, sys.z)) {
            blocked.add(cubeId(sys.x, sys.y, sys.z));
        }
    }
    for (const hexId of gameState.galaxy.resources.hexResources.keys()) {
        blocked.add(hexId);
    }

    // Helper to compute pixel center
    function centerOf(hexId) {
        const {x, y, z} = parseCubeId(hexId);
        return cubeToPixel(x, y, z, hexWidth, hexHeight);
    }

    // Generate candidate hex IDs list (all cells)
    const allHexIds = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const {x, y, z} = offsetToCube(col, row);
            allHexIds.push(cubeId(x, y, z));
        }
    }

    // Utility to check min separation between terminations
    function isFarFromExisting(hexId, terminations, minHexDist) {
        const {x: x1, y: y1, z: z1} = parseCubeId(hexId);
        for (const t of terminations) {
            const {x: x2, y: y2, z: z2} = parseCubeId(t);
            if (cubeDistance(x1, y1, z1, x2, y2, z2) < minHexDist) return false;
        }
        return true;
    }

    const lanes = [];
    const terminations = new Set();
    let attempts = 0;
    const maxAttempts = targetLanes * 200;
    while (lanes.length < targetLanes && attempts++ < maxAttempts) {
        // Pick two distinct random candidates
        const a = allHexIds[Math.floor(Math.random() * allHexIds.length)];
        const b = allHexIds[Math.floor(Math.random() * allHexIds.length)];
        if (a === b) continue;
        if (blocked.has(a) || blocked.has(b)) continue;
        if (terminations.has(a) || terminations.has(b)) continue; // one lane per termination
        if (!isFarFromExisting(a, terminations, 5) || !isFarFromExisting(b, terminations, 5)) continue;

        // Length constraint in pixels
        const ca = centerOf(a);
        const cb = centerOf(b);
        const d = Math.hypot(ca.x - cb.x, ca.y - cb.y);
        if (d < minLen || d > maxLen) continue;

        lanes.push({ a, b });
        terminations.add(a);
        terminations.add(b);
    }

    gameState.galaxy.wormholes = { lanes };
    console.log(`Generated ${lanes.length} wormhole lanes (target ${targetLanes}).`);
    updateScreen('map');
    // Persist lanes so they survive refresh
    autoSave();
    toggleDevMenu();
}

// Wormhole helpers and actions
function isWormholeTermination(hexId) {
    const lanes = gameState.galaxy.wormholes?.lanes || [];
    return lanes.some(l => l.a === hexId || l.b === hexId);
}
function getWormholePartner(hexId) {
    const lanes = gameState.galaxy.wormholes?.lanes || [];
    for (const l of lanes) {
        if (l.a === hexId) return l.b;
        if (l.b === hexId) return l.a;
    }
    return null;
}
function toggleWormholeReveal(hexId) {
    if (gameState.ui.revealedWormhole === hexId) gameState.ui.revealedWormhole = null;
    else gameState.ui.revealedWormhole = hexId;
    updateWormholesOnly();
}
function updateWormholesOnly() {
    const svg = document.querySelector('#ascii-display svg');
    if (!svg) return;
    const existing = svg.querySelector('#wormholes');
    const hexWidth = 130;
    const hexHeight = hexWidth * (Math.sqrt(3) / 2);
    const newGroup = renderWormholes(hexWidth, hexHeight);
    if (existing) {
        existing.outerHTML = newGroup;
    } else {
        const ship = svg.querySelector('#player-ship');
        if (ship) {
            ship.insertAdjacentHTML('beforebegin', newGroup);
        } else {
            svg.insertAdjacentHTML('beforeend', newGroup);
        }
    }
}

// Dev toggle to reveal all wormholes regardless of discovery
function toggleShowAllWormholes() {
    gameState.ui.showAllWormholes = !gameState.ui.showAllWormholes;
    updateWormholesOnly();
}
function handleWormholeWarp() {
    if (gameState.animation.isShipMoving) return;
    const currentHexId = cubeId(gameState.player.hexLocation.x, gameState.player.hexLocation.y, gameState.player.hexLocation.z);
    const partner = getWormholePartner(currentHexId);
    if (!partner) {
        alert('No wormhole connection from this location.');
        return;
    }
    // Precompute control point to match rendered path (use canonical pair order a->b)
    const lane = (gameState.galaxy.wormholes?.lanes || []).find(l => (l.a === currentHexId && l.b === partner) || (l.b === currentHexId && l.a === partner));
    if (lane) {
        const hexWidth = 130;
        const hexHeight = hexWidth * (Math.sqrt(3) / 2);
        const {x: ax, y: ay, z: az} = parseCubeId(lane.a);
        const {x: bx, y: by, z: bz} = parseCubeId(lane.b);
        const aPos = cubeToPixel(ax, ay, az, hexWidth, hexHeight);
        const bPos = cubeToPixel(bx, by, bz, hexWidth, hexHeight);
        const midX = (aPos.x + bPos.x) / 2;
        const midY = (aPos.y + bPos.y) / 2;
        const dx = bPos.x - aPos.x;
        const dy = bPos.y - aPos.y;
        const controlX = midX - dy * 0.2;
        const controlY = midY + dx * 0.2;
        gameState.ui.forcedWarpControl = { x: controlX, y: controlY };
    } else {
        gameState.ui.forcedWarpControl = null;
    }
    gameState.ui.selectedHex = partner;
    // Use existing curved warp animation pathing
    animateWarpDrive(partner);
}

// Update only hex state visuals without regenerating the entire map
function updateHexStatesPreservingBackground() {
    const svg = document.querySelector('#ascii-display svg');
    if (!svg) return;
    
    // Find and remove only the hex state elements, preserving everything else
    const existingBackgrounds = svg.querySelector('#hex-backgrounds');
    const existingBorders = svg.querySelector('#region-borders');
    
    if (existingBackgrounds) existingBackgrounds.remove();
    if (existingBorders) existingBorders.remove();
    
    // Get the dimensions from the original grid
    const hexWidth = 130;
    const hexHeight = hexWidth * (Math.sqrt(3) / 2);
    const hexRadius = hexWidth / 2;
    const gridCols = 60;
    const gridRows = 60;
    
    // Regenerate only hex backgrounds (scan lines, etc)
    let backgroundElements = '<g id="hex-backgrounds" pointer-events="none">';
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
            const x = col * hexWidth * 0.75;
            const y = row * hexHeight + (col % 2) * hexHeight * 0.5;
            
            const hexPath = createHexPath(x + hexRadius, y + hexHeight/2, hexRadius);
            
            const centerX = x + hexRadius;
            const centerY = y + hexHeight/2;
            const {x: hx, y: hy, z: hz} = offsetToCube(col, row);
            const hexId = cubeId(hx, hy, hz);
            
            // Resource site graphics (only for visited/claimed)
            const isVisited = gameState.galaxy.hexGrid.visitedHexes.has(hexId);
            const isClaimed = gameState.galaxy.hexGrid.claimedHexes.has(hexId);
            if (isVisited || isClaimed) {
                const hexResources = gameState.galaxy.resources.hexResources.get(hexId);
                if (hexResources && (hexResources.specialSite || hexResources.siteType)) {
                    const rawType = hexResources.specialSite ? hexResources.specialSite.type : hexResources.siteType;
                    const norm = String(rawType || '').replace(/\s+/g, '').toLowerCase();
                    const renderers = {
                        asteroidfield: createAsteroidFieldGraphics,
                        comettrail: createCometTrailGraphics,
                        derelictship: createDerelictShipGraphics,
                        roguetrader: createRogueTraderGraphics,
                        gasharvesting: createGasHarvestingGraphics,
                        gasharvester: createGasHarvestingGraphics,
                        ancientruins: createAncientRuinsGraphics,
                        nebulapocket: createNebulaPocketGraphics,
                        piratecache: createPirateCacheGraphics,
                        researchprobe: createResearchProbeGraphics,
                        stellarphenomena: createStellarPhenomenaGraphics
                    };
                    const renderer = renderers[norm];
                    const resourceGraphics = renderer
                        ? renderer(centerX, centerY, hexRadius)
                        : createGenericResourceGraphics(centerX, centerY, hexRadius);
                    backgroundElements += `
                        <g class="resource-site-graphics" pointer-events="none">
                            <clipPath id="resource-clip-${col}-${row}">
                                <path d="${hexPath}"/>
                            </clipPath>
                            <g clip-path="url(#resource-clip-${col}-${row})">${resourceGraphics}</g>
                        </g>`;
                }
            }

            // Check cell state and apply appropriate graphics
            // Priority order: CLAIMED > VISITED > SCANNED
            if (gameState.galaxy.hexGrid.claimedHexes.has(hexId)) {
                // CLAIMED: No individual border (handled by region border system)
            } else if (gameState.galaxy.hexGrid.visitedHexes.has(hexId)) {
                // VISITED: No individual border (handled by region border system)
            } else if (gameState.galaxy.hexGrid.scannedHexes.has(hexId)) {
                // SCANNED: Old CRT screen scan lines (only shown if not visited)
                let scanLines = '';
                for (let i = 0; i < 12; i++) {
                    const offset = i * 6 - 30;
                    const opacity = 0.15 + (Math.sin(i * 0.5) * 0.08);
                    scanLines += `<line x1="${centerX - hexRadius + offset}" y1="${centerY - hexRadius*0.6}" 
                                       x2="${centerX + hexRadius + offset}" y2="${centerY + hexRadius*0.6}" 
                                       stroke="#00FF41" stroke-width="2" opacity="${opacity}"/>`;
                }
                // Add horizontal interference lines
                for (let i = 0; i < 3; i++) {
                    const yOffset = (i - 1) * 20;
                    scanLines += `<line x1="${centerX - hexRadius*0.8}" y1="${centerY + yOffset}" 
                                       x2="${centerX + hexRadius*0.8}" y2="${centerY + yOffset}" 
                                       stroke="#00FF41" stroke-width="0.8" opacity="0.1"/>`;
                }
                backgroundElements += `<g class="hex-scanned-background">
                                        <clipPath id="hex-clip-${col}-${row}">
                                            <path d="${hexPath}"/>
                                        </clipPath>
                                        <g clip-path="url(#hex-clip-${col}-${row})">${scanLines}</g>
                                     </g>`;
            }
        }
    }
    backgroundElements += '</g>';
    
    // Regenerate region borders using the EXACT same logic as the original generateHexGrid
    let regionBorders = '<g id="region-borders" pointer-events="none">';
    
    // Copy the exact border generation from the working code
    if (gameState.galaxy.hexGrid.visitedHexes && gameState.galaxy.hexGrid.visitedHexes.size > 0) {
        for (const hexId of gameState.galaxy.hexGrid.visitedHexes) {
            const {x: hx, y: hy, z: hz} = parseCubeId(hexId);
            const exposedEdges = getExposedEdgesCube(hx, hy, hz, gameState.galaxy.hexGrid.visitedHexes);
            const center = cubeToPixel(hx, hy, hz, hexWidth, hexHeight);
            const centerX = center.x;
            const centerY = center.y;
            
            // Use the SAME edge drawing logic as the original working code
            for (let i = 0; i < 6; i++) {
                const isDrawn = exposedEdges[i];
                if (isDrawn) {
                    const corner1 = i;
                    const corner2 = (i + 1) % 6;
                    const angle1 = (Math.PI / 3) * corner1;
                    const angle2 = (Math.PI / 3) * corner2;
                    const x1 = centerX + hexRadius * Math.cos(angle1);
                    const y1 = centerY + hexRadius * Math.sin(angle1);
                    const x2 = centerX + hexRadius * Math.cos(angle2);
                    const y2 = centerY + hexRadius * Math.sin(angle2);
                    
                    regionBorders += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#00FF41" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.7"/>`;
                }
            }
        }
    }
    
    // Claimed hexes
    if (gameState.galaxy.hexGrid.claimedHexes && gameState.galaxy.hexGrid.claimedHexes.size > 0) {
        for (const hexId of gameState.galaxy.hexGrid.claimedHexes) {
            const {x: hx, y: hy, z: hz} = parseCubeId(hexId);
            const exposedEdges = getExposedEdgesCube(hx, hy, hz, gameState.galaxy.hexGrid.claimedHexes);
            const center = cubeToPixel(hx, hy, hz, hexWidth, hexHeight);
            const centerX = center.x;
            const centerY = center.y;
            
            for (let i = 0; i < 6; i++) {
                const isDrawn = exposedEdges[i];
                if (isDrawn) {
                    const corner1 = i;
                    const corner2 = (i + 1) % 6;
                    const angle1 = (Math.PI / 3) * corner1;
                    const angle2 = (Math.PI / 3) * corner2;
                    const x1 = centerX + hexRadius * Math.cos(angle1);
                    const y1 = centerY + hexRadius * Math.sin(angle1);
                    const x2 = centerX + hexRadius * Math.cos(angle2);
                    const y2 = centerY + hexRadius * Math.sin(angle2);
                    
                    regionBorders += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#00FF41" stroke-width="3" opacity="0.9"/>`;
                }
            }
        }
    }
    
    // Scanned hexes (thin dashed borders - only show if not in other categories)
    if (gameState.galaxy.hexGrid.scannedHexes && gameState.galaxy.hexGrid.scannedHexes.size > 0) {
        for (const hexId of gameState.galaxy.hexGrid.scannedHexes) {
            // Skip if this hex is visited or claimed (priority system)
            if (gameState.galaxy.hexGrid.visitedHexes.has(hexId) || gameState.galaxy.hexGrid.claimedHexes.has(hexId)) {
                continue;
            }
            
            const {x: hx, y: hy, z: hz} = parseCubeId(hexId);
            const exposedEdges = getExposedEdgesCube(hx, hy, hz, gameState.galaxy.hexGrid.scannedHexes);
            const center = cubeToPixel(hx, hy, hz, hexWidth, hexHeight);
            const centerX = center.x;
            const centerY = center.y;
            
            for (let i = 0; i < 6; i++) {
                const isDrawn = exposedEdges[i];
                if (isDrawn) {
                    const corner1 = i;
                    const corner2 = (i + 1) % 6;
                    const angle1 = (Math.PI / 3) * corner1;
                    const angle2 = (Math.PI / 3) * corner2;
                    const x1 = centerX + hexRadius * Math.cos(angle1);
                    const y1 = centerY + hexRadius * Math.sin(angle1);
                    const x2 = centerX + hexRadius * Math.cos(angle2);
                    const y2 = centerY + hexRadius * Math.sin(angle2);
                    
                    regionBorders += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#00FF41" stroke-width="0.8" stroke-dasharray="2,10" opacity="0.5"/>`;
                }
            }
        }
    }
    
    regionBorders += '</g>';
    
    // Insert the new elements at the correct position (after hex-grid, before solar systems)
    const hexGrid = svg.querySelector('#hex-grid');
    const solarSystems = svg.querySelector('#solar-systems');
    
    if (hexGrid && solarSystems) {
        // Insert between hex-grid and solar-systems
        hexGrid.insertAdjacentHTML('afterend', backgroundElements + regionBorders);
    } else if (hexGrid) {
        // Fallback: insert after hex-grid
        hexGrid.insertAdjacentHTML('afterend', backgroundElements + regionBorders);
    } else {
        // Last resort: append to end
        svg.insertAdjacentHTML('beforeend', backgroundElements + regionBorders);
    }
}

// Calculate hex edge coordinates for a given edge index
function getHexEdgeCoordinates(centerX, centerY, hexRadius, edgeIndex) {
    // Validate inputs to prevent NaN
    if (isNaN(centerX) || isNaN(centerY) || isNaN(hexRadius) || isNaN(edgeIndex)) {
        console.error('getHexEdgeCoordinates received NaN input:', { centerX, centerY, hexRadius, edgeIndex });
        return { x1: 0, y1: 0, x2: 0, y2: 0 }; // Return safe defaults
    }
    
    // Calculate the two corners of the edge
    const corner1 = edgeIndex;
    const corner2 = (edgeIndex + 1) % 6;
    const angle1 = (Math.PI / 3) * corner1;
    const angle2 = (Math.PI / 3) * corner2;
    
    const x1 = centerX + hexRadius * Math.cos(angle1);
    const y1 = centerY + hexRadius * Math.sin(angle1);
    const x2 = centerX + hexRadius * Math.cos(angle2);
    const y2 = centerY + hexRadius * Math.sin(angle2);
    
    // Final validation
    if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
        console.error('getHexEdgeCoordinates produced NaN output:', { x1, y1, x2, y2 });
        return { x1: 0, y1: 0, x2: 0, y2: 0 };
    }
    
    return { x1, y1, x2, y2 };
}

// Generate hex backgrounds only (extracted from generateHexGrid)
function generateHexBackgroundsOnly(cols, rows, hexWidth, hexHeight, hexRadius) {
    let backgroundElements = '<g id="hex-backgrounds" pointer-events="none">';
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * hexWidth * 0.75;
            const y = row * hexHeight + (col % 2) * hexHeight * 0.5;
            
            const hexPath = createHexPath(x + hexRadius, y + hexHeight/2, hexRadius);
            
            const centerX = x + hexRadius;
            const centerY = y + hexHeight/2;
            const {x: hx, y: hy, z: hz} = offsetToCube(col, row);
            const hexId = cubeId(hx, hy, hz);
            
            // Check cell state and apply appropriate graphics (but NOT borders - those are handled separately)
            // Priority order: CLAIMED > VISITED > SCANNED
            if (gameState.galaxy.hexGrid.claimedHexes.has(hexId)) {
                // CLAIMED: No individual border (handled by region border system)
                // Just placeholder for future claimed-specific graphics if needed
            } else if (gameState.galaxy.hexGrid.visitedHexes.has(hexId)) {
                // VISITED: No individual border (handled by region border system)
                // Just placeholder for future visited-specific graphics if needed
            } else if (gameState.galaxy.hexGrid.scannedHexes.has(hexId)) {
                // SCANNED: Old CRT screen scan lines (only shown if not visited)
                let scanLines = '';
                for (let i = 0; i < 12; i++) {
                    const offset = i * 6 - 30;
                    const opacity = 0.15 + (Math.sin(i * 0.5) * 0.08); // Increased base opacity
                    scanLines += `<line x1="${centerX - hexRadius + offset}" y1="${centerY - hexRadius*0.6}" 
                                       x2="${centerX + hexRadius + offset}" y2="${centerY + hexRadius*0.6}" 
                                       stroke="#00FF41" stroke-width="2" opacity="${opacity}"/>`;
                }
                // Add more visible horizontal interference lines
                for (let i = 0; i < 3; i++) {
                    const yOffset = (i - 1) * 20;
                    scanLines += `<line x1="${centerX - hexRadius*0.8}" y1="${centerY + yOffset}" 
                                       x2="${centerX + hexRadius*0.8}" y2="${centerY + yOffset}" 
                                       stroke="#00FF41" stroke-width="0.8" opacity="0.1"/>`;
                }
                backgroundElements += `<g class="hex-scanned-background">
                                        <clipPath id="hex-clip-${col}-${row}">
                                            <path d="${hexPath}"/>
                                        </clipPath>
                                        <g clip-path="url(#hex-clip-${col}-${row})">${scanLines}</g>
                                     </g>`;
            }
        }
    }
    backgroundElements += '</g>';
    return backgroundElements;
}

// Generate region borders only (extracted from generateHexGrid)
function generateRegionBordersOnly(hexWidth, hexHeight) {
    let regionBorders = '<g id="region-borders" pointer-events="none">';
    
    // Generate borders for visited hexes
    if (gameState.galaxy.hexGrid.visitedHexes && gameState.galaxy.hexGrid.visitedHexes.size > 0) {
        for (const hexId of gameState.galaxy.hexGrid.visitedHexes) {
            const {x: hx, y: hy, z: hz} = parseCubeId(hexId);
            const exposedEdges = getExposedEdgesCube(hx, hy, hz, gameState.galaxy.hexGrid.visitedHexes);
            const center = cubeToPixel(hx, hy, hz, hexWidth, hexHeight);
            const centerX = center.x;
            const centerY = center.y;
            const hexRadius = hexWidth / 2;
            
            exposedEdges.forEach(edgeIndex => {
                const {x1, y1, x2, y2} = getHexEdgeCoordinates(centerX, centerY, hexRadius, edgeIndex);
                regionBorders += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
                                     stroke="#4A90E2" stroke-width="6" stroke-linecap="round" opacity="0.9"/>`;
            });
        }
    }
    
    // Generate borders for claimed hexes
    if (gameState.galaxy.hexGrid.claimedHexes && gameState.galaxy.hexGrid.claimedHexes.size > 0) {
        for (const hexId of gameState.galaxy.hexGrid.claimedHexes) {
            const {x: hx, y: hy, z: hz} = parseCubeId(hexId);
            const exposedEdges = getExposedEdgesCube(hx, hy, hz, gameState.galaxy.hexGrid.claimedHexes);
            const center = cubeToPixel(hx, hy, hz, hexWidth, hexHeight);
            const centerX = center.x;
            const centerY = center.y;
            const hexRadius = hexWidth / 2;
            
            exposedEdges.forEach(edgeIndex => {
                const {x1, y1, x2, y2} = getHexEdgeCoordinates(centerX, centerY, hexRadius, edgeIndex);
                regionBorders += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
                                     stroke="#FF6B35" stroke-width="6" stroke-linecap="round" opacity="0.9"
                                     filter="url(#glow-filter)"/>`;
            });
        }
    }
    
    // Generate borders for scanned hexes (thin dashed)
    if (gameState.galaxy.hexGrid.scannedHexes && gameState.galaxy.hexGrid.scannedHexes.size > 0) {
        for (const hexId of gameState.galaxy.hexGrid.scannedHexes) {
            const {x: hx, y: hy, z: hz} = parseCubeId(hexId);
            const exposedEdges = getExposedEdgesCube(hx, hy, hz, gameState.galaxy.hexGrid.scannedHexes);
            const center = cubeToPixel(hx, hy, hz, hexWidth, hexHeight);
            const centerX = center.x;
            const centerY = center.y;
            const hexRadius = hexWidth / 2;
            
            exposedEdges.forEach(edgeIndex => {
                const {x1, y1, x2, y2} = getHexEdgeCoordinates(centerX, centerY, hexRadius, edgeIndex);
                regionBorders += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
                                     stroke="#00FF41" stroke-width="2" stroke-dasharray="8,12" 
                                     stroke-linecap="round" opacity="0.6"/>`;
            });
        }
    }
    
    regionBorders += '</g>';
    return regionBorders;
}

// Update only hex states (backgrounds and borders) without regenerating stars or systems
function updateHexStatesOnly() {
    const svg = document.querySelector('#ascii-display svg');
    if (!svg) return;
    
    const hexWidth = 130;
    const hexHeight = hexWidth * (Math.sqrt(3) / 2);
    const hexRadius = hexWidth / 2;
    
    // Remove existing hex backgrounds and borders
    const existingBackgrounds = svg.querySelector('#hex-backgrounds');
    const existingBorders = svg.querySelector('#region-borders');
    
    if (existingBackgrounds) existingBackgrounds.remove();
    if (existingBorders) existingBorders.remove();
    
    // Regenerate hex backgrounds (scan lines, etc)
    const backgroundElements = generateHexBackgroundsOnly(60, 60, hexWidth, hexHeight, hexRadius);
    
    // Regenerate region borders (visited, claimed, scanned borders)
    const regionBorders = generateRegionBordersOnly(hexWidth, hexHeight);
    
    // Insert the new elements at the right position (after star field, before systems)
    const starField = svg.querySelector('#star-field');
    if (starField && starField.nextSibling) {
        starField.insertAdjacentHTML('afterend', backgroundElements + regionBorders);
    } else {
        // Fallback: append to end
        svg.insertAdjacentHTML('beforeend', backgroundElements + regionBorders);
    }
}

// Update only the player ship without regenerating the entire map
function updatePlayerShipOnly() {
    const hexWidth = 130;
    const hexHeight = hexWidth * (Math.sqrt(3) / 2);
    
    // Remove existing player ship
    const existingShip = document.getElementById('player-ship');
    if (existingShip) {
        existingShip.remove();
    }
    
    // Stop any existing orbital animation
    stopOrbitalAnimation();
    
    // Generate new player ship
    const newPlayerShip = generatePlayerShip(hexWidth, hexHeight);
    
    // Insert the new ship into the SVG
    const svgElement = document.querySelector('#ascii-display svg');
    if (svgElement) {
        svgElement.insertAdjacentHTML('beforeend', newPlayerShip);
        
        // Start orbital animation if in a system (with transition)
        setTimeout(() => {
            const {x, y, z} = gameState.player.hexLocation;
            const knownSystem = Object.values(gameState.galaxy.knownSystems)
                .find(system => system.x === x && system.y === y && system.z === z);
            const genSystemId = `sys_${x}_${y}_${z}`;
            const generatedSystem = gameState.galaxy.generatedSystems.get(genSystemId);
            const systemData = knownSystem || generatedSystem;
            if (systemData && (systemData.type || '').toLowerCase() !== 'empty') {
                const center = cubeToPixel(x, y, z, hexWidth, hexHeight);
                startOrbitWithTransition(center.x, center.y, 35);
            }
        }, 100);
        // Refresh NPC encounter overlay relative to player
        try { updateNpcEncounterLayer(); } catch (e) { /* ignore */ }
    }
}

// Developer menu functions
function toggleDevMenu() {
    console.log('[DEBUG] toggleDevMenu called');
    const menu = document.getElementById('dev-menu');
    console.log('[DEBUG] Menu element found:', menu);
    
    if (menu) {
        console.log('[DEBUG] Current classList before toggle:', menu.classList.toString());
        console.log('[DEBUG] Is hidden before toggle:', menu.classList.contains('hidden'));
        
        menu.classList.toggle('hidden');
        
        console.log('[DEBUG] Current classList after toggle:', menu.classList.toString());
        console.log('[DEBUG] Is hidden after toggle:', menu.classList.contains('hidden'));
        console.log('[DEBUG] Menu computed display style:', window.getComputedStyle(menu).display);
    } else {
        console.error('[DEBUG] dev-menu element not found!');
    }
}

function showShipSelector() {
    const modal = document.getElementById('ship-selector');
    if (modal) {
        modal.classList.remove('hidden');
    }
    // Close dev menu
    const devMenu = document.getElementById('dev-menu');
    if (devMenu) {
        devMenu.classList.add('hidden');
    }
}

function closeShipSelector() {
    const modal = document.getElementById('ship-selector');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function selectShip(shipType) {
    gameState.player.shipType = shipType;
    // Update the ship immediately
    updatePlayerShipOnly();
    closeShipSelector();
    autoSave();
}

function addTestAP() {
    gameState.player.actionPoints = Math.min(gameState.player.actionPoints + 10, 99);
    updateStatusPanel();
    toggleDevMenu();
}

function toggleDevScanUnlock() {
    gameState.ui.devScanUnlocked = !gameState.ui.devScanUnlocked;
    alert(`Dev Scan Unlock: ${gameState.ui.devScanUnlocked ? 'ON' : 'OFF'}`);
    toggleDevMenu();
}

// Performance Profiler & FPS HUD
const perfMon = {
    running: false,
    rafId: null,
    lastTime: 0,
    fpsSamples: [],
    longTasks: [],
    measures: new Map(), // label -> {count, total, max}
    wrapped: new Map(),
    observer: null
};
// Scanner capability gating (prep for future scanner implementation)
const SCAN_UNLOCKS = {
    scout1: ['quick'],
    scout2: ['quick', 'sweep'],
    scout3: ['quick', 'sweep', 'focus'],
    scout4: ['quick', 'sweep', 'focus', 'cone']
};

function hasScanCapability(action) {
    if (gameState.ui && gameState.ui.devScanUnlocked) return true;
    const ship = gameState.player.shipType || 'scout1';
    const caps = SCAN_UNLOCKS[ship] || SCAN_UNLOCKS['scout1'];
    return caps.includes(action);
}

// Scanner parameters by ship class
const SCAN_PARAMS = {
    scout1: { sigmaNoise: 0.18, mislead: 0.15, sweepRadius: 2 },
    scout2: { sigmaNoise: 0.12, mislead: 0.10, sweepRadius: 2 },
    scout3: { sigmaNoise: 0.08, mislead: 0.07, sweepRadius: 2 },
    scout4: { sigmaNoise: 0.05, mislead: 0.05, sweepRadius: 3 },
};

// Hidden signal field configuration
const SIGNAL_CONFIG = {
    sigmaSite: 2.5, // falloff in hexes
    radius: 9,      // max hex distance to consider contributions
    weights: {
        system: 1.0,
        resource: 0.6,
    }
};

// Cache for signal values
if (!gameState.galaxy.signalField) {
    gameState.galaxy.signalField = new Map(); // hexId -> number in [0,1]
}

function randNormal() {
    // Box-Muller
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function gaussian(d, sigma) {
    const s2 = sigma * sigma;
    return Math.exp(-(d * d) / (2 * s2));
}

function getSignalSources() {
    const sources = [];
    // Known systems (exclude explicit 'empty' types)
    for (const sys of Object.values(gameState.galaxy.knownSystems)) {
        if (!sys) continue;
        if (sys.type && sys.type.toLowerCase() === 'empty') continue;
        sources.push({ x: sys.x, y: sys.y, z: sys.z, type: 'system' });
    }
    // Generated systems (if any are stored as {x,y,z})
    if (gameState.galaxy.generatedSystems) {
        for (const [, sys] of gameState.galaxy.generatedSystems) {
            if (!sys) continue;
            if (Number.isFinite(sys.x) && Number.isFinite(sys.y) && Number.isFinite(sys.z)) {
                sources.push({ x: sys.x, y: sys.y, z: sys.z, type: 'system' });
            }
        }
    }
    // Resource sites
    for (const hexId of gameState.galaxy.resources.hexResources.keys()) {
        const { x, y, z } = parseCubeId(hexId);
        if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) {
            sources.push({ x, y, z, type: 'resource' });
        }
    }
    return sources;
}

function computeSignalAtHex(x, y, z) {
    const sources = getSignalSources();
    let sum = 0;
    let maxPossible = 0; // approximate normalization factor in radius
    for (const s of sources) {
        const d = cubeDistance(x, y, z, s.x, s.y, s.z);
        if (d > SIGNAL_CONFIG.radius) continue;
        const w = SIGNAL_CONFIG.weights[s.type] || 0;
        sum += w * gaussian(d, SIGNAL_CONFIG.sigmaSite);
        maxPossible += w; // rough upper bound around radius center
    }
    // Normalize softly to keep within [0,1]
    const norm = maxPossible > 0 ? sum / Math.max(1, maxPossible * 0.6) : 0;
    return Math.max(0, Math.min(1, norm));
}

function getSignal(hexId) {
    // Cached lookup
    const cached = gameState.galaxy.signalField.get(hexId);
    if (typeof cached === 'number') return cached;
    const { x, y, z } = parseCubeId(hexId);
    const val = computeSignalAtHex(x, y, z);
    gameState.galaxy.signalField.set(hexId, val);
    return val;
}

function hexDirToCompass(index) {
    // Map cube directions (0..5) to compass-like labels
    // 0:E, 1:SE, 2:SW, 3:W, 4:NW, 5:NE
    const map = ['E', 'SE', 'SW', 'W', 'NW', 'NE'];
    return map[(index % 6 + 6) % 6];
}

// Produce a scan reading from the signal field (with tier-based noise)
function getScanReading(hexId, mode = 'quick') {
    const ship = gameState.player.shipType || 'scout1';
    const params = SCAN_PARAMS[ship] || SCAN_PARAMS['scout1'];
    // Mode-based refinement multipliers
    let sigma = params.sigmaNoise;
    let mislead = params.mislead;
    if (mode === 'focus') {
        sigma *= 0.5;
        mislead *= 0.7;
    } else if (mode === 'sweep') {
        sigma *= 0.9;
        mislead *= 0.9;
    }
    const base = getSignal(hexId);
    // Noise
    const noise = randNormal() * sigma;
    const p = Math.max(0.05, Math.min(0.95, base + noise));
    // Direction hint from neighbors
    const { x, y, z } = parseCubeId(hexId);
    let bestIdx = 0;
    let bestVal = -Infinity;
    const neighborVals = [];
    for (let i = 0; i < 6; i++) {
        const dir = CUBE_DIRS[i];
        const nx = x + dir.x, ny = y + dir.y, nz = z + dir.z;
        const nId = cubeId(nx, ny, nz);
        const f = getSignal(nId);
        neighborVals.push({ i, f });
        if (f > bestVal) { bestVal = f; bestIdx = i; }
    }
    // Mislead chance: pick second-best sometimes
    if (Math.random() < mislead && neighborVals.length > 1) {
        neighborVals.sort((a,b) => b.f - a.f);
        const second = neighborVals[1] || neighborVals[0];
        bestIdx = second.i;
        bestVal = second.f;
    }
    const gradient = Math.max(0, bestVal - base);
    const conf = gradient > 0.2 ? 'strong' : gradient > 0.1 ? 'med' : 'weak';
    const dir = hexDirToCompass(bestIdx);
    return { p, conf, dir };
}

// Focused Scan: refine reading for the selected hex (2 AP)
function focusedScan() {
    if (gameState.animation.isShipMoving) return;
    if (!hasScanCapability('focus')) {
        alert('Focused Scan unavailable. Upgrade your ship or enable dev unlock.');
        return;
    }
    const targetHexId = gameState.ui.selectedHex;
    if (!targetHexId) {
        alert('Select a hex to focus scan.');
        return;
    }
    // AP check (2 AP)
    const apCost = 2;
    if (gameState.player.actionPoints < apCost) {
        showGameDialog('Insufficient AP', 'Focused Scan requires 2 AP. Your AP are depleted.');
        return;
    }
    const isVisited = gameState.galaxy.hexGrid.visitedHexes.has(targetHexId);
    const isClaimed = gameState.galaxy.hexGrid.claimedHexes.has(targetHexId);
    // Perform refined reading
    try {
        const reading = getScanReading(targetHexId, 'focus');
        const existing = gameState.galaxy.hexGrid.hexData.get(targetHexId) || {};
        gameState.galaxy.hexGrid.hexData.set(targetHexId, {
            ...existing,
            scan: { ...reading, ts: Date.now(), refined: true }
        });
    } catch (e) {
        console.warn('[FOCUS] getScanReading failed:', e);
    }
    // Ensure tile is at least scanned if not already visited/claimed
    if (!isVisited && !isClaimed) {
        setHexState(targetHexId, 'scanned');
    }
    // Deduct AP and refresh
    gameState.player.actionPoints = Math.max(0, gameState.player.actionPoints - apCost);
    updateHexStatesPreservingBackground();
    showHexStatusBox(targetHexId);
    updateStatusPanel();
    autoSave();
}

function _perfRecord(label, dt) {
    let m = perfMon.measures.get(label);
    if (!m) { m = { count: 0, total: 0, max: 0 }; perfMon.measures.set(label, m); }
    m.count += 1; m.total += dt; if (dt > m.max) m.max = dt;
}

function _wrapFunction(name) {
    const fn = window[name];
    if (typeof fn !== 'function' || perfMon.wrapped.has(name)) return;
    const wrapped = function(...args) {
        const t0 = performance.now();
        try { return fn.apply(this, args); }
        finally { _perfRecord(name, performance.now() - t0); }
    };
    perfMon.wrapped.set(name, fn);
    window[name] = wrapped;
}

function _unwrapAll() {
    for (const [name, orig] of perfMon.wrapped) {
        window[name] = orig;
    }
    perfMon.wrapped.clear();
}

function _fpsLoop(ts) {
    if (!perfMon.running) return;
    if (perfMon.lastTime) {
        const dt = ts - perfMon.lastTime;
        const fps = dt > 0 ? 1000 / dt : 0;
        perfMon.fpsSamples.push(fps);
        if (perfMon.fpsSamples.length > 120) perfMon.fpsSamples.shift();
        const hud = document.getElementById('fps-hud');
        if (hud) {
            const avg = (perfMon.fpsSamples.reduce((a,b)=>a+b,0) / perfMon.fpsSamples.length) || 0;
            const low = perfMon.fpsSamples.reduce((a,b)=>Math.min(a,b), 999) || 0;
            hud.textContent = `FPS: ${avg.toFixed(1)} (min ${low.toFixed(1)})  LongTasks: ${perfMon.longTasks.length}`;
        }
    }
    perfMon.lastTime = ts;
    perfMon.rafId = requestAnimationFrame(_fpsLoop);
}

function startPerformanceProfiler() {
    if (perfMon.running) return;
    perfMon.running = true;
    perfMon.fpsSamples = [];
    perfMon.longTasks = [];
    perfMon.measures.clear();
    // Wrap known heavy functions (non-destructive)
    ['updateScreen','generateHexGalaxyMap','generateHexGrid','generateDiscoveredSystems','renderWormholes','updateHexStatesPreservingBackground','updateHexStatesOnly','updatePlayerShipOnly','animateWarpDrive','animateShipWarp','showHexStatusBox','generatePlayerShip','createSystemGraphics'].forEach(_wrapFunction);
    // Long Tasks observer
    if ('PerformanceObserver' in window) {
        try {
            perfMon.observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    perfMon.longTasks.push({ start: entry.startTime, duration: entry.duration });
                }
            });
            perfMon.observer.observe({ entryTypes: ['longtask'] });
        } catch (e) { /* ignore */ }
    }
    // HUD
    let hud = document.getElementById('fps-hud');
    if (!hud) {
        hud = document.createElement('div');
        hud.id = 'fps-hud';
        hud.style.position = 'fixed';
        hud.style.top = '8px';
        hud.style.right = '8px';
        hud.style.zIndex = '3000';
        hud.style.background = 'rgba(0,0,0,0.8)';
        hud.style.border = '2px solid #00FF41';
        hud.style.borderRadius = '6px';
        hud.style.padding = '6px 8px';
        hud.style.color = '#00FF41';
        hud.style.fontSize = '12px';
        document.body.appendChild(hud);
    }
    perfMon.lastTime = 0;
    perfMon.rafId = requestAnimationFrame(_fpsLoop);
    toggleDevMenu();
}

function stopPerformanceProfiler() {
    if (!perfMon.running) return;
    perfMon.running = false;
    if (perfMon.rafId) cancelAnimationFrame(perfMon.rafId);
    perfMon.rafId = null;
    if (perfMon.observer) { try { perfMon.observer.disconnect(); } catch(e){} }
    perfMon.observer = null;
    _unwrapAll();
}

function showPerformanceReport() {
    const rows = [];
    for (const [label, m] of perfMon.measures.entries()) {
        rows.push({ label, calls: m.count, totalMs: +m.total.toFixed(1), avgMs: +(m.total/m.count).toFixed(2), maxMs: +m.max.toFixed(1) });
    }
    rows.sort((a,b)=>b.totalMs - a.totalMs);
    console.table(rows);
    console.log('Long tasks (ms):', perfMon.longTasks.map(t=>+t.duration.toFixed(1)));
    alert('Performance report printed to console. Open DevTools -> Console.');
}

// Replace placeholder FPS toggle with a real one
function toggleFPS() {
    if (perfMon.running) {
        stopPerformanceProfiler();
        const hud = document.getElementById('fps-hud');
        if (hud) hud.remove();
    } else {
        startPerformanceProfiler();
    }
}

// Center the view on the player's ship
function centerOnShip() {
    // Get player position
    const {x, y, z} = gameState.player.hexLocation;
    const {col, row} = cubeToOffset(x, y, z);
    
    // Calculate hex center position in pixels
    const hexWidth = 52;
    const hexHeight = 45;
    const centerX = col * hexWidth * 0.75;
    const centerY = row * hexHeight;
    
    // Get the display element and scroll to center the ship
    const display = document.getElementById('ascii-display');
    if (display) {
        // Get viewport dimensions
        const viewportWidth = display.clientWidth;
        const viewportHeight = display.clientHeight;
        
        // Calculate scroll position to center the ship
        const scrollX = centerX - (viewportWidth / 2);
        const scrollY = centerY - (viewportHeight / 2);
        
        // Smooth scroll to ship position
        display.scrollTo({
            left: Math.max(0, scrollX),
            top: Math.max(0, scrollY),
            behavior: 'smooth'
        });
        
        // Flash the ship for visibility
        flashPlayerShip();
    }
    
    // Log ship position for debugging
    console.log(`Ship located at cube(${x}, ${y}, ${z}) = offset(${col}, ${row})`);
    
    // Check what's at the ship location
    const hexId = cubeId(x, y, z);
    const systemId = `sys_${x}_${y}_${z}`;
    const generatedSystem = gameState.galaxy.generatedSystems.get(systemId);
    const knownSystem = Object.values(gameState.galaxy.knownSystems).find(sys => 
        sys.x === x && sys.y === y && sys.z === z
    );
    const resources = gameState.galaxy.resources.hexResources.get(hexId);
    
    if (generatedSystem) {
        console.log(`📍 Ship is at generated system: ${generatedSystem.name}`);
    } else if (knownSystem) {
        console.log(`📍 Ship is at known system: ${knownSystem.name}`);
    } else if (resources) {
        console.log(`📍 Ship is at resource site: ${resources.specialSite?.type || 'Unknown'}`);
    } else {
        console.log(`📍 Ship is in empty space`);
    }
}

// Flash the player ship for visibility
function flashPlayerShip() {
    const shipElement = document.querySelector('#player-ship');
    if (shipElement) {
        // Add a temporary bright flash effect
        const flashEffect = `<circle cx="0" cy="0" r="50" fill="#FFFF00" opacity="0.8">
            <animate attributeName="r" values="20;100;20" dur="1s" />
            <animate attributeName="opacity" values="0.8;0;0.8" dur="1s" />
        </circle>`;
        
        // Find the ship symbol group and add flash
        const shipSymbol = shipElement.querySelector('.player-ship-symbol');
        if (shipSymbol) {
            shipSymbol.insertAdjacentHTML('afterbegin', flashEffect);
            
            // Remove flash after animation
            setTimeout(() => {
                const flash = shipSymbol.querySelector('circle[r="50"]');
                if (flash) flash.remove();
            }, 1000);
        }
    }
}

function teleportToSystem() {
    // Prompt for hex coordinates
    const input = prompt('Enter hex coordinates (format: x,y,z)\n\nExamples:\n• 30,-40,10 (Sol System)\n• 0,0,0 (Center of map)\n• -30,30,0 (Another location)\n\nNote: x + y + z must equal 0', '0,0,0');
    
    if (input === null) {
        toggleDevMenu();
        return; // User cancelled
    }
    
    // Parse coordinates
    const coords = input.split(',').map(s => parseInt(s.trim()));
    
    if (coords.length !== 3 || coords.some(isNaN)) {
        alert('Invalid format! Please use: x,y,z (e.g., 0,0,0)');
        toggleDevMenu();
        return;
    }
    
    const [x, y, z] = coords;
    
    // Validate cube coordinates (must sum to 0)
    if (x + y + z !== 0) {
        alert(`Invalid cube coordinates!\nx + y + z must equal 0.\nYour input: ${x} + ${y} + ${z} = ${x + y + z}`);
        toggleDevMenu();
        return;
    }
    
    // Convert to offset coordinates to check bounds
    const offset = cubeToOffset(x, y, z);
    const cols = gameState.galaxy.hexGrid.cols;
    const rows = gameState.galaxy.hexGrid.rows;
    
    if (offset.col < 0 || offset.col >= cols || offset.row < 0 || offset.row >= rows) {
        alert(`Coordinates out of bounds!\nMap size: ${cols}x${rows}\nYour coordinates would be at offset (${offset.col}, ${offset.row})`);
        toggleDevMenu();
        return;
    }
    
    // Teleport to coordinates (single canonical position)
    gameState.player.hexLocation = { x, y, z };
    
    // Mark teleported location as visited
    const teleportHexId = cubeId(x, y, z);
    gameState.galaxy.hexGrid.visitedHexes.add(teleportHexId);
    
    console.log(`Teleported to cube coordinates (${x}, ${y}, ${z}) = offset (${offset.col}, ${offset.row})`);
    
    // Check if there's a system or resource at this location
    const systemId = `sys_${x}_${y}_${z}`;
    const generatedSystem = gameState.galaxy.generatedSystems.get(systemId);
    const knownSystem = Object.values(gameState.galaxy.knownSystems).find(sys => 
        sys.x === x && sys.y === y && sys.z === z
    );
    const resources = gameState.galaxy.resources.hexResources.get(teleportHexId);
    
    if (generatedSystem) {
        console.log(`🌟 Arrived at generated system: ${generatedSystem.name} (${generatedSystem.type})`);
    } else if (knownSystem) {
        console.log(`🌟 Arrived at known system: ${knownSystem.name} (${knownSystem.type})`);
    } else if (resources) {
        console.log(`⚡ Arrived at resource site: ${resources.specialSite?.type || 'Unknown'}`);
    } else {
    console.log(`📍 Arrived at empty space coordinates (${x}, ${y}, ${z})`);
    }
    
    // First-time discovery dialog for teleport (dev)
    handleFirstDiscoveries(teleportHexId, resources);
    try { _recomputeNpcPositions(); } catch (e) { /* ignore */ }
    updateScreen('map');
    updateStatusPanel();
    toggleDevMenu();
    autoSave();
}

function clearCellStates() {
    gameState.galaxy.hexGrid.scannedHexes.clear();
    gameState.galaxy.hexGrid.visitedHexes.clear();
    gameState.galaxy.hexGrid.claimedHexes.clear();
    if (!silent) {
        updateScreen('map');
        toggleDevMenu();
    }
}

// Set all tiles to a specific state
function setAllTilesState(state) {
    const cols = gameState.galaxy.hexGrid.cols;
    const rows = gameState.galaxy.hexGrid.rows;
    
    // Clear all states first
    gameState.galaxy.hexGrid.scannedHexes.clear();
    gameState.galaxy.hexGrid.visitedHexes.clear();
    gameState.galaxy.hexGrid.claimedHexes.clear();
    
    // Add all hexes to the appropriate state
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const {x, y, z} = offsetToCube(col, row);
            const hexId = cubeId(x, y, z);
            
            // Use centralized state management
            setHexState(hexId, state);
            
            // Generate resources for visited hexes (systems already exist)
            if (state === 'visited') {
                generateResourcesForHex(hexId);
            }
        }
    }
    
    updateScreen('map');
    toggleDevMenu();
    
    console.log(`Set all ${cols * rows} tiles to ${state} state`);
    
    // Debug info for systems when setting all tiles to visited
    if (state === 'visited') {
        const knownSystemCount = Object.keys(gameState.galaxy.knownSystems).length;
        const generatedSystemCount = gameState.galaxy.generatedSystems.size;
        const totalSystems = knownSystemCount + generatedSystemCount;
        
        console.log(`Revealing ${totalSystems} total systems (${knownSystemCount} known + ${generatedSystemCount} procedural)`);
        
        // Show first 3 procedural systems for debugging
        let count = 0;
        for (const [systemId, system] of gameState.galaxy.generatedSystems) {
            if (count < 3) {
                console.log(`Procedural ${count + 1}: ${system.name} (${system.type}) at ${system.x},${system.y},${system.z}`);
                count++;
            } else {
                break;
            }
        }
    }
}

// Convenient wrapper functions
function setAllTilesScanned() {
    setAllTilesState('scanned');
}

function setAllTilesVisited() {
    setAllTilesState('visited');
}

function setAllTilesClaimed() {
    setAllTilesState('claimed');
}

// Hex State Management - Ensures only one state per hex
function setHexState(hexId, newState) {
    // Validate hex ID
    if (!hexId || hexId.includes('undefined') || hexId.includes('NaN')) {
        console.error(`Attempted to set state for invalid hex ID: ${hexId}`);
        return;
    }
    
    // Validate the hex ID is properly formatted
    const {x, y, z} = parseCubeId(hexId);
    if (isNaN(x) || isNaN(y) || isNaN(z)) {
        console.error(`Invalid hex coordinates in ID: ${hexId}`);
        return;
    }
    
    // Remove from all states first to prevent overlapping
    gameState.galaxy.hexGrid.scannedHexes.delete(hexId);
    gameState.galaxy.hexGrid.visitedHexes.delete(hexId);
    gameState.galaxy.hexGrid.claimedHexes.delete(hexId);
    
    // Add to the new state
    switch (newState) {
        case 'scanned':
            gameState.galaxy.hexGrid.scannedHexes.add(hexId);
            console.log('[STATE] scanned added:', hexId);
            break;
        case 'visited':
            gameState.galaxy.hexGrid.visitedHexes.add(hexId);
            console.log('[STATE] visited added:', hexId);
            break;
        case 'claimed':
            gameState.galaxy.hexGrid.claimedHexes.add(hexId);
            console.log('[STATE] claimed added:', hexId);
            break;
        case 'clear':
            // Already cleared above, don't add to any state
            break;
        default:
            console.warn(`Unknown hex state: ${newState}`);
    }
}

function getHexState(hexId) {
    if (gameState.galaxy.hexGrid.claimedHexes.has(hexId)) return 'claimed';
    if (gameState.galaxy.hexGrid.visitedHexes.has(hexId)) return 'visited';
    if (gameState.galaxy.hexGrid.scannedHexes.has(hexId)) return 'scanned';
    return 'unscanned';
}

// Tile State Mode Functions
function toggleTileStateMode() {
    gameState.ui.tileStateMode = !gameState.ui.tileStateMode;
    const modeUI = document.getElementById('tile-state-mode');
    if (modeUI) {
        modeUI.classList.toggle('hidden');
    }
    toggleDevMenu();
}

function exitTileStateMode() {
    gameState.ui.tileStateMode = false;
    const modeUI = document.getElementById('tile-state-mode');
    if (modeUI) {
        modeUI.classList.add('hidden');
    }
}

function selectTileState(state) {
    gameState.ui.tileStateToApply = state;
    // Update UI buttons
    document.querySelectorAll('.tile-state-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.state === state) {
            btn.classList.add('active');
        }
    });
}

function applyTileState(col, row) {
    const {x, y, z} = offsetToCube(col, row);
    const hexId = cubeId(x, y, z);
    const state = gameState.ui.tileStateToApply;
    
    // Use the centralized state management
    setHexState(hexId, state);
    
    // Update display
    updateScreen('map');
    // Save change
    autoSave();
}

// Persistence System
// --- Validators & Sanitizers ---
const VALID_HEX = /^-?\d+,-?\d+,-?\d+$/;
function parseHexId(id) {
    if (typeof id !== 'string' || !VALID_HEX.test(id)) return null;
    const [q, r, s] = id.split(',').map(Number);
    if (!Number.isFinite(q) || !Number.isFinite(r) || !Number.isFinite(s)) return null;
    if (q + r + s !== 0) return null;
    return { x: q, y: r, z: s };
}

// Wormhole termination icon
function createWormholeIcon(x, y) {
    const size = 48; // px (doubled)
    const half = size / 2;
    // Add a cache buster so updated art shows immediately
    const href = 'assets/wormhole.png?v=20250907c';
    return `<g class="wormhole-node">
              <image href="${href}" x="${x - half}" y="${y - half}" width="${size}" height="${size}" opacity="0.95" onerror="this.style.display='none'" />
            </g>`;
}

// Render wormhole terminations and optionally the path when revealed
function renderWormholes(hexWidth, hexHeight) {
    if (!gameState.galaxy.wormholes) return '';
    let g = '<g id="wormholes">';
    const visited = gameState.galaxy.hexGrid.visitedHexes;
    const scanned = gameState.galaxy.hexGrid.scannedHexes;
    const revealed = gameState.ui.revealedWormhole;
    const showAll = !!gameState.ui.showAllWormholes;
    const playerHexId = cubeId(gameState.player.hexLocation.x, gameState.player.hexLocation.y, gameState.player.hexLocation.z);
    
    for (const lane of gameState.galaxy.wormholes.lanes) {
        const [a, b] = [lane.a, lane.b];
        const {x: ax, y: ay, z: az} = parseCubeId(a);
        const {x: bx, y: by, z: bz} = parseCubeId(b);
        const aPos = cubeToPixel(ax, ay, az, hexWidth, hexHeight);
        const bPos = cubeToPixel(bx, by, bz, hexWidth, hexHeight);

        // Draw nodes if visited or scanned; or always in debug
        const aSeen = showAll || visited.has(a) || scanned.has(a);
        const bSeen = showAll || visited.has(b) || scanned.has(b);
        if (aSeen) g += createWormholeIcon(aPos.x, aPos.y);
        if (bSeen) g += createWormholeIcon(bPos.x, bPos.y);

        // Show path if this lane is revealed or player is on a termination
        const showPath = showAll || (revealed === a || revealed === b || playerHexId === a || playerHexId === b);
        if (showPath && (showAll || visited.has(a) || visited.has(b) || scanned.has(a) || scanned.has(b))) {
            const path = createCurvedRoute(aPos.x, aPos.y, bPos.x, bPos.y)
                .replace('stroke="#00FF41"', 'stroke="#66CCFF"')
                .replace('stroke-width="2"', 'stroke-width="2"')
                .replace('stroke-opacity="0.6"', 'stroke-opacity="0.8"');
            g += path;
        }
    }

    g += '</g>';
    return g;
}
function isFiniteNum(n) { return Number.isFinite(n); }
function allFinite(...vals) { return vals.every(isFiniteNum); }
function sanitizeVisitedHexIds(arr) {
    const out = [];
    for (const id of arr || []) {
        if (parseHexId(id)) out.push(id);
        else console.warn(`Removing invalid visited hex ID during load: ${id}`);
    }
    return out;
}
function migrateSaveData(saveData) {
    let changed = false;
    const migrated = JSON.parse(JSON.stringify(saveData));

    // Versioning
    const targetVersion = '1.1.0';
    if (migrated.version !== targetVersion) {
        migrated.version = targetVersion;
        changed = true;
    }

    // Player position canonicalization
    if (!migrated.player) migrated.player = {};
    const p = migrated.player;
    // Backfill from old ship.position if needed
    const pos = p.hexLocation || (p.ship && p.ship.position);
    if (!pos || !allFinite(pos.x, pos.y, pos.z) || (pos.x + pos.y + pos.z) !== 0) {
        // Default to Sol
        p.hexLocation = { x: 30, y: -40, z: 10 };
        changed = true;
    } else {
        p.hexLocation = { x: pos.x, y: pos.y, z: pos.z };
        if (p.ship && p.ship.position) {
            delete p.ship.position; // remove deprecated field
            changed = true;
        }
    }

    // Hex grid sets
    if (migrated.galaxy && migrated.galaxy.hexGrid) {
        const hg = migrated.galaxy.hexGrid;
        if (Array.isArray(hg.visitedHexes)) {
            const before = hg.visitedHexes.length;
            hg.visitedHexes = sanitizeVisitedHexIds(hg.visitedHexes);
            if (hg.visitedHexes.length !== before) changed = true;
        }
        if (Array.isArray(hg.scannedHexes)) {
            const before = hg.scannedHexes.length;
            hg.scannedHexes = sanitizeVisitedHexIds(hg.scannedHexes);
            if (hg.scannedHexes.length !== before) changed = true;
        }
        if (Array.isArray(hg.claimedHexes)) {
            const before = hg.claimedHexes.length;
            hg.claimedHexes = sanitizeVisitedHexIds(hg.claimedHexes);
            if (hg.claimedHexes.length !== before) changed = true;
        }
    }

    // Resources map keys
    if (migrated.galaxy && migrated.galaxy.resources && Array.isArray(migrated.galaxy.resources.hexResources)) {
        const filtered = [];
        for (const [hexId, data] of migrated.galaxy.resources.hexResources) {
            if (parseHexId(hexId)) filtered.push([hexId, data]);
            else {
                console.warn(`Dropping invalid resource entry for hex ${hexId}`);
                changed = true;
            }
        }
        migrated.galaxy.resources.hexResources = filtered;
    }

    // Clear legacy warpLanes; new system uses wormholes
    if (migrated.galaxy && Array.isArray(migrated.galaxy.warpLanes)) {
        migrated.galaxy.warpLanes = [];
        changed = true;
    }
    if (!migrated.galaxy.wormholes) migrated.galaxy.wormholes = { lanes: [] };

    return { changed, data: migrated };
}
function saveGameState() {
    try {
        // Sanitize sets before saving
        const visited = sanitizeVisitedHexIds(Array.from(gameState.galaxy.hexGrid.visitedHexes));
        const scanned = sanitizeVisitedHexIds(Array.from(gameState.galaxy.hexGrid.scannedHexes));
        const claimed = sanitizeVisitedHexIds(Array.from(gameState.galaxy.hexGrid.claimedHexes));

        const saveData = {
            version: '1.1.0',
            timestamp: new Date().toISOString(),
            player: {
                ...gameState.player,
                cargo: {
                    capacity: gameState.player.cargo.capacity,
                    contents: Array.from(gameState.player.cargo.contents.entries()),
                    usedSpace: gameState.player.cargo.usedSpace
                },
                ship: {
                    extractionEquipment: Array.from(gameState.player.ship.extractionEquipment),
                    smugglingUpgrades: gameState.player.ship.smugglingUpgrades
                }
            },
            galaxy: {
                hexGrid: {
                    scannedHexes: scanned,
                    visitedHexes: visited,
                    claimedHexes: claimed,
                    hexData: Array.from(gameState.galaxy.hexGrid.hexData.entries())
                },
                discoveries: {
                    systems: Array.from(gameState.galaxy.discoveries?.systems || []),
                    resources: Array.from(gameState.galaxy.discoveries?.resources || []),
                    wormholes: Array.from(gameState.galaxy.discoveries?.wormholes || []),
                    log: Array.from(gameState.galaxy.discoveries?.log || [])
                },
                resources: {
                    hexResources: Array.from(gameState.galaxy.resources.hexResources.entries()).map(([hexId, data]) => {
                        return [hexId, {
                            ...data,
                            tradable: data.tradable ? Array.from(data.tradable.entries()) : null,
                            extractable: data.extractable ? Array.from(data.extractable.entries()) : null
                        }];
                    }),
                    lastRegeneration: gameState.galaxy.resources.lastRegeneration
                },
                generatedSystems: Array.from(gameState.galaxy.generatedSystems.entries()),
                wormholes: {
                    lanes: (gameState.galaxy.wormholes && Array.isArray(gameState.galaxy.wormholes.lanes))
                        ? gameState.galaxy.wormholes.lanes.map(l => ({ a: l.a, b: l.b })) : []
                }
            },
            npc: {
                ships: gameState.npc.ships || []
            }
        };
        
        localStorage.setItem('spaceGuildSave', JSON.stringify(saveData));
        console.log('Game saved successfully');
        return true;
    } catch (error) {
        console.error('Failed to save game:', error);
        return false;
    }
}

function loadGameState() {
    try {
        const saveDataStr = localStorage.getItem('spaceGuildSave');
        if (!saveDataStr) {
            console.log('No save data found');
            return false;
        }
        
        let saveData = JSON.parse(saveDataStr);
        const { changed, data } = migrateSaveData(saveData);
        if (changed) {
            try {
                localStorage.setItem('spaceGuildSave', JSON.stringify(data));
                console.log('Migrated and updated save data to latest version');
            } catch (e) {
                console.warn('Failed to write back migrated save data', e);
            }
        }
        saveData = data;
        console.log(`Loading save from ${saveData.timestamp}`);
        
        // Restore player data
        if (saveData.player) {
            gameState.player = {
                ...gameState.player,
                ...saveData.player,
                cargo: {
                    capacity: saveData.player.cargo.capacity,
                    contents: new Map(saveData.player.cargo.contents),
                    usedSpace: saveData.player.cargo.usedSpace
                },
                ship: {
                    extractionEquipment: new Set(saveData.player.ship.extractionEquipment),
                    smugglingUpgrades: saveData.player.ship.smugglingUpgrades
                }
            };
        }
        
        // Restore hex states
        if (saveData.galaxy?.hexGrid) {
            gameState.galaxy.hexGrid.scannedHexes = new Set(sanitizeVisitedHexIds(saveData.galaxy.hexGrid.scannedHexes));
            gameState.galaxy.hexGrid.visitedHexes = new Set(sanitizeVisitedHexIds(saveData.galaxy.hexGrid.visitedHexes));
            gameState.galaxy.hexGrid.claimedHexes = new Set(sanitizeVisitedHexIds(saveData.galaxy.hexGrid.claimedHexes));
            gameState.galaxy.hexGrid.hexData = new Map(saveData.galaxy.hexGrid.hexData);
        }

        // Restore discovery state
        if (saveData.galaxy?.discoveries) {
            const d = saveData.galaxy.discoveries;
            gameState.galaxy.discoveries = {
                systems: new Set(d.systems || []),
                resources: new Set(d.resources || []),
                wormholes: new Set(d.wormholes || []),
                log: Array.isArray(d.log) ? d.log : []
            };
        } else {
            gameState.galaxy.discoveries = gameState.galaxy.discoveries || { systems: new Set(), resources: new Set(), wormholes: new Set(), log: [] };
        }
        
        // Restore resources
        if (saveData.galaxy?.resources) {
            const hexResources = new Map();
            for (const [hexId, data] of saveData.galaxy.resources.hexResources) {
                hexResources.set(hexId, {
                    ...data,
                    tradable: data.tradable ? new Map(data.tradable) : null,
                    extractable: data.extractable ? new Map(data.extractable) : null
                });
            }
            gameState.galaxy.resources.hexResources = hexResources;
            gameState.galaxy.resources.lastRegeneration = saveData.galaxy.resources.lastRegeneration;
        }
        
        // Restore generated systems
        if (saveData.galaxy?.generatedSystems) {
            gameState.galaxy.generatedSystems = new Map(saveData.galaxy.generatedSystems);
        }
        // Restore NPC ships
        if (saveData.npc?.ships) {
            gameState.npc.ships = saveData.npc.ships;
        }
        // Restore wormholes
        if (saveData.galaxy?.wormholes?.lanes) {
            gameState.galaxy.wormholes = { lanes: saveData.galaxy.wormholes.lanes.map(l => ({ a: l.a, b: l.b })) };
        } else {
            gameState.galaxy.wormholes = gameState.galaxy.wormholes || { lanes: [] };
        }
        
        console.log('Game loaded successfully');
        return true;
    } catch (error) {
        console.error('Failed to load game:', error);
        return false;
    }
}

function autoSave() {
    // Silent autosave (no notification) for action-based saves
    saveGameState();
}

function showAutoSaveNotification() {
    const notification = document.createElement('div');
    notification.className = 'autosave-notification';
    notification.textContent = 'Game Saved';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

function clearSaveData() {
    if (confirm('Are you sure you want to delete your save data? This cannot be undone!')) {
        localStorage.removeItem('spaceGuildSave');
        alert('Save data cleared. Refreshing page...');
        location.reload();
    }
}

// Start the game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
