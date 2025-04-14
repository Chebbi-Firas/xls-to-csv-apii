# Dockerfile
FROM node:18
WORKDIR /app
COPY . .

# Ajoute les dépendances
RUN npm install


EXPOSE 3000
CMD ["npm", "start"]
