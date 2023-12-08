
import { CLIENT_DIR } from 'vite';
import pluginTransformTs from '@babel/plugin-transform-typescript';
import { transformSync } from '@babel/core';
import presetReact from '@babel/preset-react';
import babelPresetTypescriptReact from "@babel/preset-typescript";

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
        // import RefreshRuntime from "/@react-refresh";
        
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
        return `${transformed.code}
        console.log(import.meta.hot)
        `;
      }
    }
  }
});

