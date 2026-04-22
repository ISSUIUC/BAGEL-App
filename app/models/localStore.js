import { writable } from 'svelte/store';
import localStorage from '@nativescript-use/nativescript-localstorage';

export const localStore = (key, initialValue) => {
  // Use the initialValue if not in a browser environment (SSR), or if the key doesn't exist in localStorage
  let storedValue = initialValue;
  if (localStorage.has(key)) {
    storedValue = JSON.parse(localStorage.getItem(key));
  }

  // Create a writable Svelte store
    const store = writable(storedValue);

  // Subscribe to the store's changes and update localStorage
    store.subscribe((current) => {
        // Stringify the value before saving it to localStorage
        localStorage.setItem(key, JSON.stringify(current));
    });

  return store;
};
