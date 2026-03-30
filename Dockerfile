FROM node:22-alpine3.21

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Install app dependencies
COPY package.json /app/
RUN npm install

# Bundle app source
COPY src/ /app/

EXPOSE 80
EXPOSE 5000

CMD [ "node", "index.js" ]
