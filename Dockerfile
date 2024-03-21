FROM node:18-alpine
ENV NODE_ENV=development
WORKDIR /job
COPY package*.json ./
COPY tsconfig.json ./
COPY . .
# RUN npm ci 
RUN npm install --save @nestjs/config
RUN npm install
RUN npx prisma generate
CMD ["npm" , "run", "start:prod"]
EXPOSE 3000