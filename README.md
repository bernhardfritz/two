# two

## Build image

```bash
docker build -t two .
```

## Build library and example

At some point this step should be optional. For now this needs to be done manually once:

```bash
docker run -it --rm -v $PWD:/app --workdir /app two sh
npm install
npm run build
cd examples/bunnymark/
npm install
<CTRL-D>
```

## Start dev server

```bash
docker run -it --rm -p 5173:5173 -v $PWD:/app --workdir /app/examples/bunnymark two
```

Open in browser: http://localhost:5173/