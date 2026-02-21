<script>
    import CustomToggle from './CustomToggle.svelte';
    import Switch from "../models/Switch";
    const switchInitData = [
        {
            label: "Disconnected",
            state: false,
            enabled: false,
            switchNum: 1,
        },
        {
            label: "Blue Raven",
            state: false,
            enabled: true,
            switchNum: 2,
        },
        {
            label: "CAM",
            state: false,
            enabled: true,
            switchNum: 3,
        },
        {
            label: "TeleMega Pyro",
            state: false,
            enabled: true,
            switchNum: 4,
        },
        {
            label: "TeleMega Power",
            state: false,
            enabled: true,
            switchNum: 5,
        },
        {
            label: "MIDAS",
            state: true,
            enabled: true,
            switchNum: 6,
        },
    ]
    let switches = [];
    for (let switchData of switchInitData) {
        let newSwitch = new Switch(switchData.label, switchData.state, switchData.enabled, switchData.switchNum);
        switches.push(newSwitch);
    }
    $: reactiveSwitches = switches;

    function handleToggle(event) {
        console.log("Toggle is now:", event.detail.value);
    }

</script>

<page>
    <actionBar title="Switches" />
    <stackLayout>
        {#each reactiveSwitches as customSwitch (customSwitch.id)}
        <CustomToggle 
            switchModel={customSwitch}
            
        />
        {/each}
        
    </stackLayout>
</page>