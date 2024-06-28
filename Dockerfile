FROM node:16.15.0 as base
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install -g npm@9.8.1

#-----Build ---
FROM base AS build
#install node packages
RUN npm install --production
RUN cp -R node_modules ../prod_node_modules
# install ALL node_modules, including 'devDependencies'
COPY . .
RUN npm install     
RUN npm run dockerbuild 
RUN /bin/sh -c "sed 's/\r//g' < newrelic.js > ./dist/src/newrelic.js"
RUN cp -R dist ../prod_dist

#----Release---
FROM base AS release
COPY --from=build /usr/src/prod_dist ./dist
COPY --from=build /usr/src/prod_node_modules ./node_modules
# #install newrelic
RUN npm install newrelic --save
ENV TZ=Asia/Kolkata
RUN chown -R node /usr/src/app
USER node
WORKDIR /usr/src/app

CMD npm run-script serve