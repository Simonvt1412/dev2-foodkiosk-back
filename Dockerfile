FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

COPY server/views ./dist/server/views

EXPOSE 3000

CMD ["npm", "start"]