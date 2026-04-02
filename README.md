# two

```bash
cp /usr/local/tinygo/targets/wasm_exec.js ./examples/bunnymark/public/ && GOOS=js GOARCH=wasm tinygo build -o ./examples/bunnymark/public/main.wasm ./examples/bunnymark/main.go
```