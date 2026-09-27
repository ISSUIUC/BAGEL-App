import { writable, get } from "svelte/store";
import { Bluetooth } from "@nativescript-community/ble";
import { Application } from "@nativescript/core";

/**
 * Owns the single Bluetooth plugin instance and the one active peripheral
 * connection for this app. Nothing outside this file should import
 * @nativescript-community/ble directly - models and screens call the
 * functions below instead, so permission handling, connect/reconnect, and
 * the value-encoding used for writes only exist in one place.
 *
 * This app connects to exactly one BAGEL device at a time (see BluetoothPage),
 * hence a single `connectedPeripheralUUID` rather than a connection registry.
 */
const bt = new Bluetooth();

/** UUID of the currently connected peripheral, or `false` when disconnected. */
export const connectedPeripheralUUID = writable(false);

export function isConnectedToSomething() {
    return !!get(connectedPeripheralUUID);
}

/**
 * Requests the Android runtime BLE permissions and waits for the actual user
 * response (not just for the dialog to be shown), falling back through the
 * BLE plugin's own permission-request methods first since their exact name
 * differs across versions of the community plugin.
 */
export async function requestBluetoothPermissions() {
    try {
        await requestAndroidPermissions();

        if (typeof bt.requestLocationPermission === "function") {
            return await bt.requestLocationPermission();
        }
        if (typeof bt.requestBluetoothPermissions === "function") {
            return await bt.requestBluetoothPermissions();
        }
        return await requestAndroidPermissions();
    } catch (e) {
        console.error("All permission attempts failed:", e);
        return false;
    }
}

async function requestAndroidPermissions() {
    if (!Application.android) return true; // Not Android, skip

    const permissions = [
        android.Manifest.permission.BLUETOOTH_SCAN,
        android.Manifest.permission.BLUETOOTH_CONNECT,
        android.Manifest.permission.ACCESS_FINE_LOCATION
    ];
    const requestCode = 123;

    return new Promise((resolve) => {
        const activity = Application.android.foregroundActivity || Application.android.startActivity;

        function onPermissionResult(args) {
            if (args.requestCode !== requestCode) return;
            Application.android.off(Application.android.activityRequestPermissionsEvent, onPermissionResult);
            const allGranted = args.grantResults.length > 0 &&
                args.grantResults.every(result => result === android.content.pm.PackageManager.PERMISSION_GRANTED);
            resolve(allGranted);
        }

        Application.android.on(Application.android.activityRequestPermissionsEvent, onPermissionResult);
        androidx.core.app.ActivityCompat.requestPermissions(activity, permissions, requestCode);
    });
}

export async function enableBluetooth() {
    await bt.enable();
}

export async function startScanning({ seconds = 4, onDiscovered } = {}) {
    await bt.startScanning({
        seconds,
        filters: {},
        skipPermissionCheck: false,
        onDiscovered,
        avoidDuplicates: true
    });
}

/**
 * Connects to a peripheral and only resolves once discoverServices has
 * succeeded against it (a connection that can't be queried isn't considered
 * usable). Updates connectedPeripheralUUID as the link comes up/down.
 */
export function connectToPeripheral(uuid, { onDisconnected } = {}) {
    return new Promise((resolve, reject) => {
        bt.connect({
            UUID: uuid,
            onConnected: async (peripheral) => {
                await new Promise(r => setTimeout(r, 1000)); // give Android a moment to settle
                try {
                    await bt.discoverServices({ peripheralUUID: peripheral.UUID });
                    connectedPeripheralUUID.set(peripheral.UUID);
                    resolve(peripheral);
                } catch (err) {
                    connectedPeripheralUUID.set(false);
                    await bt.disconnect({ UUID: peripheral.UUID }).catch(() => {});
                    reject(err);
                }
            },
            onDisconnected: (peripheral) => {
                connectedPeripheralUUID.set(false);
                if (onDisconnected) onDisconnected(peripheral);
            }
        }).catch(reject);
    });
}

/** Disconnects the given peripheral, or the currently connected one if no UUID is given. */
export async function disconnectFromPeripheral(uuid) {
    const target = uuid || get(connectedPeripheralUUID);
    if (!target) return;
    await bt.disconnect({ UUID: target });
}

export async function isPeripheralConnected(uuid) {
    return await bt.isConnected({ UUID: uuid });
}

/**
 * Writes a single byte to a characteristic on the currently connected
 * peripheral, reconnecting first if the link has dropped. This reconnect-then-write
 * dance used to be reimplemented separately in several places; it now lives
 * only here.
 */
export async function writeByte(serviceUUID, characteristicUUID, byteValue) {
    const uuid = get(connectedPeripheralUUID);
    if (!uuid) {
        console.error("writeByte: no peripheral connected");
        return false;
    }

    try {
        const connected = await bt.isConnected({ UUID: uuid });
        if (!connected) {
            console.log("Link lost. Re-establishing connection...");
            await bt.connect({ UUID: uuid, autoConnect: false });
            await new Promise(r => setTimeout(r, 500));
        }

        const value = Array.from(new Uint8Array([byteValue]));
        await bt.write({ peripheralUUID: uuid, serviceUUID, characteristicUUID, value });
        return true;
    } catch (err) {
        console.error("Write failed:", err);
        return false;
    }
}

/**
 * Subscribes to notifications for a characteristic on the currently connected
 * peripheral. `onNotify` receives just the first byte of the reported value,
 * since every characteristic this app reads is a single status byte.
 */
export async function subscribeToByteNotifications(serviceUUID, characteristicUUID, onNotify) {
    const uuid = get(connectedPeripheralUUID);
    if (!uuid) {
        console.error("subscribeToByteNotifications: no peripheral connected");
        return;
    }

    await bt.startNotifying({
        peripheralUUID: uuid,
        serviceUUID,
        characteristicUUID,
        onNotify: (result) => {
            const byte = new Uint8Array(result.value)[0];
            onNotify(byte);
        }
    });
}

/** Full service/characteristic tree discovery - used by StatusPage's debug audit view. */
export async function discoverAllServices(uuid) {
    return await bt.discoverAll({ peripheralUUID: uuid });
}

export async function readCharacteristic(uuid, serviceUUID, characteristicUUID) {
    return await bt.read({ peripheralUUID: uuid, serviceUUID, characteristicUUID });
}
