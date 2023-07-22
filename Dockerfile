FROM node:16.13.1-alpine3.14

WORKDIR /app

COPY ["package.json", "package-lock.json", "tsconfig.json", ".env", "./"]

COPY ./ ./

RUN npm install

# RUN npx sequelize-cli db:migrate

# Runs the dev npm script to build & start the server
CMD ["npm", "start"]