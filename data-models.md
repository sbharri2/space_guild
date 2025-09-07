# Space Guilds - Core Data Models

## Player
```
Player {
  id: String
  username: String
  guildId: String?
  ships: [Ship]
  credits: Int
  actionPoints: Int
  maxActionPoints: Int
  lastLoginDate: Date
  reputation: [FactionReputation]
  titles: [String]
  discoveredNodes: [String] // Node IDs
}
```

## Ship
```
Ship {
  id: String
  playerId: String
  type: ShipType (Scout, Warship, Trader)
  name: String
  
  // Core Stats
  cargoHold: Int
  weapons: Int
  armor: Int
  shields: Int
  engine: Int
  crew: [CrewMember]
  
  // Special Modifications
  specialMods: [SpecialMod]
  
  // Current State
  currentHealth: Int
  maxHealth: Int
  location: String // Node ID
  cargo: [CargoItem]
}
```

## Guild
```
Guild {
  id: String
  name: String
  description: String
  memberIds: [String]
  leaderId: String
  
  // Guild Assets
  planets: [Planet]
  sharedCredits: Int
  reputation: [FactionReputation]
  
  // Guild Progression
  level: Int
  experience: Int
  unlocks: [String]
  
  // Settings
  isRecruiting: Bool
  maxMembers: Int
  crisisStrategy: CrisisStrategy?
}
```

## WarpNode
```
WarpNode {
  id: String
  name: String
  type: NodeType
  position: Coordinate
  connections: [String] // Connected node IDs
  
  // Discovery State
  discoveredBy: [String] // Player IDs
  explorationLevel: Int
  
  // Content
  planets: [Planet]
  anomalies: [Anomaly]
  npcs: [NPC]
  hazards: [Hazard]
  resources: [Resource]
  
  // Control
  controlledBy: String? // Guild ID
  defensiveStructures: [Defense]
}
```

## Crisis
```
Crisis {
  id: String
  date: Date
  title: String
  description: String
  suggestedResponses: [String]
  
  // Responses
  guildResponses: [GuildResponse]
  
  // Resolution
  isResolved: Bool
  aiNarrative: String?
  consequences: [Consequence]
  rewards: [Reward]
}
```

## GuildResponse
```
GuildResponse {
  guildId: String
  crisisId: String
  action: String
  playersInvolved: [String]
  actionPoints: Int
  timestamp: Date
}
```

## Planet
```
Planet {
  id: String
  nodeId: String
  name: String
  type: PlanetType
  size: PlanetSize
  
  // Ownership
  ownedBy: String? // Guild ID
  
  // Resources
  resources: [ResourceDeposit]
  
  // Development
  buildings: [Building]
  defenses: [Defense]
  population: Int
  infrastructure: Int
  
  // Special Properties
  traits: [PlanetTrait]
  description: String
}
```

## Enums

### ShipType
- Scout: High engine, low weapons, medium cargo
- Warship: High weapons/armor, low cargo, medium engine  
- Trader: High cargo, low weapons/armor, medium engine

### NodeType
- System (planets and resources)
- Nebula (hazards and hidden resources)
- DerelictSite (technology and dangers)
- NPCHub (aliens and trading)
- Anomaly (weird and wonderful)

### PlanetType
- Terrestrial (balanced resources)
- GasGiant (fuel and rare materials)
- AsteroidField (minerals and metals)
- IceWorld (water and organics)
- Volcanic (energy and exotic materials)

### FactionType
- GalacticEmpire (order and stability)
- PirateSyndicate (chaos and profit)
- AlienCollective (mystery and technology)
- RebelAlliance (freedom and justice)
- MerchantGuilds (trade and commerce)

## Relationships

- Player belongs to Guild (optional)
- Player owns multiple Ships
- Ships can have Cargo and CrewMembers
- Guilds can control Planets and WarpNodes
- WarpNodes contain Planets and connect to other WarpNodes
- Crises generate GuildResponses and Consequences
- All entities can have Reputation with various Factions