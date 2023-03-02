FROM node:lts-alpine

WORKDIR /app

RUN apk update && apk add --no-cache nmap
RUN echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories
RUN echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories
RUN apk update
RUN apk add --no-cache \
      chromium \
      harfbuzz \
      "freetype>2.8" \
      ttf-freefont \
      nss

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

ENV NODE_ENV=production

# RUN apk add --no-cache libc6-compat ca-certificates mailcap openssl1.1-compat caddy zip

# WORKDIR /app/service

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN npm run build

EXPOSE 4004

# Start the server using the production build
CMD [ "node", "dist/main.js" ]

# RUN npx prisma generate

# EXPOSE 4004

# CMD yarn start:prod
