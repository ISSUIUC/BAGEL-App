<script>
    import { Bluetooth } from '@nativescript-community/ble';
    
    import CustomToggle from './CustomToggle.svelte';
    import Switch from "../models/Switch";

    // 1. Initialize Bluetooth
    const bluetooth = new Bluetooth();

    // Assuming you have the connected peripheral UUID available globally or via props
    export let peripheralUuid; 

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
            state: false,
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

    // Ensure our local 'switches' objects keep their UUID metadata
    let switches = switchInitData.map(data => {
        let s = new Switch(data.label, data.state, data.enabled, data.switchNum, data.serviceUuid, data.charUuid);
        // Attach UUIDs to the model instance for easy access in handleToggle
        return s;
    });

    $: reactiveSwitches = switches;

    // 2. The Logic to send 0x01 or 0x00
    async function handleToggle(customSwitch) {
        const valueToSend = customSwitch.state ? 0x01 : 0x00;
        
        try {
            // 1. Check if we are still connected
            let isConnected = await bluetooth.isConnected({ UUID: peripheralUuid });

            if (!isConnected) {
                console.log("Link lost. Re-establishing connection...");
                await bluetooth.connect({ 
                    UUID: peripheralUuid,
                    autoConnect: false 
                });
                // Give the Android stack a moment to stabilize
                await new Promise(r => setTimeout(r, 500));
            }

            // 2. Perform the write
            await bluetooth.write({
                peripheralUUID: peripheralUuid,
                serviceUUID: customSwitch.serviceUuid,
                characteristicUUID: customSwitch.charUuid,
                value: new Uint8Array([valueToSend]).buffer
            });

            console.log(`Successfully sent ${valueToSend} to ${customSwitch.label}`);
        } catch (err) {
            console.error("Failed to write to BLE device:", err);
            
            // 3. UI Rollback (Crucial!)
            // If the hardware didn't get the message, flip the switch back
            customSwitch.state = !customSwitch.state;
            switches = [...switches]; 
            
            alert("Action failed: Device unreachable.");
        }
    }
</script>

<page>
    <actionBar title="Switches" />
    <stackLayout>
        {#each reactiveSwitches as customSwitch (customSwitch.switchNum)}
            <CustomToggle 
                switchModel={customSwitch}
                on:toggle={() => handleToggle(customSwitch)}
            />
        {/each}
    </stackLayout>
</page>