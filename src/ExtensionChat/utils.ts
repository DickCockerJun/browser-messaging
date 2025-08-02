import type { Browser } from 'webextension-polyfill';

declare const browser: Browser | undefined;
declare const chrome:  Browser | undefined;

/**
 * @returns chrome/browser.runtime
 * @throws {Error} browser.runtime and chrome.runtime are undefined
 */
export function getBrowserApi(): Browser {
  if (typeof browser === 'object' && browser.runtime !== undefined) return browser;
  if (typeof chrome  === 'object' && chrome.runtime  !== undefined) return chrome;
  
  throw new Error('browser and chrome are undefined');
};

export function deleteFromArray(array: Array<unknown>, item: unknown): void {
  const i = array.indexOf(item);
  if (i === -1) return;
  array[i] = undefined;
};
