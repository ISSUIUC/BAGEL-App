<script>
    import localStorage from '@nativescript-use/nativescript-localstorage';
    import {switchLabels} from "~/models/states.svelte";
    import { StackLayout } from '@nativescript/core';
    import { localStore } from '~/models/localStore';
    import { get } from 'svelte/store';
    // import {textField} from "svelte-native";
</script>

<page>
<actionBar title="Update Switch Labels" />
<stackLayout>
    {#each switchLabels as switchLabel, i}
        <stackLayout orientation="horizontal">
        <label>Switch {i+1} Label:</label>
        <textField hint="Switch {i+1} Label" text="{get(switchLabel)}" on:textChange="{(e) => {switchLabel.set(e.value)}}" />
        </stackLayout>
    {/each}
</stackLayout>
</page>