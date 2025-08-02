### About

## TypeScript module for messaging between your modules.

Supports Manifest v2 and v3.
Supports chrome and browser API.

Success tests:
- Mozilla Firefox (141.0         );
- Google Chrome   (138.0.7204.183);
- Microsoft Edge  (138.0.3351.121);
- Яндекс Браузер  ( 25.6.1.1039  );
- Opera One       (120.0.5543.128)

## Provides

See [examples](./test/src/).

# 1. WindowChat (based on window)
For messaging inside tab (for example: content-scripts in isolated and main worlds).

# 2. ExtensionChat (based on runtime.Port)
For messaging inside your extension.


### For developers of this module

# Roadmap:
1. [-] setup project:
  - [-] TS;
  - [-] linter (Biome);
  - [-] structure.
2. [-] WindowChat;
3. [-] ExtensionChat;
4. [-] add utils (for export):
  - [-] handleMessage (call function on message if it is).

# How to build:
```bash
npm run build
```

# How to test:
1. build test-extension:
  with manifest-v3:
  ```bash
  npm --prefix ./test run build
  ```
  with manifest v2:
  ```bash
  npm --prefix ./test run build-m2
  ```
2. load it in your browser (./test/build).
