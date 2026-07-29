# Gmail Unsubscribe Batch 1 — 2026-07-28

Method: open search → open first message → snapshot ref click Unsubscribe → confirm dialog button  
Include: marketing + mlsblast  
Exclude: Mission Fed, NSDC, First American, OpenRouter, Hilltop/client

## Results
- **Homes.com**: OK already-unsubscribed banner
- **MLS Blast**: OK You unsubscribed from realtor@mlsblast.com
- **HostGator**: OK already-unsubscribed banner
- **Apple Vacations**: OK already-unsubscribed banner
- **McDonald's**: OK already-unsubscribed banner
- **Carl's Jr**: OK already-unsubscribed banner
- **FOX One**: SKIP (no unsubscribe control in message)
- **Crypto.com**: OK You unsubscribed from stocks@news.crypto.com
- **Canva**: OK You unsubscribed from product@engage.canva.com
- **TurboTax Monthly**: FAIL dialog without confirm button
- **Upstart**: FAIL no confirm dialog after unsub click
- **The CE Shop**: OK You unsubscribed from info@theceshop.com
- **REDX Marketing**: PARTIAL confirm clicked, no success banner (ref=e505)
- **ListReports**: SKIP (GatewayClientRequestError: Error: Playwright page enumeration timed out after 3000ms
; rows=?)
- **Phil Dong Insurance**: SKIP (GatewayClientRequestError: Error: Playwright page enumeration timed out after 3000ms
; rows=?)
- **Carl DeMaio**: SKIP (GatewayClientRequestError: Error: Playwright page enumeration timed out after 3000ms
; rows=?)
- **Trustindex**: SKIP (GatewayClientRequestError: Error: Playwright page enumeration timed out after 3000ms
; rows=?)

## Summary
- success-ish: 9/17
- finished: 2026-07-29T00:38:33.940Z

