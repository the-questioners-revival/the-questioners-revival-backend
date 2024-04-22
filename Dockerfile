# -------------BUILD STAGE------------------------
    FROM node:18.13.0 AS builder

    # Create app directory
    WORKDIR /app
    
    # A wildcard is used to ensure both package.json AND package-lock.json are copied
    COPY package*.json ./
    
    # Install app dependencies
    RUN npm install
    
    COPY . .
    
    RUN npm run build
    
    #----------------RUN STAGE-------------------
    
    FROM node:18.13.0
    WORKDIR /app
    COPY --from=builder /app ./
    
    CMD [ "node", "dist/main.js"]