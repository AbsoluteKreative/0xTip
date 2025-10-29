FROM node:20-alpine

WORKDIR /app

# install build deps for native modules
RUN apk add --no-cache python3 make g++ linux-headers libusb-dev eudev-dev

# copy package files
COPY package*.json ./

# install deps
RUN npm ci --only=production

# copy source
COPY . .

# build next.js
RUN npm run build

# expose ports (3000 for frontend, 3001 for backend)
EXPOSE 3000 3001

# start script
RUN chmod +x start.sh
CMD ["./start.sh"]
