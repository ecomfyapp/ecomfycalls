# EcomfyCalls Desktop

Electron companion for Windows. It loads the existing production web app while
keeping its renderer alive in the system tray, allowing JsSIP to remain
registered when the main window is hidden.

## Development

```powershell
cd desktop
$env:ECOMFY_APP_URL="http://localhost:3000/dashboard"
npm run dev
```

Without `ECOMFY_APP_URL`, the client loads
`https://www.ecomfycalls.com/dashboard`.

## Windows installer

```powershell
npm run dist:windows
```

The NSIS installer is written to `desktop/dist`.

## Microsoft Store

Reserve the application identity in Microsoft Partner Center first. Then add
the identity and publisher values supplied by Partner Center to the `appx`
section in `package.json` before running:

```powershell
npm run dist:store
```

Microsoft Store identity values cannot be invented locally; they must match the
reserved product exactly.

## Runtime behavior

- Closing the main window hides it to the system tray.
- Selecting **Salir** from the tray fully terminates the softphone.
- The renderer uses `backgroundThrottling: false`.
- Incoming JsSIP calls create an always-on-top desktop window.
- Packaged builds start with Windows in hidden mode.
