// Types for `tsc -p jsconfig.json` (type check only; nothing here ships).
// Data files that set window globals, Cloudflare Turnstile, and the script's expando properties.
interface Window {
  COMPENDIUM: any;
  COMPENDIUM_ROSARY: any;
  SAINT_NAMES: Record<string, any>;
  turnstile?: { reset(widget?: string): void };
}
interface HTMLElement { _avSrc?: Element; }
// Every event handler in script.js listens on elements, so a target is always an Element.
// closest() returns any because callers read element-specific properties such as href and target.
interface EventTarget { closest(selectors: string): any; parentNode?: any; }
declare module 'cloudflare:email' { export class EmailMessage { constructor(from: string, to: string, raw: string); } }
