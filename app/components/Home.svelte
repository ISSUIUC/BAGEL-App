<script>
    // import { navigateTo } from "svelte-native";
    import { navigate } from "@nativescript-community/svelte-native";
    import BluetoothPage from "./BluetoothPage.svelte"; // Ensure the path is correct
    import Switches from "./Switches.svelte";
    import { get } from "svelte/store";
    import { peripheralUUID, bluetooth } from "../models/states.svelte.js";  //😭
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
     

    async function disconnectStuff() {
        console.log(get(peripheralUUID));
        await get(bluetooth).disconnect({ UUID: get(peripheralUUID) }).then(() => {
            console.log("howdy doody");
        });
        console.warn("howdy");
    }

</script>

<page>
    <actionBar title="Home" />
    
    <stackLayout class="p-20">
        <label text="Welcome to the App" class="h1 text-center" />
        
        <button 
            text="Pair Bluetooth Device" 
            class="btn -primary" 
            on:tap={goToBluetooth} 
        />
        <button 
            text="Go To Switches"
            class="btn -primary"
            on:tap={goToSwitches}
        />

        <button 
            text="Disconnect"
            class = "btn -primary"
            on:tap={disconnectStuff}
        />

    </stackLayout>
</page>

<style>
    .p-20 { padding: 20; }
    .text-center { text-align: center; }
</style>