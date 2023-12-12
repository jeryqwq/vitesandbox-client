import { CLIENT_ENTRY, CLIENT_DIR, ENV_ENTRY } from 'vite';
import vite_client from './client.js?raw';
import vite_client_env from 'vite/dist/client/env.mjs?raw';
import { dependencyNameRE, depBaseUrl, genPkgJson } from '$utils';

const viteClientPlugin = ({tree}) => ({
  name: 'vite:browser:hmr',
  enforce: 'pre',
  resolveId(id, _, { ssr }) {
    if (id.startsWith(CLIENT_DIR)) {
      return {
        id: /\.mjs$/.test(id) ? id : `${id}.mjs`,
        external: true
      };
    }
    if (/dist\/__require\.js$/.test(id)) {
      return '/dist/__require.js';
    }
    const dependencyInfos = dependencyNameRE.exec(id.replace('http://localhost:9000/', ''));
    if (dependencyInfos) {
      if (ssr) {
        return {
          id,
          external: true
        };
      }
      const [, dependencyName, , pathname] = dependencyInfos;
      const { pkgJson, parseError } = genPkgJson(tree);
      if (!parseError) {
        const { dependencies } = pkgJson;
        if (!dependencies[dependencyName]) {
          throw new Error(`${dependencyName} not implicited in package.json`);
        }
        return {
          id: `${depBaseUrl}/${dependencyName}@${dependencies[dependencyName]}${pathname || '' }`,
          external: true
        };
      }
    }
  },
  load(id) {
    if (id === CLIENT_ENTRY) {
      return vite_client;
    }
    if (id === ENV_ENTRY) {
      return vite_client_env;
    }
  }
});

export default viteClientPlugin;
