# Payrails Integration POC

A proof-of-concept integration of the [Payrails](https://payrails.com) payment platform, demonstrating both the Drop-in and Elements SDK integration patterns in a monorepo setup. The project includes a lightweight Bun/Elysia backend that handles session initialisation and amount updates, and a React/Vite frontend that renders the checkout flow.

## Prerequisites

- **Bun** — [https://bun.sh](https://bun.sh)

## Installation

From the root of the repository:

```sh
bun install
```

## One-time setup

Before running the app for the first time, complete the following steps:

**1. Add TLS certificates**

Obtain the certificate files from Bitwarden and place them inside `apps/api/certs/`.

**2. Configure API credentials**

Open `apps/api/src/repository.ts` and replace all placeholder keys with the actual values from Bitwarden.

## Running the app

From the root of the repository:

```sh
bun run dev
```

This starts both the API and the web app concurrently.

## Caveats

This repository exists purely for demonstration purposes. It is not production-ready, there is no proper error handling, logging, or security hardening. Do not use this code as-is in a production environment.
