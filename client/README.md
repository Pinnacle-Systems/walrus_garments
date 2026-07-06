# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Local Print Agent

The Web POS integrates with a local **POS Print Agent** — a separate Windows service that runs on each counter machine and talks directly to the physical printers attached to that machine.

### Overview

- Local service URL: `http://127.0.0.1:17777`
  - `GET /health` — connection + per-role readiness check
  - `GET /version` — agent version
  - `POST /print` — submit a print job
  - `/setup` — opens the agent's own printer setup page (`window.open` target, not rendered inside Web POS)
- Client code: [`src/Utils/localPrintAgent.js`](src/Utils/localPrintAgent.js) — plain `fetch` + `AbortController`, no RTK Query, no backend auth headers (this is a different origin from the Web POS backend).
- Status polling: [`src/hooks/useLocalPrintAgentStatus.js`](src/hooks/useLocalPrintAgentStatus.js) — polls `/health` every 30s, exposes `connected`/`loading`/`error`/`health`/`retry()`.
- Instruction builders (generic, not raw ESC/POS or TSPL): [`src/printing/build-receipt-instructions.js`](src/printing/build-receipt-instructions.js), [`src/printing/build-barcode-label-instructions.js`](src/printing/build-barcode-label-instructions.js).

### Supported print roles

Web POS only knows **logical roles** — it never stores or configures physical Windows printer names:

- `receipt` (ESC/POS, thermal)
- `barcode-label` (TSPL)
- `a4-invoice` (PDF)

Printer configuration (which physical Windows printer serves which role) is owned entirely by the local print agent, opened via **Open Local Printer Setup**, which calls `openLocalPrintAgentSetup()` → `window.open('http://127.0.0.1:17777/setup')`. The Web POS does not have printer-setup screens and does not persist printer names in the user profile — `POSHeader` only *displays* `printerName` from `/health` for support visibility.

### Billing flow behavior

In `POSSession.jsx`, printing only happens **after** `addPointOfSales`/`updatePointOfSales` succeeds:

1. Invoice is saved.
2. The existing `printPayload` is built (unchanged).
3. Receipt variant is chosen from the same signal used today (`printType === "DELIVERYRECEIPT"` → summary slip, otherwise full receipt).
4. `buildReceiptInstructions(printPayload, { variant, openCashDrawer: false })` converts invoice data into generic instructions.
5. The instructions are sent to the local print agent via `printReceiptInstructions`.
6. On success, the existing success `Swal` (already shown right after save) stands as-is.
7. On failure or if the agent is unreachable, Web POS falls back to the existing browser print modal (`ReceiptViewerModal` / `PosMultiCopyPrint` / `PosDeliveryReceiptPrint`) and shows a non-blocking warning that the browser fallback was used.
8. A blocking `Swal` error is only shown if the browser fallback itself also fails to open.

A print failure **never** rolls back the saved invoice — the save has already completed by the time printing is attempted.

### Full receipt vs. summary slip

Both existing browser-print variants are preserved when routed through the local print agent:

| | Full receipt (`PosMultiCopyPrint.jsx`) | Summary slip (`PosDeliveryReceiptPrint.jsx`) |
|---|---|---|
| Used for | Paid / normal sale (`printType` unset or `RECEIPTWITHBILL`) | Unpaid / delivery-pending sale (`saleType === "UNPAID"` or `printType === "DELIVERYRECEIPT"`) |
| Content | Item rows, CGST/SGST split, discount, grand total, payment breakdown, return references, thank-you footer | `BILL SUMMARY SLIP` header, docId, QR of docId, total quantity, timestamp only |
| Copies | Defaults to **2** | Forced to **1**, regardless of `printCopies` |
| Cash drawer | Opens only if explicitly enabled (see below) | **Never** opens the cash drawer |

### Copy rules

- Full receipt: defaults to 2 copies (`printPayload.printCopies ?? 2`).
- Summary slip: always exactly 1 copy, no matter what `printCopies` says.

### Cash drawer behavior

Cash drawer opening is **disabled by default** and is **not automatic** just because cash was collected:

- No `openDrawer` instruction is included unless `options.openCashDrawer === true`.
- Even then, `openDrawer` is only included for the **full** receipt variant, and only when there is a positive cash collection (see `shouldOpenCashDrawer` in `build-receipt-instructions.js`).
- The summary slip variant never includes `openDrawer`, under any options.
- This is intentionally **not** tied to the POS user profile — some stores don't use a cash drawer at all. A future counter/local setting (or print-agent config) can turn this on; that setting is not implemented yet.

### Reprint behavior

Reprinting (the "Thermal Print" action in the POS reports screen, `PosReportsNew.jsx`) reuses the already-saved invoice record:

- Builds a print payload directly from the saved POS record — no `addPointOfSales`/`updatePointOfSales` call.
- Chooses the same full-vs-summary-slip variant logic (`bilStatus === "UNPAID"` → summary slip).
- Attempts the local print agent first, then falls back to the existing browser print modal on failure.

### Troubleshooting

| Local agent error code | Message shown to cashier/support |
|---|---|
| `ECONNREFUSED` / timeout | Local Print Agent is not running on this machine. |
| `PRINT_ROLE_NOT_CONFIGURED` | Printer is not configured for this counter. |
| `WINDOWS_PRINTER_NOT_FOUND` | Configured printer is missing in Windows. |
| `UNSUPPORTED_COMMAND_LANGUAGE` | Printer configuration does not match this print type. |
| `PRINT_QUEUE_FAILED` | Windows could not accept the print job. |
| `PDF_PRINT_TOOL_NOT_FOUND` | A4 PDF printing requires SumatraPDF.exe in the print agent folder. |

If the agent is disconnected, `POSHeader` shows **Retry** and **Open Local Printer Setup** actions. If a specific role (receipt/barcode-label/a4-invoice) isn't configured on the counter, the header calls that out per-role instead of blocking the whole POS.

**Printer setup is local to the counter machine and is not stored in the Web POS user profile.** The Web POS does not automatically send `openDrawer` — cash drawer behavior must be explicitly enabled later through a counter/local setting.

A4 invoice PDF printing (`printA4Pdf`) has a client ready in `localPrintAgent.js`, but is not yet wired to a specific A4 layout component — the existing candidates (`civillocal/components/Invoice/PrintFormat.jsx`, `Uniform/Components/SalesInvoice/SalesInvoiceReport.js`) are not POS-specific A4 sales invoice layouts, so that integration is left as a follow-up.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
