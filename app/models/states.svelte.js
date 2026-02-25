import Switch from "./Switch";
import { writable } from "svelte/store";
import { Bluetooth } from '@nativescript-community/ble';

export const bluetooth = writable(new Bluetooth());

export const switchInitData = [
    {
        label: "Disconnected",
        state: false,
        enabled: false,
        switchNum: 1,
        serviceUuid: "72737810-8272-9812-9898-98bcdef98198",
        charUuid: "1ab83456-7653-7384-2737-484838483848"
    },
    {
        label: "Blue Raven",
        state: false,
        enabled: true,
        switchNum: 2,
        serviceUuid: "72737810-8272-9812-9898-98bcdef98198",
        charUuid: "637777ab-c738-7de7-2898-273738838838"
    },
    {
        label: "CAM",
        state: 83,
        enabled: true,
        switchNum: 3,
        serviceUuid: "72737810-8272-9812-9898-98bcdef98198",
        charUuid: "72671834-8282-0308-2383-838bcde29092"
    },
    {
        label: "TeleMega Pyro",
        state: false,
        enabled: true,
        switchNum: 4,
        serviceUuid: "73737373-7371-9192-1095-09128927266b",
        charUuid: "987187ab-d937-fe72-8374-020927167827"
    },
    {
        label: "TeleMega Power",
        state: false,
        enabled: true,
        switchNum: 5,
        serviceUuid: "73737373-7371-9192-1095-09128927266b",
        charUuid: "67374498-9248-9249-8249-834893483bcd"
    },
    {
        label: "MIDAS",
        state: true,
        enabled: true,
        switchNum: 6,
        serviceUuid: "73737373-7371-9192-1095-09128927266b",
        charUuid: "97198188-9289-2bcd-98f9-8e9898e71231"
    },
];

let switchesData = switchInitData.map(data => {
    let s = new Switch(data.label, data.state, data.enabled, data.switchNum, data.serviceUuid, data.charUuid);
    // Attach UUIDs to the model instance for easy access in handleToggle
    return s;
});



export const switches = writable([...switchesData]);

export const peripheralUUID = writable(false);

