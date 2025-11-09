FROM mcr.microsoft.com/playwright:v1.48.2-jammy

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Install Playwright browsers
RUN npx playwright install chromium

# Copy test files and config
COPY . .

# Make wait script executable
RUN chmod +x wait-for-services.sh

# Run tests
CMD ["sh", "-c", "./wait-for-services.sh && npx playwright test"]

