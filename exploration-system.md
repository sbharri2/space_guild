# Space Guilds - Exploration & Warp Node System

## Galaxy Structure

### Warp Node Network
- Galaxy composed of **WarpNodes** connected by **WarpLanes**
- Similar to Guardians of the Galaxy jump points
- Players move between nodes using Action Points (AP)
- Each node contains planets, resources, NPCs, or anomalies

### Sectors
- Galaxy divided into **Sectors** (regions of 6-12 connected nodes)
- MVP starts with 1-2 sectors
- Future expansion adds new sectors with different themes/factions

## Movement System

### Action Points (AP)
- Each player has daily AP pool (refreshed at midnight)
- Movement between nodes costs AP based on distance/hazards
- Engine upgrades increase daily AP maximum
- Unused AP partially carries over (up to 50% of max)

### Movement Costs
- Adjacent nodes: 1 AP
- Distant nodes: 2-3 AP
- Hazardous routes: +1 AP penalty
- Fast travel to discovered nodes: 50% cost reduction

### Memory Drives
- Once node discovered, stored in player's memory drives
- Enables fast travel at reduced AP cost
- Shared discovery within guild (guild members can fast travel to any node discovered by guildmates)

## Discovery System

### Exploration Mechanics
1. Player arrives at unexplored node
2. Spends AP to "scan" the system
3. AI generates discoveries from Discovery Table
4. Results added to player's memory drives
5. Guild gains shared access to discovered content

### Discovery Table Categories

#### Planets (40% chance)
- **Resource Planets**: Mining, gas harvesting, organic farms
- **Habitable Worlds**: Potential guild bases, NPC colonies
- **Hostile Worlds**: Dangerous but valuable resources
- **Weird Worlds**: Cat planet producing "Meowium Ore"

#### Technology Sites (20% chance)
- **Derelict Ships**: Salvageable tech and upgrades
- **Ancient Ruins**: Faction reputation boosts, lore
- **Research Stations**: Ship modification blueprints
- **Weapon Caches**: Rare armaments

#### NPCs & Factions (20% chance)
- **Alien Colonies**: Trading partners, diplomacy
- **Pirate Bases**: Raids, protection rackets
- **Merchant Outposts**: Equipment and upgrades
- **Mysterious Entities**: Unique story opportunities

#### Hazards (15% chance)
- **Asteroid Fields**: Mining opportunities with danger
- **Nebula Storms**: Navigation hazards, hidden treasures
- **Black Holes**: Extreme danger, exotic rewards
- **Pirate Ambushes**: Combat encounters

#### Anomalies (5% chance)
- **Wormholes**: Shortcuts to distant sectors
- **Time Rifts**: Unique narrative opportunities
- **Alien Artifacts**: Powerful one-time effects
- **Dimensional Tears**: Access to parallel storylines

## Node Control System

### Claiming Nodes
- Guilds can claim nodes by establishing presence
- Requires building defenses or colonies
- Provides ongoing resource income
- Can be contested by other guilds

### Node Benefits
- **Resource Income**: Passive credit/material generation
- **Strategic Position**: Control of trade routes
- **Defensive Advantage**: Home field bonus in conflicts
- **Expansion Base**: Launching point for further exploration

### Node Conflicts
- Multiple guilds can contest same node
- Resolved through:
  - Direct combat (PvP mechanics)
  - Economic competition (outbid rivals)
  - Diplomatic negotiation (alliances/treaties)
  - Crisis event outcomes

## Exploration Rewards

### Immediate Rewards
- Credits from salvage/trade
- Ship upgrades and modifications
- Resource materials
- Faction reputation points

### Long-term Benefits
- Memory drive entries for fast travel
- Guild strategic positions
- Unlocked storylines and NPCs
- Access to rare technologies

## Discovery Examples

### Serious Discoveries
- "Ancient Shipyard: Contains blueprints for advanced shield generators"
- "Mining Colony: Produces 50 credits per day when claimed"
- "Rebel Base: +10 Rebel Alliance reputation, unlocks special missions"

### Silly Discoveries  
- "Cat Planet: Inhabited entirely by space cats, produces Meowium Ore"
- "Disco Beacon: Ancient artifact playing eternal dance music, attracts tourists"
- "Cow Nebula: Asteroid field shaped like bovine, produces premium milk"

## Technical Implementation

### Node Generation
- Procedural generation with weighted tables
- Hand-crafted special nodes for story beats
- Seasonal rotation of available discoveries
- Balance between serious gameplay and humor

### Memory Drive System
- Local storage of discovered nodes
- Cloud sync for guild sharing
- Efficient pathfinding for fast travel
- Discovery history and lore tracking