# Dockerfile
FROM node:18
WORKDIR /app
COPY . .

# Ajoute les dépendances
RUN npm install

# Copie .env si tu veux qu’il soit accessible (optionnel)
COPY .env .env

EXPOSE 3000
CMD ["npm", "start"]
