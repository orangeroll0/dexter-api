FROM oven/bun:latest

WORKDIR /app

RUN apt-get update && apt-get install -y git && apt-get clean

COPY . .

# サブモジュールを取得
RUN git submodule update --init --recursive

RUN bun install

EXPOSE 3000

CMD ["bun", "run", "start"]
