# kadosh-admin

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

## CI Demo Deploy (root script)

This repository includes `deploy/deploy_jni_demo_admin_web.sh` for GitHub Actions demo deploy.

Server setup (one time):

```bash
cd /home/tsi/dl/jni-inscriptions-demo/vue-inscriptions-admin
sudo install -o root -g root -m 750 deploy/deploy_jni_demo_admin_web.sh /usr/local/bin/deploy_jni_demo_admin_web.sh
echo 'tsi ALL=(root) NOPASSWD: /usr/local/bin/deploy_jni_demo_admin_web.sh' | sudo tee /etc/sudoers.d/jni-demo-admin
sudo visudo -cf /etc/sudoers.d/jni-demo-admin
sudo -n /usr/local/bin/deploy_jni_demo_admin_web.sh codexdeploy
```
