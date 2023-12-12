import * as esbuild from 'esbuild-wasm';

let initializePromise;
import { depBaseUrl } from '$utils';

function initialize() {
  if (!initializePromise) {
    initializePromise = esbuild.initialize({
      worker: typeof Worker != 'undefined',
      wasmURL: 'http://localhost:3006/esbuild.wasm' // todo: version
    });
  }
  return initializePromise;
}

function build(e) {
  console.log(e, 'build');
  return initialize().then(() => esbuild.build(e));
}

function transform(e, r) {
  console.log(e, r, 'transform');
  return initialize().then(() => esbuild.transform(e, {
    ...r
  }));
}

function formatMessages(e, r) {
  return initialize().then(() => esbuild.formatMessages(e, r));
}

function startService() {
  return initialize().then(() => ({
    transform: esbuild.transform,
    build: esbuild.build
  }));
}

export {
  build,
  transform,
  formatMessages,
  startService
};
