# Pin the active Node.js LTS line instead of the moving "latest" tag.
FROM node:26

# Set the working directory in the container
WORKDIR /nextapp

# Install dependencies first so this layer is cached until the lockfile changes
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build && chown -R node:node /nextapp

# Drop root privileges before running the server
USER node

# Next.js listens on port 3000 inside the container
EXPOSE 3000

# Start the production server
CMD ["npm", "start"]