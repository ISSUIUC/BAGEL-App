<script>
    // Landing page: routes to the other screens via svelte-native's navigate().
    import { navigate } from "@nativescript-community/svelte-native";
    import BluetoothPage from "./BluetoothPage.svelte";
    import Switches from "./Switches.svelte";
    import RenameSwitches from "./RenameSwitches.svelte";
    import { disconnectFromPeripheral } from "~/services/bleService";

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

    function goToSwitches() {
        navigate({
            page: Switches,
            // Optional: Transition animations
            transition: {
                name: "slide",
                duration: 200,
                curve: "easeIn"
            }
        });

    }
     
    function goToSwitchLabels() {
        navigate({
            page: RenameSwitches,
            // Optional: Transition animations
            transition: {
                name: "slide",
                duration: 200,
                curve: "easeIn"
            }
        });

    }

    // Disconnects the currently paired device, if any. disconnectFromPeripheral
    // itself no-ops when nothing is connected, so this can't throw an
    // unhandled rejection the way calling the BLE plugin directly used to.
    async function disconnectStuff() {
        try {
            await disconnectFromPeripheral();
            console.log("Disconnected.");
        } catch (err) {
            console.error("Disconnect failed:", err);
        }
    }

</script>

<page>
    <actionBar title="Home" />

    <scrollView>
        <stackLayout class="p-20">
            <label text="BAGEL" class="h1 text-center" />
            <label text="Connect to your BAGEL device and control its switches"
                   class="body text-center m-b-20" textWrap="true" />

            <label text="CONNECTION" class="caption m-b-5" />
            <button
                text="Pair Bluetooth Device"
                class="btn -primary m-b-10"
                on:tap={goToBluetooth}
            />
            <button
                text="Disconnect"
                class="btn -outline m-b-20"
                on:tap={disconnectStuff}
            />

            <label text="CONTROLS" class="caption m-b-5" />
            <button
                text="Go To Switches"
                class="btn -primary m-b-10"
                on:tap={goToSwitches}
            />
            <button
                text="Change Switch Labels"
                class="btn -outline"
                on:tap={goToSwitchLabels}/>
        </stackLayout>
    </scrollView>
</page>