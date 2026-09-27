<script>
    // Small badge showing a switch's hardware-reported state. statusChar is
    // one of 'D'/'N'/'O' (see the ASCII state codes in Switch.js) derived from
    // the switch's numeric `state` byte via String.fromCharCode in Switches.svelte.
    // Uses the shared .badge classes from app.css instead of its own colors,
    // so it stays visually consistent with any other status badge in the app.
    export let statusChar;

    $: text = statusChar == 'D' ? 'Disconnected'
        : statusChar == 'N' ? 'Nominal'
        : statusChar == 'O' ? 'Off'
        : 'Impossible';

    $: variant = statusChar == 'D' ? '-danger'
        : statusChar == 'N' ? '-success'
        : statusChar == 'O' ? '-info'
        : '-warning';
</script>

<label text={text} class="badge {variant}" />
