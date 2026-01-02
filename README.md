# Anansi Desktop

This is the desktop version of Anansi, packaged with Tauri.

## Prerequisites

- **Node.js**: Ensure Node.js is installed.
- **Rust**: Ensure Rust and Cargo are installed. [Install Rust](https://www.rust-lang.org/tools/install)

## Setup

1.  Open a terminal in this directory (`AnansiDesktop`).
2.  Install frontend dependencies (Tauri CLI wrapper):
    ```bash
    npm install
    ```

## Development

To run the application in development mode (with hot-reloading for Tauri config, though the UI is static files):

```bash
npm run tauri dev
```

## Building

To build the final executable (`.exe` or `.msi`):

```bash
npm run tauri build
```

The output will be located in:
`src-tauri/target/release/bundle/msi/` (or `nsis` depending on configuration).

## Project Structure

- `ui/`: Contains the Anansi web application files (HTML, JS, CSS).
- `src-tauri/`: Contains the Tauri/Rust backend configuration and source.
- `src-tauri/tauri.conf.json`: Main Tauri configuration file.
- `src-tauri/icons/`: Application icons.
