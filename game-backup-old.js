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

// Game State
const gameState = {
    currentScreen: 'map',
    player: {
        name: 'Captain',
        shipName: 'Starfinder',
        location: 'SOL',
        credits: 1247,
        actionPoints: 8,
        maxActionPoints: 10
    },
    galaxy: {
        nodes: {
            'SOL': { x: 30, y: 15, type: 'homeworld', name: 'Sol System', connections: ['MARS', 'NEXUS'] },
            'MARS': { x: 5, y: 5, type: 'outpost', name: 'Mars Outpost', connections: ['SOL'] },
            'NEXUS': { x: 15, y: 30, type: 'hub', name: 'Nexus Gateway', connections: ['SOL', 'VEGA', 'STATION'] },
            'VEGA': { x: 35, y: 25, type: 'ruins', name: 'Vega Ruins', connections: ['NEXUS'] },
            'STATION': { x: 40, y: 20, type: 'station', name: 'Station', connections: ['NEXUS'] }
        }
    }
};

// Screen content generators
const screens = {
    map: () => generateGalaxyMap(),
    ship: () => generateShipStatus(),
    guild: () => generateGuildScreen(),
    crisis: () => generateCrisisScreen()
};

// Generate Galaxy Map ASCII (Clean version with interactive tooltips)
function generateGalaxyMap() {
    return `
     .    .   .      .    .         .       .       .    .          .    .   
           .      .    .    .        .        .          .      .             
      .        .         .     .      .         .              .        .     
   .       .      .          .    .         .         .      .     .         
      .         .      .        .        .         .    .        .         .  
   .       .        .    .          .        .             .        .         
      .      .          .      .        .         .      .     .       .     
   .    .        .           .     .        .        .      .           .    
      .     .      .    .         .     .       .       .    .        .      
   .       .          .    .     .       .         .    .         .     .    
     ●     .    .         .    .     .       .      .         .     .       
      .      .    .        .       .     .      .    .       .         .     
   .     .       .    .       .         .    .      .     .       .    .     
      .        .         .      .    .        .        .      .      .       
   .      .       .    .          .      .        .      .        .         
     .       .        .    .        .         .      .        .              
                        .    .         .      .        .             .      .
   .      .        .           .        .      .         .      .           
      .       .    .          .     .          .    .         .    .        
   .       .          .    .       .        .      .         .         .    
      .      .    .         .       .        .    .       .          .      
   .          .       .       .          .        .    .         .          
         ═══════════════════════════●═══════════════════════════             
      .        .     .    .     ★          .       .      .    .    .        
   .      .        .          .    .     .         .         .         .    
      .        .    .      .         .       .        .          .      .   
   .       .         .       .    .        .     .       .        .         
      .    .       .            .      .        .    .         .    .       
   .         .        .    .        .        .      .         .             
      .        .         .     .       .         .    .         .      .    
   .      .       .    .          .        .         .      .         .     
      .         .       .    .        .         .    .         .      .     
   .       .       .        .    .         .      .        .         .      
      .      .         .         .       .        .         .     .         
   .         .    .        .       .         .       .    .         .       
      .        .         .    .         .        .         .      .         
   .      .         .        .    .         .      .        .         .     
      .         .       .         .    .         .        .         .       
   .        .         .      .         .       .        .         .         
                        .         ?         .       .         .       .     
   .       .         .        .         .    .         .        .         . 
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       ◆        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
        ●───────────────────────────────────────────────             
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .    ?    .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .      ?  .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .    ?    .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .    ?    .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
    GALACTIC VOID - INTERGALACTIC BOUNDARY          .         .              
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 
  The edge of everything. What lies beyond the last star?      .       .    
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      
   .        .         .       .        .         .       .        .         
      .         .      .         .        .         .      .         .      `;
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
        ruins: '◆',
        station: '■',
        planet: '◉'
    };
    return symbols[type] || '●';
}

