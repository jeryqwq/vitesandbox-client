
import { CLIENT_DIR } from 'vite';
import pluginTransformTs from '@babel/plugin-transform-typescript';
import { transformSync } from '@babel/core';
import presetReact from '@babel/preset-react';
import babelPresetTypescriptReact from '@babel/preset-typescript';

const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __hasOwnProp = Object.prototype.hasOwnProperty;
const __copyProps = (to, from, except, desc) => {
  if (from && typeof from === 'object' || typeof from === 'function') {
    for (const key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};

export default ({ tree, cfg }) => {
  const runtimeFilePath = '/node_modules/react-refresh/cjs/react-refresh-runtime.development.js';

  const __toESM = (mod, isNodeMode, target) => (target = mod != null ? Object.create(Object.getPrototypeOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, 'default', { value: mod, enumerable: true }) : target, mod));
  const import_fs = __toESM(require('fs'));
  const runtimePublicPath = '/@react-refresh';
  const root = cfg.root;

  const id = root.split('/')[2];
  const preambleCode = `
import RefreshRuntime from "/${id}/vite/${id}${runtimePublicPath}";
RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
window.__vite_plugin_react_preamble_installed__ = true
`;
  const runtimeCode = `
const exports = {}
${import_fs.default.readFileSync(runtimeFilePath, 'utf-8')}
function debounce(fn, delay) {
  let handle
  return () => {
    clearTimeout(handle)
    handle = setTimeout(fn, delay)
  }
}
exports.performReactRefresh = debounce(exports.performReactRefresh, 16)
export default exports
`;
  return [

    {
      name: 'vite:transform:tsx',
      enforce: 'pre',
      load(id) {
        if (id.startsWith(CLIENT_DIR)) { // 去除自身依赖
          // return id;
        }else if(id.startsWith(root)) { // 处理文件依赖
          if(/\.(jsx?|tsx?)$/.test(id)){
            const filePath = id.replace(root, '');
            const transformed = transformSync(tree[filePath], {
              presets: [presetReact, [babelPresetTypescriptReact, { isTSX: true, allExtensions: true }]],
              plugins: [[pluginTransformTs, { isTsx: true, allowNamespaces: true, loose: true }]]
            });
            return `
            import RefreshRuntime from "${runtimePublicPath}";
    
    let prevRefreshReg;
    let prevRefreshSig;
    
    if (import.meta.hot) {
      if (!window.__vite_plugin_react_preamble_installed__) {
        throw new Error(
          "plugin-react-ts can't detect preamble. Something is wrong. " +
          "connect chenjie for more info "
        );
      }
    
      prevRefreshReg = window.$RefreshReg$;
      prevRefreshSig = window.$RefreshSig$;
      console.log(RefreshRuntime.register)
      window.$RefreshReg$ = (type, id) => {
        // RefreshRuntime.register(type, ${id} + " " + id)
      };
      window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
    };
            ${transformed.code}
            if (import.meta.hot) {
              window.$RefreshReg$ = prevRefreshReg;
              window.$RefreshSig$ = prevRefreshSig;
              import.meta.hot.accept();
              if (!window.__vite_plugin_react_timeout) {
                window.__vite_plugin_react_timeout = setTimeout(() => {
                  window.__vite_plugin_react_timeout = 0;
                  RefreshRuntime.performReactRefresh();
                }, 30);
              }
            }
            `;
          }
        }
      }
    },
    {
      name: 'vite:refresh',
      resolveId(id) {
        if (id === runtimePublicPath) {
          return id;
        }
      },
      load(id) {
        if (id === runtimePublicPath) {
          return runtimeCode;
        }
      },
      config: () => ({
        resolve: {
          dedupe: ['react', 'react-dom']
        }
      }),
      transformIndexHtml() {
        // if (!skipFastRefresh)
        return [
          {
            tag: 'script',
            attrs: { type: 'module' },
            children: preambleCode
          }
        ];
      }
    }
  ];
};

