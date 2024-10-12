FROM oven/bun:1.1.30 AS build
WORKDIR /usr/src/app
COPY bun.lockb package.json ./
RUN bun install
COPY . .
RUN bun run build

FROM ubuntu:24.04
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/app app
COPY --from=build /usr/src/app/dist dist
COPY --from=build /usr/src/app/drizzle drizzle
COPY --from=build /usr/src/app/node_modules/drizzle-orm node_modules/drizzle-orm
CMD ["./app"]