// Generate Ship Status Screen
function generateShipStatus() {
    const shipInfo = `Hull Integrity: ████████░░ 80%
Fuel Reserves:  ████████░░ 8/10 AP
Shield Status:  ██████████ 100%
Weapon Systems: ██████░░░░ Online
Life Support:   ██████████ Optimal
Navigation:     ██████████ Calibrated

Current Mission: Long Range Survey
Days Deployed: 127
Systems Scanned: 12/50
Anomalies Found: 3`;

    const additionalInfo = `Ship Class: Light Scout Frigate
Registry: UES-Starfinder-1247
Captain: ${gameState.player.name}
Crew Complement: 4/4
Last Maintenance: Sol Dock 7 days ago
Next Service Due: 23 days`;

    const shipTitle = `SHIP: "${gameState.player.shipName}" (Scout)`;
    
    return createBox(shipInfo, shipTitle) + '\n\n' + createBox(additionalInfo);
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
    
    // Initialize screen
    updateScreen('map');
    updateStatusPanel();
    
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
    
    // Handle action buttons
    document.getElementById('navigate-btn').addEventListener('click', handleNavigate);
    document.getElementById('scan-btn').addEventListener('click', handleScan);
    
    // Handle legend popup
    document.getElementById('legend-btn').addEventListener('click', showLegend);
    document.getElementById('legend-close').addEventListener('click', hideLegend);
    
    // Close legend when clicking outside
    document.getElementById('legend-popup').addEventListener('click', (e) => {
        if (e.target.id === 'legend-popup') {
            hideLegend();
        }
    });
    
    // Add click handlers for system symbols in the map
    document.getElementById('ascii-display').addEventListener('click', handleMapClick);
}

// Handle clicks on the galaxy map
function handleMapClick(e) {
    // This would need more sophisticated coordinate mapping
    // For now, we'll implement a simple system recognition
    const clickX = e.offsetX;
    const clickY = e.offsetY;
    
    // TODO: Implement proper coordinate mapping to detect which system was clicked
    // For demo purposes, show tooltip for Sol system
    showSystemTooltip('sol', clickX, clickY);
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
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        const tooltip = document.getElementById('system-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }, 5000);
}

// Update screen content
function updateScreen(screenName) {
    console.log('Updating screen to:', screenName);
    
    gameState.currentScreen = screenName;
    const display = document.getElementById('ascii-display');
    
    if (screens[screenName]) {
        display.textContent = screens[screenName]();
    } else {
        display.textContent = `Screen "${screenName}" not found.`;
    }
    
    // Update status panel
    updateStatusPanel();
    
    // Update action buttons based on screen
    updateActionButtons(screenName);
}

// Update static status panel
function updateStatusPanel() {
    document.getElementById('current-location').textContent = gameState.player.location;
    document.getElementById('action-points').textContent = `${gameState.player.actionPoints}/${gameState.player.maxActionPoints}`;
    document.getElementById('credits').textContent = gameState.player.credits.toLocaleString();
    document.getElementById('ship-name').textContent = gameState.player.shipName;
}

// Update action buttons based on current screen
function updateActionButtons(screen) {
    const navigateBtn = document.getElementById('navigate-btn');
    const scanBtn = document.getElementById('scan-btn');
    const legendBtn = document.getElementById('legend-btn');
    
    // Always show legend button
    legendBtn.style.display = 'block';
    
    switch(screen) {
        case 'map':
            navigateBtn.textContent = 'NAVIGATE';
            navigateBtn.style.display = 'block';
            scanBtn.textContent = 'SCAN';
            scanBtn.style.display = 'block';
            break;
        case 'ship':
            navigateBtn.textContent = 'REPAIR';
            navigateBtn.style.display = 'block';
            scanBtn.textContent = 'UPGRADE';
            scanBtn.style.display = 'block';
            break;
        case 'guild':
            navigateBtn.textContent = 'MISSIONS';
            navigateBtn.style.display = 'block';
            scanBtn.textContent = 'VOTE';
            scanBtn.style.display = 'block';
            break;
        case 'crisis':
            navigateBtn.textContent = 'RESPOND';
            navigateBtn.style.display = 'block';
            scanBtn.style.display = 'none';
            break;
        default:
            navigateBtn.style.display = 'block';
            scanBtn.style.display = 'block';
            break;
    }
}

// Handle navigate action
function handleNavigate() {
    if (gameState.currentScreen === 'map') {
        if (gameState.player.actionPoints >= 2) {
            gameState.player.actionPoints -= 2;
            gameState.player.location = 'NEXUS';
            updateScreen('map');
        } else {
            alert('Insufficient Action Points for navigation!');
        }
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

// Handle scan action
function handleScan() {
    if (gameState.currentScreen === 'map') {
        if (gameState.player.actionPoints >= 1) {
            gameState.player.actionPoints -= 1;
            alert('Scan complete. Anomalous readings detected in nearby system.');
        } else {
            alert('Insufficient Action Points for scanning!');
        }
    } else if (gameState.currentScreen === 'ship') {
        alert('Ship upgrade interface would open here.');
    } else if (gameState.currentScreen === 'guild') {
        alert('Guild voting interface would open here.');
    }
    
    if (Math.random() > 0.7) {
        gameState.player.credits += 50;
        updateScreen('map');
    }
}

// Legend popup functions
function showLegend() {
    document.getElementById('legend-popup').classList.add('active');
}

function hideLegend() {
    document.getElementById('legend-popup').classList.remove('active');
}

// Start the game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}