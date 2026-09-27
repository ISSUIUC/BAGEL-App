<script>
    import { switches, batteryVoltageState } from "../models/states.svelte.js";
    import StatusMessage from "./StatusMessage.svelte";
    import { prompt } from '@nativescript/core/ui/dialogs';
    import { writeByte } from "~/services/bleService";
    import { goBack } from "@nativescript-community/svelte-native";

    // Global safety interlock: the On/Off buttons below stay disabled until this
    // is true. Note this is purely a UX guard (the "password" is a plain string
    // baked into the app bundle), not real security against a determined user.
    let isArmed = false;

    // Battery notify characteristic reports a single byte (0-255); the
    // device's battery range maps linearly to 0-6.6V.
    $: voltage = Math.round($batteryVoltageState / 255 * 6.6 * 100) / 100;

    // NOTE: not currently used anywhere - the live UI below calls
    // customSwitch.bleSendVal(...) directly from each button's on:tap instead.
    // Kept here (and the matching commented-out <CustomToggle> below) as a
    // reference for the toggle-with-rollback flow this was meant to support.
    // Now delegates to bleService.writeByte(), which already handles the
    // reconnect-if-dropped dance and reports success/failure, instead of
    // duplicating that logic here (as it did before the bleService refactor).
    async function handleToggle(customSwitch) {
        customSwitch.toggle();
        const valueToSend = customSwitch.state ? 0x01 : 0x00;

        const ok = await writeByte(customSwitch.serviceUUID, customSwitch.charUUID, valueToSend);
        if (!ok) {
            // UI rollback: the hardware didn't get the message, so flip the
            // switch back and notify the store so the UI re-renders it.
            customSwitch.state = !customSwitch.state;
            switches.update(current => [...current]);
            alert("Action failed: Device unreachable.");
        }
    }

    function toggleArm() {
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
    }
</script>

<page>
    <actionBar title="Switches">
        <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={goBack} />
    </actionBar>
    <scrollView>
        <stackLayout class="p-15">

            <!-- Battery status card -->
            <stackLayout orientation="horizontal" width="100%" class="card m-b-10">
                <label text="Battery Voltage" class="body" width="70%" verticalAlignment="middle" />
                <label text="{voltage}V" class="h2" width="30%" textAlignment="right" />
            </stackLayout>

            {#each ($switches).sort((a, b) => a.switchNum - b.switchNum) as customSwitch (customSwitch.switchNum)}
                <!-- Currently unused in favor of the explicit On/Off buttons below.
                     CustomToggle.svelte renders a native <switch> toggle bound to
                     handleToggle() above; left here as the intended alternative UI. -->
                <!-- <CustomToggle
                    switchModel={customSwitch}
                    on:toggle={() => handleToggle(customSwitch)}
                /> -->
                <stackLayout class="card switch-card">
                    <stackLayout orientation="horizontal" width="100%" class="m-b-10">
                        <label text={customSwitch.label} class="h3" width="65%" verticalAlignment="middle" />
                        <StatusMessage statusChar={String.fromCharCode(customSwitch.state)} />
                    </stackLayout>
                    <!-- Gated on both the global arm switch AND this specific switch's
                         own `enabled` flag (e.g. switch 1 starts disabled - see switchInitData). -->
                    <stackLayout orientation="horizontal" width="100%">
                        <button isEnabled={isArmed && customSwitch.enabled} text="On" class="btn -success" width="50%" on:tap={async () => {
                            await customSwitch.bleSendVal(1);
                        }} />
                        <button isEnabled={isArmed && customSwitch.enabled} text="Off" class="btn -outline" width="50%" on:tap={async () => {
                            await customSwitch.bleSendVal(0);
                        }} />
                    </stackLayout>
                    {#if !customSwitch.enabled}
                        <label text="Not connected to hardware" class="caption m-t-5" />
                    {/if}
                </stackLayout>
            {/each}

            <!-- Red once armed as a safety cue - this gates real switches
                 (including labels like "Pyro" on real hardware), so it should
                 be obvious at a glance that the system is live. -->
            <button text={isArmed ? "Disarm" : "Arm"} class="btn {isArmed ? '-danger' : '-primary'} m-t-10" on:tap={toggleArm} />

        </stackLayout>
    </scrollView>
</page>

<style>
    .switch-card {
        margin-bottom: 12;
    }
</style>
