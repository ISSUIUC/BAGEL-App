<script>
    import localStorage from '@nativescript-use/nativescript-localstorage';
    import {switchLabels, deviceName} from "~/models/states.svelte";
    import { StackLayout } from '@nativescript/core';
    import { localStore } from '~/models/localStore';
    import { get } from 'svelte/store';
    import { goBack } from '@nativescript-community/svelte-native';
    // import {textField} from "svelte-native";
</script>

<page>
<actionBar title={`Update ${$deviceName} Labels`} >
    <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={goBack} />
</actionBar>
<stackLayout class="outer">
    {#each switchLabels as switchLabel, i}
        <stackLayout orientation="horizontal" class={`switch switch-${i}`}>
        <label>Switch {i+1} Label:</label>
        <textField hint="Switch {i+1} Label" text="{get(switchLabel)}" on:textChange="{(e) => {switchLabel.set(e.value)}}" />
        </stackLayout>
    {/each}
</stackLayout>
</page>

<style>
    .outer {
        display: flex;
        align-content: center;
    }

    .switch-0 {
        background-color: red;
    }
    .switch-1 {
        background-color: orange;
    }
    .switch-2 {
        background-color: yellow;
        color: black;
    }
    .switch-3 {
        background-color: green;
    }
    .switch-4 {
        background-color: blue;
    }
    .switch-5 {
        background: purple;
    }

    .switch {
        /* background-color: red; */
        margin-left: 25px;
        border-radius: 10%;
        padding-left: 25px;
        margin-top: 15px;
    }
    label {
        font-size: 25px;
    }
    .switch-2 > textField {
        color: black;
    }
    textField {
        font-size: 25px;
    }

</style>