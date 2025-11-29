# Performance Matrix - Athlete Management System

A comprehensive athlete management system with real-time data integration from Output Sports, live calendar synchronization, and AI-powered analytics.

## Features

### Output Sports API Integration
- Secure API key configuration and validation
- Real-time athlete data synchronization
- Performance metrics retrieval (jump, sprint, strength)
- Team data management

### Live Calendar Sync
- Automatic synchronization of daily activities
- Event management (create, update, delete)
- Support for various event types (training, competition, recovery, meeting)
- Filtering by athlete, team, date range, or event type
- Real-time event notifications

### AI-Powered Analytics
- Performance analysis and insights
- Training recommendations
- Injury risk assessment
- Caching for efficient repeated queries

## Installation

```bash
# Clone the repository
git clone https://github.com/hoosiersportsperformance-alt/performance-matrix.git
cd performance-matrix

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure your API keys in .env
```

## Configuration

Create a `.env` file with the following variables:

```env
# Output Sports API Configuration
OUTPUT_SPORTS_API_KEY=your_output_sports_api_key_here
OUTPUT_SPORTS_API_URL=https://api.outputsports.com/v1

# Calendar Sync Configuration
CALENDAR_SYNC_ENABLED=true
CALENDAR_SYNC_INTERVAL_MS=30000

# AI Features Configuration
AI_FEATURES_ENABLED=true
AI_SERVICE_URL=https://api.example.com/ai

# Server Configuration
PORT=3000
NODE_ENV=development
```

## Running the Application

```bash
# Start the server
npm start

# Development mode
npm run dev

# Run tests
npm test
```

## API Endpoints

### System
- `GET /health` - Health check
- `GET /api/status` - System status

### Output Sports
- `GET /api/output-sports/status` - Connection status
- `POST /api/output-sports/configure` - Configure API key
- `POST /api/output-sports/validate` - Validate API key
- `GET /api/output-sports/athletes` - Get all athletes
- `GET /api/output-sports/athletes/:id` - Get specific athlete
- `GET /api/output-sports/athletes/:id/metrics` - Get athlete metrics
- `GET /api/output-sports/teams` - Get all teams
- `GET /api/output-sports/teams/:id` - Get specific team

### Calendar
- `GET /api/calendar/status` - Sync status
- `POST /api/calendar/sync/start` - Start sync
- `POST /api/calendar/sync/stop` - Stop sync
- `POST /api/calendar/sync/trigger` - Manual sync
- `GET /api/calendar/events` - Get events (with optional filters)
- `GET /api/calendar/events/today` - Get today's events
- `GET /api/calendar/events/:id` - Get specific event
- `POST /api/calendar/events` - Create event
- `PUT /api/calendar/events/:id` - Update event
- `DELETE /api/calendar/events/:id` - Delete event

### AI Features
- `GET /api/ai/status` - AI features status
- `POST /api/ai/analyze/performance` - Analyze performance
- `POST /api/ai/recommendations` - Get recommendations
- `POST /api/ai/risk-assessment` - Assess injury risk
- `POST /api/ai/cache/clear` - Clear cache

## Example Usage

### Configure Output Sports API Key

```bash
curl -X POST http://localhost:3000/api/output-sports/configure \
  -H "Content-Type: application/json" \
  -d '{"apiKey": "your-api-key-here"}'
```

### Create a Calendar Event

```bash
curl -X POST http://localhost:3000/api/calendar/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Morning Training",
    "startTime": "2024-01-15T09:00:00Z",
    "endTime": "2024-01-15T10:00:00Z",
    "type": "training",
    "athleteId": "athlete-123"
  }'
```

### Analyze Athlete Performance

```bash
curl -X POST http://localhost:3000/api/ai/analyze/performance \
  -H "Content-Type: application/json" \
  -d '{
    "athleteId": "123",
    "metrics": {
      "jumpHeight": 55,
      "sprintTime": 4.2
    }
  }'
```

## Development

### Project Structure

```
performance-matrix/
├── src/
│   ├── api/
│   │   ├── outputSports.js   # Output Sports API routes
│   │   ├── calendar.js       # Calendar API routes
│   │   └── aiFeatures.js     # AI Features API routes
│   ├── services/
│   │   ├── outputSports.js   # Output Sports service
│   │   ├── calendarSync.js   # Calendar sync service
│   │   └── aiFeatures.js     # AI features service
│   ├── utils/
│   │   └── config.js         # Configuration management
│   └── app.js                # Main application
├── tests/
│   ├── outputSports.test.js
│   ├── calendarSync.test.js
│   ├── aiFeatures.test.js
│   └── api.test.js
├── .env.example
├── .gitignore
├── jest.config.js
├── package.json
└── README.md
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## License

ISC