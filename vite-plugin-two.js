import { exec } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export default function two() {
  let config;

  return {
    name: 'vite-plugin-two',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    resolveId(source, importer) {
      if (source.endsWith('.go')) {
        return path.resolve(path.dirname(importer), source);
      }
      return null;
    },
    async transform(code, id) {
      if (!id.endsWith('.go')) {
        return null;
      }
      
      this.addWatchFile(id);
      
      const parsedPath = path.parse(id);
      const wasmFileName = `${parsedPath.name}.wasm`;
      const wasmOutputPath = path.join('public', wasmFileName);
      
      await execAsync(`cp $(tinygo env TINYGOROOT)/targets/wasm_exec.js public/ && tinygo build -o '${wasmOutputPath}'${config.mode === 'production' ? ' --no-debug ' : ' '}'${id}'`, {
        env: {
          ...process.env,
          GOOS: 'js',
          GOARCH: 'wasm',
        }
      });
      const outputCode = `export default (WebAssembly.compileStreaming || ((p) => p.then((res) => res.arrayBuffer()).then((arrayBuffer) => WebAssembly.compile(arrayBuffer))))(fetch(\`\${document.baseURI}${wasmFileName}\`));`;
        
      return {
        code: outputCode,
        map: null,
      };
    }
  }
}