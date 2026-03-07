<script>
    import { bluetooth, peripheralUUID, switches } from "../models/states.svelte.js";
    import CustomToggle from './CustomToggle.svelte';
    import StatusMessage from "./StatusMessage.svelte";
    import { get } from "svelte/store";


    import { prompt } from '@nativescript/core/ui/dialogs';

    


    let isArmed = false;
    // 1. Initialize Bluetooth

    // Assuming you have the connected peripheral UUID available globally or via props


    // Ensure our local 'switches' objects keep their UUID metadata


    // 2. The Logic to send 0x01 or 0x00
    async function handleToggle(customSwitch) {
        customSwitch.toggle();
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
        {#each ($switches).sort((a, b) => a.switchNum - b.switchNum) as customSwitch (customSwitch.switchNum)}
            <!-- <CustomToggle 
                switchModel={customSwitch}
                on:toggle={() => handleToggle(customSwitch)}
            /> -->
            <stackLayout orientation="horizontal" width="100%">
                <button isEnabled={isArmed} text={`${customSwitch.label} On`} width="30%" on:tap={async () => {
                    await customSwitch.bleSendVal(1);
                }} />
                <button isEnabled={isArmed} text={`${customSwitch.label} Off`} width="30%" on:tap={async () => {
                    await customSwitch.bleSendVal(0);
                }} />
                <StatusMessage statusChar={String.fromCharCode(customSwitch.state)} />
            </stackLayout>
        {/each}
        <button text={isArmed ? "Disarm" : "Arm"} on:tap={() => {
            if (isArmed) {
                isArmed = false;
                return;
            }
            prompt({
                title: "Confirm Arming",
                message: "Enter the phrase \"Bagel123\" to arm the BAGEL",
                inputType: "text",
                okButtonText: "Arm",
                cancelButtonText: "Cancel",
                cancelable: true
            }).then((result) => {
                if (result.result && result.text == "Bagel123") {
                    isArmed = true;
                }
            });
        }} />
    </stackLayout>
</page>