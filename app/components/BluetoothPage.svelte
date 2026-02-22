<script>
    import { Bluetooth } from '@nativescript-community/ble';
    import { Application } from "@nativescript/core";

    import StatusPage from "./StatusPage.svelte";
    import { navigate } from "@nativescript-community/svelte-native";
    async function requestAndroidPermissions() {
        if (!Application.android) return true; // Not Android, skip

        const permissions = [
            android.Manifest.permission.BLUETOOTH_SCAN,
            android.Manifest.permission.BLUETOOTH_CONNECT,
            android.Manifest.permission.ACCESS_FINE_LOCATION
        ];

        // This uses the native Android request system
        return new Promise((resolve) => {
            const activity = Application.android.foregroundActivity || Application.android.startActivity;
            androidx.core.app.ActivityCompat.requestPermissions(
                activity,
                permissions,
                123 // Random request code
            );
            // For simplicity in this step, we'll return true 
            // In a real app, you'd listen for the result callback
            resolve(true); 
        });
    }

    const bluetooth = new Bluetooth();

    async function requestBluetoothPermissions() {
        try {
            await requestAndroidPermissions();
            console.log("Checking for available permission methods...");

            // Strategy A: The most common Community API name
            if (typeof bluetooth.requestLocationPermission === "function") {
                console.log("Using requestLocationPermission...");
                return await bluetooth.requestLocationPermission();
            } 

            // Strategy B: The newer/specific API name
            if (typeof bluetooth.requestBluetoothPermissions === "function") {
                console.log("Using requestBluetoothPermissions...");
                return await bluetooth.requestBluetoothPermissions();
            }

            // Strategy C: Manually trigger the Android permission bridge
            console.log("No built-in method found. Trying manual Android request...");
            return await requestAndroidPermissions();
            
        } catch (e) {
            console.error("All permission attempts failed:", e);
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
        const hasPermission = await bluetooth.requestPermission({
            bluetoothScan: {},
            bluetoothConnect: {},
            // Include location if you need it for older devices or beacons
            location: {} 
        });
        return hasPermission;
    }

    async function toggleScan() {
        // 1. Ask for permission first
        const allowed = await requestBluetoothPermissions();
        if (!allowed) return;

        // 2. Proceed with scan
        isScanning = true;
        devices = []; // Clear list
        await bluetooth.enable();
        console.log("things")
        bluetooth.startScanning({
            seconds: 4, // Give it more time
            skipPermissionCheck: false, // Force a re-check
            onDiscovered: (device) => {
                console.log("FOUND RAW:", JSON.stringify(device));
                devices = [...devices, device];
            },
            avoidDuplicates: true
        }).then(() => {
            isScanning = false;
        }).catch((err) => {
            console.log("SCAN ERROR:", err);
        });
    }

    async function connectToDevice(device) {
        // 1. Set local loading state
        device.connecting = true;
        devices = [...devices]; // Trigger Svelte refresh

        try {
            await bluetooth.connect({
                UUID: device.UUID,
                onConnected: async (peripheral) => {
                    console.log("Link established. Settling...");
                    
                    // Give Android a moment to breathe
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    try {
                        // Test the connection by discovering services BEFORE navigating
                        await bluetooth.discoverServices({ peripheralUUID: peripheral.UUID });
                        
                        device.connected = true;
                        devices = [...devices];

                        navigate({
                            page: StatusPage,
                            props: { peripheral: {
                                UUID: device.UUID,
                                name: device.name || "Unknown Bagel"
                            } }
                        });
                    } catch (err) {
                        console.error("Connection was a ghost: ", err);
                        // Clean up if it failed
                        bluetooth.disconnect({ UUID: peripheral.UUID });
                    }
                },
                onDisconnected: (peripheral) => {
                    console.log("Disconnected from", peripheral.UUID);
                    
                    // 3. Reset state on disconnect
                    device.connected = false;
                    device.connecting = false;
                    devices = [...devices]; // Refresh UI
                }
            });
        } catch (err) {
            console.error("Connection error:", err);
            device.connecting = false;
            devices = [...devices];
        }
    }

    async function disconnectDevice(device) {
        try {
            await bluetooth.disconnect({
                UUID: device.UUID
            });
            // The 'onDisconnected' callback above will handle the UI reset
        } catch (err) {
            console.error("Disconnect failed:", err);
        }
    }

    async function discoverDeviceServices(uuid) {
        console.log("Starting Service Discovery...");
        try {
            const services = await bluetooth.discoverServices({
                peripheralUUID: uuid
            });
            console.log("Discovery complete! Found services:", services);
            // If you reach this point, the other device DEFINITELY knows you are there.
        } catch (err) {
            console.error("Discovery failed. The device might have dropped the link:", err);
        }
    }
    // This will automatically update whenever 'devices' changes
    $: sortedDevices = [...devices].sort((a, b) => {
        const nameA = a.name ? a.name.toLowerCase() : "";
        const nameB = b.name ? b.name.toLowerCase() : "";

        // 1. If one has a name and the other doesn't, put the named one first
        if (nameA && !nameB) return -1;
        if (!nameA && nameB) return 1;

        // 2. If both have names (or both don't), sort them alphabetically
        return nameA.localeCompare(nameB);
    });
</script>

<page>
    <actionBar title="Bluetooth Scanner" />
    <scrollView>
        <stackLayout class="p-20" backgroundColor="#f8f9fa">
            <button text="Start scan" on:tap={toggleScan} class="btn -primary" height="60" width="100%"/>
            {#if isScanning}
                <activityIndicator busy={true} class="m-t-10" />
                <label text="Searching for nearby Bagels..." horizontalAlignment="center" color="#7f8c8d" />
            {/if}
            <label text="Nearby Devices" class="h1 m-b-10" color="#2c3e50" fontWeight="bold" />
            
            {#each sortedDevices as device}
                <gridLayout columns="auto, *, auto" class="device-card">
                    
                    <stackLayout col="0" class="device-icon" 
                                backgroundColor={device.connected ? "#2ecc71" : "#3498db"}>
                        <label text={device.connected ? "✓" : "BLE"} verticalAlignment="middle" horizontalAlignment="center" color="white" />
                    </stackLayout>

                    <stackLayout col="1">
                        <label text={device.name || "Unknown Device"} class="device-name" />
                        {#if device.connected}
                            <label text="Active Connection" color="#2ecc71" fontSize="12" fontWeight="bold" />
                        {:else}
                            <label text={device.UUID} class="device-uuid" />
                        {/if}
                    </stackLayout>

                    <stackLayout col="2" verticalAlignment="middle">
                        {#if device.connecting}
                            <activityIndicator busy={true} width="20" height="20" />
                        {:else if device.connected}
                            <button text="DISCONNECT" class="disconnect-btn" on:tap={() => disconnectDevice(device)} />
                        {:else}
                            <button text="CONNECT" class="connect-btn" on:tap={() => connectToDevice(device)} />
                        {/if}
                    </stackLayout>
                    
                </gridLayout>
            {/each}
            
        </stackLayout>
    </scrollView>
</page>

<style>
    .device-card {
        background-color: white;
        border-radius: 12;
        margin-bottom: 12;
        padding: 15;
        /* Simple shadow for Android */
        elevation: 3;
    }

    .device-icon {
        width: 40;
        height: 40;
        background-color: #3498db;
        border-radius: 20;
        margin-right: 15;
    }

    .device-name {
        font-size: 18;
        font-weight: 700;
        color: #2c3e50;
    }

    .device-uuid {
        font-size: 12;
        color: #7f8c8d;
    }

    .connect-btn {
        background-color: transparent;
        color: #3498db;
        font-weight: bold;
        border-width: 0;
        padding: 0;
        margin: 0;
        min-width: 80;
    }

    .h1 {
        font-size: 24;
    }

    .m-b-10 {
        margin-bottom: 10;
    }

    .disconnect-btn {
        color: #e74c3c;
        font-weight: bold;
        background-color: transparent;
        border-width: 0;
    }
    
    /* Animation for the 'Connecting' state */
    .device-card {
        transition: background-color 0.2s;
    }
</style>