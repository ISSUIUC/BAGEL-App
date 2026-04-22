<script>    
    export let statusChar;
</script>

<stackLayout orientation="horizontal" width="100%" class="status-indicator">
    {#if statusChar == 'D'}
    <label class="status disconnected">Disconnected</label>
    {:else if statusChar == 'N'}
    <label class="status nominal">Nominal</label>
    {:else if statusChar == 'O'}
    <label class="status off">Off</label>
    {:else}
    <label class="status impossible">Impossible</label>
    {/if}
</stackLayout>

<style>
    .status-indicator {
        /* background-color: lightgrey; */
        width: 100%;
        margin: auto;
        padding: auto;
        text-align: center;
        display: flex;
        align-items: center;
        align-content: center;
        justify-content: center;
        justify-items: center;
        border: 1px solid black;
    }

    .status {
        text-align: center;
        /* padding: 30px; */
        width: 100%;
        border: 1px solid black;
    }
    label {
        /* font-size: 500px; */
        color: white;
    }

    .disconnected {
        background: linear-gradient(90deg, #C11E38, #220B34);
        color: white;
        /* color: red; */
    }
    .nominal {
        background: linear-gradient(90deg, #46B83D, #111E0B);
        color: white;
        /* color: green;
        background-color: #ADFFAD; */
    }

    .off {
        background: linear-gradient(90deg, #F7EA60, #3CF2DE);
        color: black;
        /* background-color: #95D4FF;
        color: #0063A4; */
        /* color: blue; */
    }

    .impossible {
        /* background-color: #FFE992; */
        background: linear-gradient(45deg, #890000, #abc653, #ff0, #b46c3e, #fff);
        color: black;
    }
</style>