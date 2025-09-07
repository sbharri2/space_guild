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
        maxActionPoints: 10,
        guildId: null
    },
    galaxy: {
        nodes: {
            'SOL': { x: 20, y: 15, type: 'system', name: 'Sol', connections: ['KEPLER', 'RIGEL', 'MARS'] },
            'ALPHA_PRIMUS': { x: 35, y: 5, type: 'system', name: 'Alpha Primus', connections: ['ETA_NOR'] },
            'ETA_NOR': { x: 30, y: 12, type: 'system', name: 'Eta Nor', connections: ['ALPHA_PRIMUS', 'SOL'] },
            'KEPLER': { x: 10, y: 8, type: 'system', name: 'Kepler', connections: ['SOL'] },
            'VEGA': { x: 30, y: 8, type: 'anomaly', name: 'Vega', connections: ['RIGEL'] },
            'RIGEL': { x: 35, y: 15, type: 'system', name: 'Rigel', connections: ['SOL', 'VEGA', 'NEXUS'] },
            'MARS': { x: 10, y: 20, type: 'outpost', name: 'Mars', connections: ['SOL'] },
            'NEXUS': { x: 25, y: 20, type: 'station', name: 'Nexus', connections: ['RIGEL', 'STATION'] },
            'HYDRA_IV': { x: 8, y: 25, type: 'system', name: 'Hydra IV', connections: ['DENEB'] },
            'DENEB': { x: 20, y: 30, type: 'system', name: 'Deneb', connections: ['HYDRA_IV'] },
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

// Generate Galaxy Map ASCII (True Space - Mostly Empty)
function generateGalaxyMap() {
    return `
                                                                                     
                .                                                                  .
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                .                                    
                                                                                     
                                                                                     
                                                                                     
     ●                                                                             
   MARS                                                                            
  OUTPOST                                                                          
  {WAR}                                                                            
                                                                                     
                                               .                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
         ═══════════════════════════●═══════════════════════════                   
                                  SOL                                              
                                 HOME                                              
                                {EARTH}                                            
                                  ★                                                
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                    .                                                
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                          ?                          
                                                     UNCHARTED                       
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                 .                                   
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                    ◆                                                
                                  VEGA                                             
                                  RUINS                                            
                                 {ALIEN}                                           
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                           .                         
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                ●───────────────────────────────────────────────                    
               NEXUS                                                               
             GATEWAY                                                               
              {HUB}                                                                
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                      .                                                              
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                          ?                          
                                                     UNKNOWN                         
                                                      SIGNAL                         
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
           .                                                                         
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                            .                                        
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                           ?                                         
                                      DEEP SPACE                                    
                                       ANOMALY                                      
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
              .                                                                      
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
    EDGE OF THE GALAXY                                                             
  ░░░░░░░░░░░░░░░░░░░░                                                             
  What lies beyond?                                                              
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                           .                                         
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                       ?                                             
                                  OUTER RIM                                          
                                   MYSTERY                                           
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                          .                                                          
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                           ?                                         
                                      DARK NEBULA                                   
                                     ENERGY READINGS                                
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
      .                                                                              
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
    GALACTIC VOID - INTERGALACTIC BOUNDARY                                         
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░     
  The edge of everything. What lies beyond the last star?                        
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     `;
}

// Draw connections between nodes
function drawConnection(map, node1, node2) {
    const dx = node2.x - node1.x;
    const dy = node2.y - node1.y;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    
    for (let i = 1; i < steps; i++) {
        const x = Math.round(node1.x + (dx * i / steps));
        const y = Math.round(node1.y + (dy * i / steps));
        
        if (y >= 0 && y < map.length && x >= 0 && x < map[0].length) {
            if (map[y][x] === ' ') {
                if (i % 3 === 0) {
                    map[y][x] = Math.abs(dx) > Math.abs(dy) ? '-' : '|';
                } else {
                    map[y][x] = '·';
                }
            }
        }
    }
}

// Get node symbol based on type
function getNodeSymbol(type) {
    const symbols = {
        system: '○',
        station: '▣',
        outpost: '◇',
        anomaly: '◆',
        planet: '◉'
    };
    return symbols[type] || '●';
}

// Generate Ship Status Screen
function generateShipStatus() {
    const shipInfo = `>o  [########..] Hull: 8/10
*   [##########] Shields: 10/10
%   [#######...] Systems: 7/10

Engine:  ########.. (8)
Weapons: ##........ (2)
Cargo:   ###....... (3/10)

Crew: [Smuggler] [Engineer]
Mods: [Cloaking] [Scanner+]`;

    const additionalInfo = `Ship Class: Scout
Role: Fast exploration  
Special: Advanced scanners

Next Upgrade: 500 credits`;

    const shipTitle = `SHIP: "${gameState.player.shipName}" (Scout)`;
    
    return createBox(shipInfo, shipTitle) + '\n\n' + createBox(additionalInfo);
}

// Generate Guild Screen
function generateGuildScreen() {
    const guildMain = `Level 3 Explorer Guild
Members: 3/5

> Captain_Alex   [Scout]   * Online
> TraderJoe     [Trader]  o Offline  
> WarHammer     [Warship] * Online`;

    const guildAssets = `# Home Base: New Terra
o Outpost: Mining Station
Credits: 15,847
Rep: Empire +15, Rebels -5`;

    const guildStatus = `Next Crisis: 6h 23m`;

    return createBox(guildMain, 'STAR RAIDERS GUILD') + '\n\n' + 
           createBox(guildAssets, 'Guild Assets') + '\n\n' +
           createBox(guildStatus);
}

// Generate Crisis Screen
function generateCrisisScreen() {
    const crisisDescription = `A derelict freighter drifts through
the trade routes, cargo holds full
but life support failing...`;

    const crisisOptions = `[1] Investigate for survivors
[2] Salvage cargo before pirates  
[3] Escort to nearest station
[4] Turn into space museum`;

    const crisisResponse = `Your Response:
[________________________]

Time Remaining: 6h 23m
Guild Strategy: Coordinated`;

    return createBox(crisisDescription, 'DAILY CRISIS - Day 42') + '\n\n' +
           createBox(crisisOptions, 'Response Options') + '\n\n' +
           createBox(crisisResponse);
}

// Initialize the game
function init() {
    // Remove loading overlay
    setTimeout(() => {
        const loading = document.getElementById('loading');
        loading.classList.remove('active');
    }, 500);
    
    // Set initial screen
    updateScreen('map');
    
    // Add tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const screen = btn.dataset.screen;
            console.log('Switching to screen:', screen); // Debug log
            
            // Update active tab first
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update screen
            updateScreen(screen);
        });
    });
    
    // Add action button handlers
    document.getElementById('navigate-btn').addEventListener('click', handleNavigate);
    document.getElementById('scan-btn').addEventListener('click', handleScan);
    
    // Add legend popup handlers
    document.getElementById('legend-btn').addEventListener('click', showLegend);
    document.getElementById('legend-close').addEventListener('click', hideLegend);
    
    // Close legend when clicking outside
    document.getElementById('legend-popup').addEventListener('click', (e) => {
        if (e.target.id === 'legend-popup') {
            hideLegend();
        }
    });
}

