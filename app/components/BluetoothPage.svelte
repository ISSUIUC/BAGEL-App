<script>
    import { switches, startVoltageNotifications } from "../models/states.svelte.js";
    import {
        requestBluetoothPermissions,
        enableBluetooth,
        startScanning,
        connectToPeripheral,
        disconnectFromPeripheral
    } from "~/services/bleService";
    // StatusPage import kept for the commented-out navigate() call below (its
    // `peripheral` prop is currently never supplied via any other route).
    import StatusPage from "./StatusPage.svelte";
    import { navigate, goBack } from "@nativescript-community/svelte-native";
    import { ObservableArray } from '@nativescript/core';
    import Switches from "./Switches.svelte";
    let isScanning = false;
    let devices = new ObservableArray([]);

    // Subscribes to every switch's BLE notify characteristic once connected,
    // so hardware-side state changes flow back into the UI (see Switch.setupNotifications).
    async function setupNotifications() {
        for (let switch_ of $switches) {
            await switch_.setupNotifications();
        }
    }

    async function toggleScan() {
        const allowed = await requestBluetoothPermissions();
        if (!allowed) return;

        isScanning = true;
        devices = []; // Clear list
        await enableBluetooth();
        await startScanning({
            seconds: 4,
            onDiscovered: (device) => {
                devices = [...devices, device];
            }
        }).then(() => {
            isScanning = false;
        }).catch((err) => {
            // Must also clear isScanning here, or the "Searching..." spinner
            // stays on screen forever after a failed scan.
            isScanning = false;
            console.log("SCAN ERROR:", err);
        });
    }

    async function connectToDevice(device) {
        device.connecting = true;
        devices = [...devices]; // Trigger Svelte refresh

        try {
            // connectToPeripheral only resolves once discoverServices has
            // succeeded against the device, and updates connectedPeripheralUUID itself.
            await connectToPeripheral(device.UUID, {
                onDisconnected: (peripheral) => {
                    console.log("Disconnected from", peripheral.UUID);
                    device.connected = false;
                    device.connecting = false;
                    devices = [...devices]; // Refresh UI
                }
            });

            device.connected = true;
            devices = [...devices];
            await startVoltageNotifications();
            console.log("Voltage notifications set up.");
            await setupNotifications();

            // navigate({
            //     page: StatusPage,
            //     props: {
            //         peripheral: peripheral
            //     }
            // })

            navigate({
                page: Switches
            });
        } catch (err) {
            console.error("Connection error:", err);
            // Reset the device card's spinner state, or it stays stuck showing "connecting".
            device.connecting = false;
            devices = [...devices];
        }
    }

    async function disconnectDevice(device) {
        try {
            await disconnectFromPeripheral(device.UUID);
            // The 'onDisconnected' callback above will handle the UI reset
        } catch (err) {
            console.error("Disconnect failed:", err);
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
    }).filter(val => {
        // Only show BAGEL devices. Guard against a missing name - RegExp.test
        // would otherwise coerce `undefined` to the string "undefined".
        return !!val.name && /^BAGEL/.test(val.name);
    });
</script>

<page>
    <actionBar title="Bluetooth Scanner">
        <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={goBack} />
    </actionBar>
    <scrollView>
        <stackLayout class="p-20" backgroundColor="#f8f9fa">
            <label text="Scan for and connect to your BAGEL device"
                   class="body m-b-10" color="#7f8c8d" textWrap="true" />
            <button text="Start scan" on:tap={toggleScan} class="btn -primary" height="60" width="100%"/>
            {#if isScanning}
                <activityIndicator busy={true} class="m-t-10" />
                <label text="Searching for nearby Bagels..." horizontalAlignment="center" color="#7f8c8d" />
            {/if}
            <label text="Nearby Devices" class="h1 m-b-10" color="#2c3e50" fontWeight="bold" />

            {#if !isScanning && sortedDevices.length === 0}
                <stackLayout class="card">
                    <label text="No BAGEL devices found yet." class="body text-center" />
                    <label text="Tap &quot;Start scan&quot; above to search nearby." class="caption text-center m-t-5" />
                </stackLayout>
            {/if}

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
