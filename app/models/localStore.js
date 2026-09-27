import { writable } from 'svelte/store';
import localStorage from '@nativescript-use/nativescript-localstorage';

/**
 * Creates a Svelte writable store whose value is persisted to disk under
 * `key`, so it survives app restarts. On creation it loads any previously
 * saved value (falling back to `initialValue` if there isn't one), and every
 * subsequent `.set()`/`.update()` on the store writes the new value back out.
 */
export const localStore = (key, initialValue) => {
  let storedValue = initialValue;
  if (localStorage.has(key)) {
    try {
      storedValue = JSON.parse(localStorage.getItem(key));
    } catch (err) {
      // Corrupted/unexpected stored value - fall back to initialValue rather
      // than crash the app at startup.
      console.error(`localStore: failed to parse stored value for "${key}", using default`, err);
    }
  }

  const store = writable(storedValue);

  // Persist every change back to disk, JSON-encoded (localStorage only stores strings).
  store.subscribe((current) => {
    localStorage.setItem(key, JSON.stringify(current));
  });

  return store;
};
