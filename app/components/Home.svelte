<script>
    // import { navigateTo } from "svelte-native";
    import { navigate } from "@nativescript-community/svelte-native";
    import BluetoothPage from "./BluetoothPage.svelte"; // Ensure the path is correct
    import Switches from "./Switches.svelte";
    import RenameSwitches from "./RenameSwitches.svelte";
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

    async function disconnectStuff() {
        console.log(get(peripheralUUID));
        await get(bluetooth).disconnect({ UUID: get(peripheralUUID) }).then(() => {
            console.log("howdy doody");
        });
        console.warn("howdy");
    }

</script>

<page actionBarHidden="true">
    <!-- Fake gradient ActionBar -->
    <stackLayout class="p-20">     
        <gridLayout rows="auto" class="custom-action-bar">
            <label text="Home" class="action-bar-title" />
        </gridLayout>   
        <button 
            text="Pair Bluetooth Device" 
            class="btn -primary" 
            on:tap={goToBluetooth} 
        />
        <button 
            text="Go To Switches"
            class="btn -primary btn2"
            on:tap={goToSwitches}
        />

        <button 
            text="Disconnect"
            class = "btn -primary btn"
            on:tap={disconnectStuff}
        />

        <button
            text="Change Switch Labels"
            class="btn -primary btn2"
            on:tap={goToSwitchLabels}/>

    </stackLayout>
</page>

<style>
    .p-20 { padding: 20; }
    /* .text-center { text-align: center; } */
    button.-primary {
        background: linear-gradient(90deg, #C5F9D7, #F7D486, #F27A7D);
        /* background-color: #31AF9C; */
        color: black;
        border-radius: 10%;
        transition: background 0.3s ease-in-out;
        font-size: 20px;

    }
    /* button.btn2 {
        background: linear-gradient(90deg, #C5F9D7, #F7D486, #F27A7D);
    } */
    button.-primary:active {
        background-color: #2D9F8E;
    }
    
    
    .custom-action-bar {
        /* background-color: black; */
        color: white;
        font-size: 30px;
        padding: 20px;
        width: 100%;
        height: auto;
        text-align: center;
    }
    

</style>