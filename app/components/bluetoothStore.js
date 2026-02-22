import { writable } from 'svelte/store';
import { Bluetooth } from '@nativescript-community/ble';

const bluetooth = new Bluetooth();

// The store holds the current state of our connection
export const bleStore = writable({
    isConnected: false,
    peripheral: null,
    isScanning: false
});

export const bluetoothService = {
    // Reference to the actual plugin instance
    instance: bluetooth,

    async connect(device) {
        try {
            await bluetooth.connect({
                UUID: device.UUID,
                onConnected: (peripheral) => {
                    console.log("Store: Connected to", peripheral.UUID);
                    bleStore.update(s => ({ ...s, isConnected: true, peripheral }));
                },
                onDisconnected: (peripheral) => {
                    console.log("Store: Disconnected");
                    bleStore.update(s => ({ ...s, isConnected: false, peripheral: null }));
                }
            });
            return true;
        } catch (err) {
            console.error("Store Connection Error:", err);
            return false;
        }
    },

    async disconnect() {
        bleStore.subscribe(async (state) => {
            if (state.peripheral) {
                await bluetooth.disconnect({ UUID: state.peripheral.UUID });
            }
        })();
    },

    async write(serviceUUID, charUUID, byteValue) {
        return new Promise((resolve, reject) => {
            bleStore.subscribe(async (state) => {
                if (!state.isConnected || !state.peripheral) {
                    reject("Not connected");
                    return;
                }

                try {
                    await bluetooth.write({
                        peripheralUUID: state.peripheral.UUID,
                        serviceUUID: serviceUUID,
                        characteristicUUID: charUUID,
                        value: new Uint8Array([byteValue]).buffer
                    });
                    resolve(true);
                } catch (e) {
                    reject(e);
                }
            })(); // Immediate execution to get current value
        });
    }
};