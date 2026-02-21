<script>
    import { Bluetooth } from '@nativescript-community/ble';
    const bluetooth = new Bluetooth();

    async function requestBluetoothPermissions() {
        try {
            // 1. Check if Bluetooth is even on
            console.log("things are happening")
            const enabled = await bluetooth.isBluetoothEnabled();
            if (!enabled) {
                alert("Please enable Bluetooth first!");
                return false;
            }
            console.log("Bluetooth enabled!");

            // 2. Request Location (Required for BLE scanning on Android)
            // The community version uses this method name now:
            const hasPermission = await bluetooth.requestLocationPermission();
            console.log(hasPermission)
            // 3. For Android 12+, we need to check if the OS actually granted it
            if (!hasPermission) {
                console.log("Permission denied by user.");
                return false;
            }

            return true;
        } catch (e) {
            // If requestLocationPermission still fails, it means 
            // the plugin version you have is extremely new or slightly older.
            console.error("New Permission Error:", e);
            return false;
        }
    }
    import { ObservableArray } from '@nativescript/core';
    // import Template from "svelte-native/components/Template.svelte";
    // import { Template } from "@nativescript-community/svelte-native";
    let isScanning = false;
    let devices = new ObservableArray([]);

    async function checkPermissions() {
        // Essential for Android 12+
        const hasPermission = await bluetooth.requestCoarseLocationPermission();
        return hasPermission;
    }

    async function toggleScan() {
        // 1. Ask for permission first
        const allowed = await requestBluetoothPermissions();
        if (!allowed) return;

        // 2. Proceed with scan
        isScanning = true;
        devices = []; // Clear list

        bluetooth.startScanning({
            seconds: 4,
            onDiscovered: (device) => {
                // Svelte reactive update for the {#each} block
                devices = [...devices, device]; 
                console.log("device found!")
            }
        }).then(() => {
            isScanning = false;
        });
    }

    async function connectToDevice(device) {
        console.log(`Connecting to ${device.name}...`);
        try {
            await bluetooth.connect({
                UUID: device.UUID,
                onConnected: (peripheral) => {
                    alert(`Connected to ${peripheral.name}!`);
                },
                onDisconnected: () => alert("Disconnected")
            });
        } catch (e) {
            alert("Connection failed: " + e);
        }
    }
</script>

<page>
    <actionBar title="Bluetooth Scanner" />
    <scrollView>
        <stackLayout>
            <button text="Start scan" on:tap={toggleScan} class="btn -primary" height="60" width="100%"/>
            {#each devices as device}
                <gridLayout columns="*, auto" on:tap={() => connectToDevice(device)}>
                    <stackLayout col="0">
                        <label text={device.name} />
                    </stackLayout>
                </gridLayout>
            {/each}
        </stackLayout>
    </scrollView>
</page>

<style>
    .p-10 { padding: 10; }
    .p-15 { padding: 15; }
    .m-t-10 { margin-top: 10; }
</style>