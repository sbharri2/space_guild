# Space Guilds - Daily Crisis AI System

## Core Philosophy
The AI-DM operates on "yes, and..." improv principles - always embracing player creativity, no matter how absurd, and building upon it with meaningful consequences.

## Daily Crisis Flow

### 1. Crisis Generation (Daily Reset)
- AI generates crisis prompt at server midnight
- Pulls from crisis templates and current galaxy state
- Considers recent player actions and ongoing storylines
- Creates 1-2 paragraph setup with 3-4 suggested responses

### 2. Response Collection (24-hour window)
- Guilds submit responses privately through game interface
- Players can coordinate within guild or act independently
- No restrictions on response creativity - anything goes
- Deadline creates urgency and prevents overthinking

### 3. AI Adjudication Process
1. **Classify Actions**: Serious, silly, risky, cooperative, hostile
2. **Resolve Individual Outcomes**: Success/failure for each guild
3. **Handle Conflicts**: When guilds' actions interfere
4. **Generate Narrative**: Weave all actions into coherent story
5. **Assign Consequences**: Rewards, penalties, ongoing effects

### 4. Galactic Newsfeed Publication
- AI creates dramatic headlines and news stories
- Highlights both heroic and ridiculous actions
- Establishes ongoing story threads
- Updates galaxy state and faction standings

## Crisis Categories

### Resource Crises
**Setup**: "A rare mineral convoy has broken down in the asteroid belt"
**Responses**:
- Escort safely (+credits, +reputation)
- Raid cargo (-reputation, +resources)
- Offer repairs (moderate rewards, new NPC ally)
- Ignore (no immediate effect, potential future consequences)

### Diplomatic Crises
**Setup**: "Two alien factions are negotiating a trade agreement"
**Responses**:
- Mediate discussions (+diplomacy reputation)
- Sabotage talks (+pirate reputation, faction hostility)
- Offer bribes to both sides (expensive but profitable)
- Livestream negotiations for entertainment (silly but memorable)

### Military Crises
**Setup**: "A derelict dreadnought has been detected drifting near inhabited systems"
**Responses**:
- Investigate for technology (+rare tech, potential danger)
- Warn nearby colonies (+Empire reputation, safety)
- Salvage weapons systems (+military power, ethical questions)
- Turn it into a space casino (silly transformation with ongoing income)

### Environmental Crises
**Setup**: "A stellar flare threatens to disrupt communications across the sector"
**Responses**:
- Deploy protective satellites (+infrastructure, ongoing benefits)
- Evacuate affected areas (+humanitarian reputation)
- Study the phenomenon (+scientific knowledge)
- Blame space wizards and demand they fix it (silly but potentially effective)

## AI Response Processing

### Conflict Resolution
When guild actions interfere:
- **Direct Opposition**: Combat resolution or negotiation
- **Resource Competition**: Bidding war or sharing mechanics
- **Unintended Consequences**: Silly actions affecting serious ones

### Narrative Integration
AI weaves all responses into single story:
- Serious actions become news headlines
- Silly actions become comic relief with real impact
- Failed actions create new problems
- Successful cooperation gets highlighted

### Consequence Assignment

#### Immediate Rewards
- Credits (economic impact)
- Reputation points (faction standing)
- Resources (building materials)
- Technology upgrades (ship modifications)

#### Ongoing Effects
- New NPCs and relationships
- Changed faction standings
- Environmental modifications
- Unlocked storylines

#### Silly Consequences
- Meme-worthy titles ("Defacers of Ancient Monuments")
- Recurring story elements (the cow nebula incident)
- Tourist attractions ("Visit the Disco Beacon!")
- Inside jokes that become game lore

## Example Crisis Resolution

### The Freighter Convoy Crisis

**Setup**: "Merchant convoy stranded by engine failure in pirate territory"

**Guild Responses**:
- **Iron Hawks**: "Escort convoy to safety with our warships"
- **Star Traders**: "Offer repair services for 50% of cargo"
- **Void Runners**: "Dress ships as pirates and 'raid' convoy to steal it first"
- **Cosmic Jesters**: "Organize impromptu space rave to distract real pirates"

**AI Resolution**:
1. **Iron Hawks**: Successful escort, gain Empire reputation, convoy grateful
2. **Star Traders**: Deal accepted, gain credits and merchant contacts  
3. **Void Runners**: Confusion with real pirates leads to actual battle
4. **Cosmic Jesters**: Rave attracts everyone, creates chaotic dance-off in space

**Galactic Newsfeed Headlines**:
- "HEROES SAVE CONVOY: Iron Hawks praised by Merchant Guild"
- "BUSINESS BOOM: Star Traders profit from crisis response" 
- "PIRATE CONFUSION: Void Runners battle real raiders in identity mix-up"
- "GALAXY'S BIGGEST SPACE RAVE: Cosmic Jesters throw impromptu dance party in asteroid field"

**Consequences**:
- Convoy route becomes safer (+infrastructure)
- New merchant NPC available for trading
- Real pirates now hostile to Void Runners
- "Disco Asteroid" becomes recurring location for silly encounters

## Technical Implementation

### AI Integration Points
- Crisis generation API call each day
- Response processing and narrative generation
- Dynamic consequence application to game state
- Newsfeed formatting and publication

### Content Guidelines
- Always embrace player creativity
- Silly actions have real but proportional consequences
- Failed actions create new story opportunities
- Build ongoing lore from past silliness

### Balancing Mechanisms
- Serious actions generally more reliable
- Silly actions more unpredictable but memorable
- Risk/reward scaling with action boldness
- Long-term reputation effects prevent pure chaos

## Crisis Templates Library

### Template Structure
```
CrisisTemplate {
  title: String
  setup: String
  suggestedResponses: [String]
  tags: [String] // For filtering and variety
  requiredConditions: [String] // Galaxy state requirements
  consequences: ConsequenceTable
}
```

### Example Templates
- Resource shortages and surpluses
- Diplomatic incidents and negotiations  
- Environmental disasters and phenomena
- Military conflicts and discoveries
- Alien first contact scenarios
- Ancient artifact discoveries
- Economic market fluctuations
- Pirate activity and crime waves