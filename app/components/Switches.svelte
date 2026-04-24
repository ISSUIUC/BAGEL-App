<script>
    import { bluetooth, peripheralUUID, switches, batteryVoltageState } from "../models/states.svelte.js";
    import StatusMessage from "./StatusMessage.svelte";


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
                <button class="btn-1" isEnabled={isArmed} text={`${customSwitch.label} On`} width="30%" on:tap={async () => {
                    await customSwitch.bleSendVal(1);
                }} />
                <button class="btn-2" isEnabled={isArmed} text={`${customSwitch.label} Off`} width="30%" on:tap={async () => {
                    await customSwitch.bleSendVal(0);
                }} />
                <StatusMessage statusChar={String.fromCharCode(customSwitch.state)} />
            </stackLayout>
        {/each}
        <button class="arm-btn" text={isArmed ? "Disarm" : "Arm"} on:tap={() => {
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
            <stackLayout orientation="horizontal" width="100%">
            <label>Battery Voltage: {Math.round($batteryVoltageState / 255 * 6.6 * 100) / 100}V</label>
            </stackLayout>

    </stackLayout>
</page>

<style>
    button.arm-btn {
        /* background: linear-gradient(90deg, #D7EBEB, #F4AFE9, #9D7EF3); */
        background-color: #31AF9C;
        color: black;
    }
    button.btn-1 {
        /* background: linear-gradient(90deg, #F0EAFC, #61CEF2, #F538B9); */
        /* background-color: #DB9B06; */
        background-color: #A6D9F7;
        color: black;
    }
    button.btn-2 {
        /* background: linear-gradient(270deg, #F0EAFC, #61CEF2, #F538B9); */
        /* background-color: #DB9B06; */
        background-color: #A6D9F7;
        color: black;
    }

    
</style>