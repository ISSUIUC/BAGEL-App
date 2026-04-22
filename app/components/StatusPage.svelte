<script>
    import { bluetooth, switches } from "../models/states.svelte.js";
    import { goBack } from "@nativescript-community/svelte-native";
    import { get } from "svelte/store";
    import Switch from '~/models/Switch';
    export let peripheral; // Passed from the previous page
    
    let services = [];
    let isLoading = true;

    const switchInitData = [
        {
            label: "Disconnected",
            state: false,
            enabled: false,
            switchNum: 1,
            serviceUuid: "72737810-8272-9812-9898-98bcdef98198",
            charUuid: "1ab83456-7653-7384-2737-484838483848"
        },
        {
            label: "Blue Raven",
            state: false,
            enabled: true,
            switchNum: 2,
            serviceUuid: "72737810-8272-9812-9898-98bcdef98198",
            charUuid: "637777ab-c738-7de7-2898-273738838838"
        },
        {
            label: "CAM",
            state: true,
            enabled: true,
            switchNum: 3,
            serviceUuid: "72737810-8272-9812-9898-98bcdef98198",
            charUuid: "72671834-8282-0308-2383-838bcde29092"
        },
        {
            label: "TeleMega Pyro",
            state: false,
            enabled: true,
            switchNum: 4,
            serviceUuid: "73737373-7371-9192-1095-09128927266b",
            charUuid: "987187ab-d937-fe72-8374-020927167827"
        },
        {
            label: "TeleMega Power",
            state: false,
            enabled: true,
            switchNum: 5,
            serviceUuid: "73737373-7371-9192-1095-09128927266b",
            charUuid: "67374498-9248-9249-8249-834893483bcd"
        },
        {
            label: "MIDAS",
            state: true,
            enabled: true,
            switchNum: 6,
            serviceUuid: "73737373-7371-9192-1095-09128927266b",
            charUuid: "97198188-9289-2bcd-98f9-8e9898e71231"
        },
    ];
    let togglingSwitchModel = switchInitData[2];
    let togglingSwitch = new Switch(togglingSwitchModel.label, togglingSwitchModel.state, togglingSwitchModel.enabled, togglingSwitchModel.switchNum, togglingSwitchModel.serviceUuid, togglingSwitchModel.charUuid);

    /**
     * Writes a single byte to a specific BLE characteristic
     * @param {string} peripheralUUID - The ID of the device
     * @param {string} serviceUUID - The ID of the service
     * @param {string} characteristicUUID - The ID of the characteristic
     * @param {number} byteValue - The byte to send (0-255)
     */
    async function writeByteToCharacteristic(peripheralUUID, serviceUUID, characteristicUUID, byteValue) {
        try {
            console.log(`Sending byte ${byteValue} to ${characteristicUUID}...`);

            // 1. Convert the number into a 1-byte Uint8Array
            const data = new Uint8Array([byteValue]);
            const value = Array.from(data);
            // 2. Perform the write operation
            await get(bluetooth).write({
                peripheralUUID: peripheralUUID,
                serviceUUID: serviceUUID,
                characteristicUUID: characteristicUUID,
                value: value // We pass the underlying ArrayBuffer
            });

            console.log(`Write for ${characteristicUUID} successful!`);
            return true;
        } catch (err) {
            console.error("Write failed:", err);
            // Common error: 'Characteristic does not support write'
            return false;
        }
    }

    async function discoverAll() {
        isLoading = true;
        // try {
            // 1. Connection Safety Check
            let connected = await get(bluetooth).isConnected({ UUID: peripheral.UUID });

            if (!connected) {
                console.log("Device not ready. Attempting a quick reconnect...");
                await get(bluetooth).connect({ 
                    UUID: peripheral.UUID,
                    autoConnect: false 
                });
                await new Promise(r => setTimeout(r, 1000));
            }

            console.log("Starting full discovery for", peripheral.UUID);
            
            // 2. Perform the full tree discovery
            const result = await get(bluetooth).discoverAll({
                peripheralUUID: peripheral.UUID
            });

            // 3. Mapping Logic: Digging into Services and Characteristics
            const mappedServices = await Promise.all(result.services.map(async (service) => {
                const characteristics = await Promise.all(service.characteristics.map(async (char) => {
                    let value = "N/A";
                    
                    // Only try to read if the hardware says it's allowed
                    if (char.properties.read) {
                        try {
                            const readResult = await get(bluetooth).read({
                                peripheralUUID: peripheral.UUID,
                                serviceUUID: service.UUID,
                                characteristicUUID: char.UUID
                            });
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
        //     // Hardcode one of your known Switch UUIDs to see if it works
        //     // debugWriteTest();
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
    async function debugWriteTest() {
        console.log("1. Entering debugWriteTest");
        
        try {
            // Hardcode these directly here just to be 100% sure
            const testService = "72737810-8272-9812-9898-98bcdef98198";
            const testChar = "72671834-8282-0308-2383-838bcde29092";

            console.log("2. Defining Buffer...");
            const uint8 = new Uint8Array([0]);
            const value = Array.from(uint8); // Convert to a standard JS array
            // const buffer = uint8.buffer;
            
            // console.log("3. Buffer Length is:", buffer.byteLength);
            // console.log("Enabling Notifications to 'prime' the MCU...");
            // await get(bluetooth).startNotifying({
            //     peripheralUUID: peripheral.UUID,
            //     serviceUUID: testService,
            //     characteristicUUID: testChar,
            //     onNotify: (res) => console.log("MCU sent data back!", JSON.stringify(res.value))
            // });

            // Wait a split second for the handshake to settle
            await new Promise(r => setTimeout(r, 500));

            console.log("Now trying the write...");
            console.log("4. Starting 1s timeout for write...");
            try {
                console.log("5. Inside timeout, calling write...");
                await get(bluetooth).write({
                    peripheralUUID: peripheral.UUID,
                    serviceUUID: testService,
                    characteristicUUID: testChar,
                    value: value
                });
                console.log("6. WRITE SUCCESSFUL!");
            } catch (writeErr) {
                console.error("6. WRITE FAILED:", writeErr);
            }

        } catch (fatalErr) {
            console.error("FATAL ERROR BEFORE WRITE:", fatalErr);
        }
    }

    // Start discovery on mount
    discoverAll();
</script>

<page>
    <actionBar title="Device Status">
        <navigationButton text="Back" on:tap={goBack} />
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
                
                    <button 
                        text="Toggle CAM"
                        class="btn -primary"
                        on:tap={async () => {
                            const actualSwitch = get(switches).filter(obj => obj.label == "CAM")[0];
                            await actualSwitch.toggle(bluetooth, peripheral.UUID);
                        }}
                    />
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