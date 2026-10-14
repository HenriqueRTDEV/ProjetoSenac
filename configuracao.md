# CONFIGURAÇÃO DO PROJETO

## PASSO 1 - Criar o FRONTEND

No terminal, navegue até a pasta onde deseja criar o projeto.

Execute:

```bash
npx create-expo-app@latest primeira-tela --template blank-typescript
```

Entre na pasta criada:

```bash
cd primeira-tela
```

## PASSO 2 - Instalar as dependências do FRONTEND

Execute dentro da pasta do frontend:

```bash
npm install nativewind react-native-reanimated react-native-safe-area-context
npm install --save-dev tailwindcss@^3.4.17 prettier-plugin-tailwindcss@^0.5.11 babel-preset-expo
```

## PASSO 3 - Configurar o Tailwind CSS

Ainda na pasta do frontend, execute:

```bash
npx tailwindcss init
```

Edite tailwind.config.js:

```bash 
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.tsx',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [],
};

```
## PASSO 4 - Criar o BACKEND

Na raiz do projeto, crie a pasta backend.

Entre nela:

```bash
cd backend
```

Inicialize o projeto Node.js:

```bash
npm init -y
```

## PASSO 5 - Instalar o Express

Dentro da pasta backend, execute:

```bash
npm install express
```

## PASSO 6 - Criar os arquivos do BACKEND

Dentro da pasta backend, crie:

- server.js
- ms.js

## PASSO 7 - Executar o BACKEND

Depois de configurar o servidor em server.js, execute:

```bash
node server.js
```

## PASSO 8 - Executar o FRONTEND

Para executar e gerar o qrcode para ver as telas, execute:

```bash
npx expo start
```
Se o celular não encontrar o projeto, confirme se ele e o computador estão na mesma rede. 
Em redes públicas ou restritas, tente:

```bash
npx expo start --tunnel
```