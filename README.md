# two

## TinyGo container

Start TinyGo container:

```bash
docker run -it --rm -v $PWD:/app --workdir /app tinygo/tinygo:0.40.1 sh
```

Compile bunnymark example:

```bash
cp /usr/local/tinygo/targets/wasm_exec.js ./examples/bunnymark/public/ && GOOS=js GOARCH=wasm tinygo build -o ./examples/bunnymark/public/main.wasm ./examples/bunnymark/main.go
```

## Node.js container

Start Node.js container:

```bash
docker run -it --rm -v $PWD:/app --workdir /app node:24.12.0-alpine3.23 sh
```

Build `@bernhardfritz/two` library:

```bash
npm i
npm run build
```

Start dev server:

```bash
cd examples/bunnymark/
npm i
npm run dev
```

Open in browser: http://localhost:5173/