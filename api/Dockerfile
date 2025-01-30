# Backend Dockerfile

FROM node:18

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# ensure .env file is available
COPY .env .env

EXPOSE 3000

CMD ["node", "index.js"]
