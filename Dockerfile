FROM node:8.11.4
WORKDIR /scheduling

COPY environment.js /scheduling/

COPY Client/package*.json /scheduling/Client/
WORKDIR /scheduling/Client/
RUN npm install
COPY Client/ /scheduling/Client/
RUN npm run prod

COPY Server/package*.json /scheduling/Server/
WORKDIR /scheduling/Server/
RUN npm install


COPY Server/ /scheduling/Server/

EXPOSE 3000
CMD ["npm", "start"]
