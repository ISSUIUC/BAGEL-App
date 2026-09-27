/*
In NativeScript, the app.ts file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first page.
*/

import { svelteNativeNoFrame } from '@nativescript-community/svelte-native'
import App from './App.svelte'

// Boots the native runtime and mounts App.svelte as the root view. "NoFrame"
// because App.svelte supplies its own <frame> for navigation.
svelteNativeNoFrame(App, {})
