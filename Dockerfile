FROM node:latest

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Install app dependencies
COPY package.json /app/
RUN npm install

# Bundle app source
COPY src/ /app/

EXPOSE 5000

CMD [ "node", "index.js" ]
