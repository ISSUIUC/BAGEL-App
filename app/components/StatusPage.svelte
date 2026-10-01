<script>
    // Debug/audit tool: walks a connected device's full BLE service/characteristic
    // tree and displays it. This is how the hardcoded UUIDs in
    // states.svelte.js's switchInitData were originally captured.
    //
    // NOTE: currently unreachable - the navigate() calls that would open this
    // page (in BluetoothPage.svelte / Home.svelte) are commented out, so
    // `peripheral` is never actually supplied by anything right now.
    import { goBack } from "@nativescript-community/svelte-native";
    import {
        isPeripheralConnected,
        connectToPeripheral,
        discoverAllServices,
        readCharacteristic
    } from "~/services/bleService";
    export let peripheral; // Passed from the previous page

    let services = [];
    let isLoading = true;

    async function discoverAll() {
        isLoading = true;
        // try {
            // 1. Connection Safety Check
            let connected = await isPeripheralConnected(peripheral.UUID);

            if (!connected) {
                console.log("Device not ready. Attempting a quick reconnect...");
                await connectToPeripheral(peripheral.UUID);
            }

            console.log("Starting full discovery for", peripheral.UUID);

            // 2. Perform the full tree discovery
            const result = await discoverAllServices(peripheral.UUID);

            // 3. Mapping Logic: Digging into Services and Characteristics
            const mappedServices = await Promise.all(result.services.map(async (service) => {
                const characteristics = await Promise.all(service.characteristics.map(async (char) => {
                    let value = "N/A";

                    // Only try to read if the hardware says it's allowed
                    if (char.properties.read) {
                        try {
                            const readResult = await readCharacteristic(peripheral.UUID, service.UUID, char.UUID);
                            console.log("ServiceUUID: ", service.UUID);
                            console.log("CharUUID: ", char.UUID);
                            // Convert the raw ArrayBuffer to a string or hex
                            value = decodeValue(readResult.value);
                        } catch (e) {
                            value = "[Read Error]";
                        }
                    } else if (char.properties.notify || char.properties.indicate) {
                        value = "[Notify Only]";
                    } else if (char.properties.write) {
                        value = "[Write Only]";
                    }

                    return { 
                        ...char, 
                        displayValue: value 
                    };
                }));

                return { 
                    ...service, 
                    characteristics 
                };
            }));

            // Update the Svelte state
            services = mappedServices;
            console.log("Discovery and mapping complete!");
            // for (let service of services) {
            //     for (let characteristic of service.characteristics) { 
            //         // 1. Only write if the characteristic ALLOWS writing
            //         if (characteristic.properties.write || characteristic.properties.writeWithoutResponse) {
                        
            //             console.log(`Testing Write on: ${characteristic.UUID}`);
                        
            //             // 2. Use await so we don't overwhelm the radio
            //             await writeByteToCharacteristic(peripheral.UUID, service.UUID, characteristic.UUID, 1);
                        
            //             // 3. A tiny 100ms "breather" for the hardware
            //             await new Promise(resolve => setTimeout(resolve, 1000));
            //         } else {
            //             console.log(`Skipping ${characteristic.UUID} - Read Only`);
            //         }
            //     }
            // }
        // } catch (err) {
        //     console.error("Audit failed finally:", err);
        // } finally {
        //     isLoading = false;
        //     console.log("theoretically found things?");
        // }
    }

    /**
     * Helper: Converts ArrayBuffer/DataView to something we can actually read
     */
    function decodeValue(buffer) {
        if (!buffer) return "Empty";
        try {
            const uint8 = new Uint8Array(buffer);
            // Try to decode as a UTF-8 string
            const str = String.fromCharCode.apply(null, uint8);
            
            // If it contains non-printable characters, show it as Hex instead
            if (/[^\x20-\x7E]/.test(str)) {
                return "0x" + Array.from(uint8)
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join(' ');
            }
            return str;
        } catch (e) {
            return "Binary Data";
        }
    }
    // Start discovery on mount
    discoverAll();
</script>

<page>
    <actionBar title="Device Status">
        <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={goBack} />
    </actionBar>

    <gridLayout rows="*, auto">
        {#if isLoading}
            <stackLayout row="0" verticalAlignment="center">
                <activityIndicator busy={true} />
                <label text="Auditing Services..." horizontalAlignment="center" />
            </stackLayout>
        {:else}
            <scrollView row="0">
                <stackLayout class="p-15">
                
                    <label text={peripheral.name || "Device Detail"} class="h2 m-b-10" />
                    <label text="UUID: {peripheral.UUID}" class="body m-b-20" color="gray" />

                    {#each services as service}
                        <stackLayout class="service-container">
                            <label text="Service: {service.UUID}" class="service-header" />
                            
                            {#each service.characteristics as char}
                                <stackLayout class="char-container">
                                    <label text="Char: {char.UUID}" fontWeight="bold" />
                                    <label text="Value: {char.displayValue}" color="#3498db" />
                                    <label text="Properties: {Object.keys(char.properties).filter(p => char.properties[p]).join(', ')}" 
                                           fontSize="10" color="#95a5a6" />
                                </stackLayout>
                            {/each}
                        </stackLayout>
                    {/each}
                </stackLayout>
            </scrollView>
        {/if}
        
        <button row="1" text="Refresh" on:tap={discoverAll} class="btn -primary" />
    </gridLayout>
</page>

<style>
    .service-container {
        margin-bottom: 20;
        border-width: 1;
        border-color: #ddd;
        border-radius: 8;
        padding: 10;
        background-color: #f9f9f9;
    }
    .service-header {
        font-size: 14;
        font-weight: bold;
        color: #2c3e50;
        margin-bottom: 10;
    }
    .char-container {
        padding: 8;
        border-top-width: 1;
        border-color: #eee;
    }
</style>