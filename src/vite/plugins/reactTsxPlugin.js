
import { CLIENT_DIR } from 'vite';
import pluginTransformTs from '@babel/plugin-transform-typescript';
import { transformSync } from '@babel/core';
import presetReact from '@babel/preset-react';
import babelPresetTypescriptReact from "@babel/preset-typescript";

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var runtimeFilePath = "/node_modules/react-refresh/cjs/react-refresh-runtime.development.js"

var __toESM = (mod, isNodeMode, target) => (target = mod != null ? Object.create(Object.getPrototypeOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var import_fs = __toESM(require("fs"));


export default ({ tree, cfg }) => ({
  name: 'vite:transform:tsx',
  enforce: 'pre',
  // handleHotUpdate(ctx){ // 适配热更新
  //   const { file, read, server } = ctx;
  //   const content = read?.();
  //   const root = cfg.root;
  //   const filePath = file.replace(root, '');
  //   if(/\.(jsx?|tsx?)$/.test(filePath)){
  //     const filePath = filePath.replace(root, '');
  //     const transformed = transformSync(tree[filePath], {
  //       presets: [presetReact, [babelPresetTypescriptReact, { isTSX: true, allExtensions: true }]],
  //       plugins: [[pluginTransformTs, { isTsx: true, allowNamespaces: true, loose: true }]]
  //     });
  //     return transformed.code;
  //   }
  //   const transformed = transformSync(content, {
  //     presets: [presetReact, [babelPresetTypescriptReact, { isTSX: true, allExtensions: true }]],
  //     plugins: [[pluginTransformTs, { isTsx: true, allowNamespaces: true, loose: true }]]
  //   });
  //   ctx.read = () => transformed.code;
  //   // return ctx;
  // },
  load(id) {
    const root = cfg.root;
    console.log(id);
    if (id.startsWith(CLIENT_DIR)) { // 去除自身依赖
      // return id;
    }else if(id.startsWith(root)) { // 处理文件依赖
      if(/\.(jsx?|tsx?)$/.test(id)){
        const filePath = id.replace(root, '');
        // console.log(filePath, tree[filePath]);

        const transformed = transformSync(tree[filePath], {
          presets: [presetReact, [babelPresetTypescriptReact, { isTSX: true, allExtensions: true }]],
          plugins: [[pluginTransformTs, { isTsx: true, allowNamespaces: true, loose: true }]]
        });
        // `
        // ${`
        // import RefreshRuntime from "/node_modules/react-refresh/cjs/react-refresh-runtime.development.js";
        
        // let prevRefreshReg;
        // let prevRefreshSig;
        
        // if (import.meta.hot) {
        //   if (!window.__vite_plugin_react_preamble_installed__) {
        //     throw new Error(
        //       "@vitejs/plugin-react can't detect preamble. Something is wrong. " +
        //       "See https://github.com/vitejs/vite-plugin-react/pull/11#discussion_r430879201"
        //     );
        //   }
        
        //   prevRefreshReg = window.$RefreshReg$;
        //   prevRefreshSig = window.$RefreshSig$;
        //   window.$RefreshReg$ = (type, id) => {
        //     RefreshRuntime.register(type, __SOURCE__ + " " + id)
        //   };
        //   window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
        // }`}
        // ${transformed.code}
        // ${`
        // if (import.meta.hot) {
        //   window.$RefreshReg$ = prevRefreshReg;
        //   window.$RefreshSig$ = prevRefreshSig;
        
        //   import.meta.hot.accept();
        //   if (!window.__vite_plugin_react_timeout) {
        //     window.__vite_plugin_react_timeout = setTimeout(() => {
        //       window.__vite_plugin_react_timeout = 0;
        //       RefreshRuntime.performReactRefresh();
        //     }, 30);
        //   }
        // }`}
        // `
        return `
        // import RefreshRuntime from '${runtimeFilePath}'
        ${transformed.code}
        // console.dir(import.meta.hot.accept(),RefreshRuntime,  '--')
        // console.log(import.meta.hot)
        `;
      }
    }
  }
});

