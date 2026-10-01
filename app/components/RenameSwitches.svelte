<script>
    // Lets the user rename each of the 6 switches. switchLabels are persisted
    // (see localStore.js) so renames survive an app restart, and are read
    // elsewhere via Switch.label (states.svelte.js).
    import { switchLabels } from "~/models/states.svelte";
    import { get } from 'svelte/store';
    import { goBack } from "@nativescript-community/svelte-native";
</script>

<page>
<actionBar title="Update Switch Labels">
    <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={goBack} />
</actionBar>
<scrollView>
    <stackLayout class="p-15">
        <label text="Rename each switch below. Changes save automatically."
               class="body m-b-20" textWrap="true" />
        {#each switchLabels as switchLabel, i}
            <stackLayout class="card switch-card">
                <label text="Switch {i+1}" class="caption m-b-5" />
                <!-- get(), not $switchLabel: $store auto-subscription doesn't work on
                     an {#each} loop variable. -->
                <textField hint="Switch {i+1} Label" text="{get(switchLabel)}" class="h3"
                           on:textChange="{(e) => {switchLabel.set(e.value)}}" />
            </stackLayout>
        {/each}
    </stackLayout>
</scrollView>
</page>

<style>
    .switch-card {
        margin-bottom: 10;
    }
</style>
