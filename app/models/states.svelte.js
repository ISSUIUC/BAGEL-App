// Domain state module: every screen imports the app's switches, their
// persisted labels, and battery voltage from here. See Switch.js for the
// per-switch model these stores hold, and services/bleService.js for the
// actual Bluetooth connection/plugin ownership and I/O (this file no longer
// owns any BLE state directly - import connectedPeripheralUUID from there).
import Switch from "./Switch";
import { writable } from "svelte/store";
import { localStore } from "./localStore";
import { subscribeToByteNotifications } from "~/services/bleService";

// Superseded by the loop below, which does the same thing for all 6 switches
// without repeating the localStore(...) call six times:
// export const switch1Label = localStore("switch1", "Switch 1");
// export const switch2Label = localStore("switch2", "Switch 2");
// export const switch3Label = localStore("switch3", "Switch 3");
// export const switch4Label = localStore("switch4", "Switch 4");
// export const switch5Label = localStore("switch5", "Switch 5");
// export const switch6Label = localStore("switch6", "Switch 6");

// One persisted, editable label store per switch (switchLabels[0] = switch 1's
// label, etc). Edited via RenameSwitches.svelte; read via Switch.label.
export const switchLabels = [];
for (let i=1; i<7; i++) {
    switchLabels.push(localStore(`switch${i}`, `Switch ${i}`))
}

// Hardcoded to match the BAGEL firmware's fixed BLE GATT layout: two services
// (one per group of 3 switches) each exposing one characteristic per switch.
// These UUIDs can't be auto-discovered - they were captured once via
// StatusPage.svelte's service/characteristic audit tool and copied in here.
//
// `state` is the ASCII code the hardware reports for that switch (see the
// D/N/O constants in Switch.js) - it's just a startup placeholder that gets
// overwritten as soon as the first BLE notification arrives after connecting.
export const switchInitData = [
    {
        state: 68, // 'D' - switch 1 isn't wired to real hardware yet, hence enabled: false
        enabled: false,
        switchNum: 1,
        serviceUuid: "72737810-8272-9812-9898-98bcdef98198",
        charUuid: "1ab83456-7653-7384-2737-484838483848"
    },
    {
        state: 78, // 'N'
        enabled: true,
        switchNum: 2,
        serviceUuid: "72737810-8272-9812-9898-98bcdef98198",
        charUuid: "637777ab-c738-7de7-2898-273738838838"
    },
    {
        state: 79, // 'O'
        enabled: true,
        switchNum: 3,
        serviceUuid: "72737810-8272-9812-9898-98bcdef98198",
        charUuid: "72671834-8282-0308-2383-838bcde29092"
    },
    {
        state: 79, // 'O'
        enabled: true,
        switchNum: 4,
        serviceUuid: "73737373-7371-9192-1095-09128927266b",
        charUuid: "987187ab-d937-fe72-8374-020927167827"
    },
    {
        state: 79, // 'O'
        enabled: true,
        switchNum: 5,
        serviceUuid: "73737373-7371-9192-1095-09128927266b",
        charUuid: "67374498-9248-9249-8249-834893483bcd"
    },
    {
        state: 79, // 'O'
        enabled: true,
        switchNum: 6,
        serviceUuid: "73737373-7371-9192-1095-09128927266b",
        charUuid: "97198188-9289-2bcd-98f9-8e9898e71231"
    },
];

// The switches store: one Switch instance per entry in switchInitData above.
let switchesData = switchInitData.map(data => {
    return new Switch(data.state, data.enabled, data.switchNum, data.serviceUuid, data.charUuid);
});
export const switches = writable([...switchesData]);

// Same service as switches 1-3, but its own dedicated characteristic that
// reports battery voltage instead of a switch state.
export const batteryVoltageCharacteristic = {
    serviceUuid: "72737810-8272-9812-9898-98bcdef98198",
    charUuid: "10209209-1249-8124-7127-912981298129"
}

export const batteryVoltageState = writable(0);

/**
 * Subscribes to the battery voltage characteristic; called once after
 * connecting (see BluetoothPage.svelte). The raw byte (0-255) is scaled to
 * volts for display in Switches.svelte.
 */
export async function startVoltageNotifications() {
    await subscribeToByteNotifications(
        batteryVoltageCharacteristic.serviceUuid,
        batteryVoltageCharacteristic.charUuid,
        (actualState) => {
            console.log("Notified: ", actualState);
            batteryVoltageState.set(actualState);
        }
    );
}