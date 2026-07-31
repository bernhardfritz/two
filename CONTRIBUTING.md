# How to contribute?

## Build image

```bash
docker build -t flatland .
```

## Build library and example

At some point this step should be optional. For now this needs to be done manually once:

```bash
docker run -it --rm -v $PWD:/app --workdir /app flatland sh
npm install
npm run build
cd examples/bunnymark/
npm install
<CTRL-D>
```

## Start dev server

```bash
docker run -it --rm -p 5173:5173 -v $PWD:/app --workdir /app/examples/bunnymark flatland
```

Open in browser: http://localhost:5173/

## Serve docs locally

```bash
go install golang.org/x/pkgsite/cmd/pkgsite@latest
pkgsite
```

Open in browser: http://localhost:8080/