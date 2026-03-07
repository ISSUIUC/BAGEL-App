<script>    
    export let statusChar;
</script>

<stackLayout orientation="horizontal" width="100%" class="status-indicator">
    {#if statusChar == 'D'}
    <label class="disconnected status">Disconnected</label>
    {:else if statusChar == 'N'}
    <label class="nominal status">Nominal</label>
    {:else if statusChar == 'O'}
    <label class="off status">Off</label>
    {:else}
    <label class="impossible status">Impossible</label>
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
        height: calc(100% - 20px);
        border: 1px solid black;
    }

    .disconnected {
        color: #B20000;
        background-color: #FF9C9C;
        /* color: red; */
    }
    .nominal {
        color: green;
        background-color: #ADFFAD;
    }

    .off {
        background-color: #95D4FF;
        color: #0063A4;
        /* color: blue; */
    }

    .impossible {
        background-color: #FFE992;
        color: #927500;
    }
</style>