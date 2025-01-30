# Frontend Dockerfile

FROM node:18

WORKDIR /app

# copy package.json files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# copy all frontend code
COPY . .

# build the application
RUN npm run build

# use port 80
EXPOSE 80

# install and use serve
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "80"]
