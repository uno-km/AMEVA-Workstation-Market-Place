# AMEVA Workstation Marketplace

## Overview
AMEVA Workstation Marketplace is a decentralized extension and plugin server for the AMEVA Workstation ecosystem. It serves as a central hub for hosting and serving plugins, models, and real-time financial data. Built on a lightweight Express.js architecture, this backend ensures high availability and fast delivery of decentralized components.

## Architecture
This project is built using Node.js and Express.js, providing a robust and extensible HTTP server. It leverages caching mechanisms and single-flight patterns to handle high-frequency requests, such as real-time financial queries, ensuring optimal performance and preventing rate-limiting issues from upstream data providers.

## Key Features
- **Plugin Distribution**: Serves as a static file server to deliver AMEVA Workstation plugins and extensions securely.
- **High-Performance Caching**: Implements in-memory TTL caching and single-flight patterns for external API calls, significantly reducing redundant network traffic.
- **Real-Time Financial Hub**: Acts as a proxy and aggregator for real-time stock and exchange rate data (e.g., Yahoo Finance, Open Exchange Rates), providing processed and reliable market data to connected Workstation clients.
- **Cross-Origin Resource Sharing (CORS)**: Fully configured to seamlessly integrate with local and remote AMEVA Workstation instances.

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (Node Package Manager)

### Installation
1. Clone this repository.
2. Install the required dependencies:
   ```bash
   npm install
   ```

### Running the Server
Start the server in a development or production environment:
```bash
npm start
```
The server will default to running on port 3010.

## Project Structure
- `server.js`: The main application entry point containing routing, caching logic, and API integrations.
- `public/plugins/`: The directory where decentralized plugins and extensions are hosted for the marketplace.
- `package.json`: Project metadata and dependency definitions.

## License
Proprietary. All rights reserved.
