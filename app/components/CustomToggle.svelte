<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    // Props
    export let switchModel;
    let label = switchModel.label;
    let state = switchModel.state;
    let disabled = !switchModel.enabled;
    
    // Color Props
    export let offBackgroundColor = "#eeeeee"; // Background track when OFF
    export let onBackgroundColor = "#4cd964";  // Background track when ON
    export let thumbColor = "#ffffff";         // The "ball" color

    function onCheckedChange(args) {
        // args.value is the new boolean state
        // state = args.value;
        // dispatch('change', { value: state });
        console.log(args.value)
        switchModel.setState(args.value);
    }
</script>

<gridLayout columns="*, auto" class="toggle-container" verticalAlignment="middle">
    
    <label 
        col="0"
        text={label} 
        class="toggle-label {disabled ? 'disabled-text' : ''}" 
    />

    <switch 
        col="1"
        checked={state} 
        isEnabled={!disabled}
        offBackgroundColor={offBackgroundColor}
        backgroundColor={onBackgroundColor}
        color={thumbColor}
        on:checkedChange={onCheckedChange}
    />

</gridLayout>

<style>
    .toggle-container {
        padding: 10;
        margin: 5;
    }

    .toggle-label {
        font-size: 16;
        color: #333333;
    }

    .disabled-text {
        opacity: 0.5;
    }
</style>