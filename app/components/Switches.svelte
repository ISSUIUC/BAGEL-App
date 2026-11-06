<script>
    import { bluetooth, peripheralUUID, switches, batteryVoltageState, disconnect, deviceName } from "../models/states.svelte.js";
    import StatusMessage from "./StatusMessage.svelte";
    // import { navigate } from "svelte-native";
    import { goBack, navigate } from "@nativescript-community/svelte-native";
    import { get } from 'svelte/store';
    import BluetoothPage from "./BluetoothPage.svelte";

    // import { prompt } from '@nativescript/core/ui/dialogs';

    


    let isArmed = true;
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
    async function disconnectStuff() {
        console.log("disconnecting");
        console.log($peripheralUUID);
        await get(bluetooth).disconnect({ UUID: $peripheralUUID }).then(() => {
            $peripheralUUID = false;
            console.log("disconnected");
        });
    }
    function goToBluetooth() {
        navigate({
            page: BluetoothPage,
            // Optional: Transition animations
            transition: {
                name: "slide",
                duration: 200,
                curve: "easeIn"
            }
        });
    }
</script>

<page>
    <actionBar title={`${get(deviceName)} Switches`}>
            <!-- <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={goBack} /> -->
        <!-- <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={goBack} /> -->
        <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={goBack} />
    </actionBar>
    <stackLayout>
        {#each ($switches).sort((a, b) => a.switchNum - b.switchNum) as customSwitch (customSwitch.switchNum)}
            <stackLayout orientation="horizontal" width="100%">
                <button class="btn-1" isEnabled={$peripheralUUID != false} text={`${customSwitch.label} On`} width="20%" on:tap={async () => {
                    await customSwitch.bleSendVal(1);
                }} />
                <button class="btn-2" isEnabled={$peripheralUUID != false} text={`${customSwitch.label} Off`} width="20%" on:tap={async () => {
                    await customSwitch.bleSendVal(0);
                }} />
                <StatusMessage statusChar={String.fromCharCode(customSwitch.state)} shouldBe={customSwitch.shouldBe} />
            </stackLayout>
        {/each}
            <stackLayout orientation="vertical" width="100%">
                <label>Battery Voltage: {Math.round($batteryVoltageState / 255 * 6.6 * 100) / 100}V</label>
                <label class={($peripheralUUID == false) ? "disconnected" : "connected"}>{($peripheralUUID == false) ? "Disconnected" : "Connected"}</label>
                <button class="disconnect btn-1" isEnabled={$peripheralUUID != false} text="Disconnect" on:tap={disconnectStuff}/>
                <button class="disconnect btn-1" text="Go to Bluetooth Connect Page" on:tap={goToBluetooth}/>

            </stackLayout>

    </stackLayout>
</page>

<style>
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
    label.connected {
        color: white;
        background-color: green;
    }
    label.disconnected {
        color: white;
        background-color: red;
    }
    label {
        width: 50%;
        text-align: center;
        padding-top: 10em;
        padding-bottom: 10em;
        font-size: large;
        font-weight: bold;
    }
    button.disconnect {
        width: 50%;
        text-align: center;
        padding-top: 10em;
        padding-bottom: 10em;
        font-size: large;
        font-weight: bold;
    }

    
</style>