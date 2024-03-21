FROM node:18-alpine
ENV NODE_ENV=development
WORKDIR /job
COPY package*.json ./
COPY tsconfig.json ./
COPY . .

RUN npm install
RUN npm run build

CMD ["npm" , "run", "start:prod"]
# EXPOSE 3000