// Update screen content
function updateScreen(screenName) {
    console.log('Updating to screen:', screenName); // Debug log
    gameState.currentScreen = screenName;
    const display = document.getElementById('ascii-display');
    
    if (screens[screenName]) {
        display.textContent = screens[screenName]();
        console.log('Screen content updated'); // Debug log
    } else {
        console.error('Screen not found:', screenName);
        display.textContent = 'ERROR: Screen not found';
    }
    
    // Update static status panel
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
    
    switch(screen) {
        case 'map':
            navigateBtn.textContent = 'NAVIGATE';
            scanBtn.textContent = 'SCAN';
            navigateBtn.style.display = 'block';
            scanBtn.style.display = 'block';
            break;
        case 'ship':
            navigateBtn.textContent = 'UPGRADE';
            scanBtn.textContent = 'REPAIR';
            navigateBtn.style.display = 'block';
            scanBtn.style.display = 'block';
            break;
        case 'guild':
            navigateBtn.textContent = 'MEMBERS';
            scanBtn.textContent = 'ASSETS';
            navigateBtn.style.display = 'block';
            scanBtn.style.display = 'block';
            break;
        case 'crisis':
            navigateBtn.textContent = 'SUBMIT';
            scanBtn.textContent = 'COORDINATE';
            navigateBtn.style.display = 'block';
            scanBtn.style.display = 'block';
            break;
    }
}

// Handle navigate action
function handleNavigate() {
    if (gameState.currentScreen === 'map') {
        if (gameState.player.actionPoints > 0) {
            // Simple navigation simulation
            const nodes = Object.keys(gameState.galaxy.nodes);
            const currentIndex = nodes.indexOf(gameState.player.location);
            const nextIndex = (currentIndex + 1) % nodes.length;
            gameState.player.location = nodes[nextIndex];
            gameState.player.actionPoints--;
            updateScreen('map');
        } else {
            alert('No Action Points remaining! Wait for daily refresh.');
        }
    } else if (gameState.currentScreen === 'ship') {
        // Rename ship function
        const newName = prompt('Enter new ship name:', gameState.player.shipName);
        if (newName && newName.trim()) {
            gameState.player.shipName = newName.trim();
            updateScreen('ship');
        }
    }
}

// Handle scan action
function handleScan() {
    if (gameState.currentScreen === 'map') {
        const discoveries = [
            'Found: Abandoned cargo (+ 50 credits)',
            'Found: Distress signal from merchant vessel',
            'Found: Hidden warp lane to distant sector',
            'Found: Space debris with salvageable tech',
            'Found: Mysterious alien artifact'
        ];
        const discovery = discoveries[Math.floor(Math.random() * discoveries.length)];
        alert(discovery);
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