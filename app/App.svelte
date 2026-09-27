<script lang="ts">
    // Root component: hosts the navigation <frame> and starts on Home.
    // All other pages (BluetoothPage, Switches, RenameSwitches, StatusPage)
    // are reached from here via svelte-native's navigate().
    import Home from './components/Home.svelte'
</script>

<frame>
    <Home />
</frame>
