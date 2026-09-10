# Configuração do QA Report Generator

## Requisitos

- Node.js 20+
- Projeto Firebase com Authentication (e-mail/senha), Cloud Firestore e Storage

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha com as chaves do Firebase:

```text
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
```

## Regras de segurança

Publique as regras do repositório:

```bash
firebase deploy --only firestore:rules,storage:rules
```

## Execução

```bash
npm install
npm run dev
```

O sistema inicia em `http://localhost:5173`.
