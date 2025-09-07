# Space Guilds - Mobile Web Game

A text-based space exploration guild game with ASCII graphics, optimized for mobile devices.

## Features
- 🚀 Galaxy exploration with warp node system
- 📱 Mobile-optimized ASCII interface
- ⚔️ Daily AI-driven crisis events
- 🏛️ Guild management and cooperation
- 🛸 Ship progression and upgrades

## Quick Start

### Local Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

## Game Screens
- **Galaxy Map**: Navigate between star systems
- **Ship Status**: View and upgrade your vessel
- **Guild Hall**: Manage guild members and assets
- **Crisis Response**: Respond to daily challenges

## Technologies
- Pure HTML/CSS/JavaScript (no framework dependencies)
- Mobile-first responsive design
- Progressive Web App (PWA) support
- ASCII art rendering system

## Project Structure
```
space_guild/
├── index.html          # Main HTML structure
├── style.css           # Mobile-optimized styles
├── game.js             # Game logic and state
├── manifest.json       # PWA configuration
├── package.json        # Project dependencies
└── vercel.json         # Vercel deployment config
```

## Mobile Testing
Open the development server on your mobile device:
1. Run `npm run dev`
2. Find your computer's IP address
3. Open `http://[YOUR-IP]:3000` on your phone

## Browser Support
- iOS Safari 12+
- Chrome Mobile 80+
- Firefox Mobile 68+
- Samsung Internet 10+