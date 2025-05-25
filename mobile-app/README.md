# Fuel Station App Setup

## Quick Start

1. **Clone the repository and navigate to the fuel-station-app folder:**
   ```bash
   git clone <repo-url>
   cd fuel-station-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure the backend API:**
   - Open `src/services/ApiService.js`
   - Update the base URL to point to your backend server

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Run on your device:**
   - Install Expo Go app from your app store
   - Scan the QR code displayed in the terminal

## Configuration

- **Backend API**: Update `src/services/ApiService.js` with your server URL
- **SMS Service**: Configure `src/services/SMSService.js` if using SMS notifications

## Requirements

- Node.js
- Expo CLI
- Mobile device with Expo Go app
