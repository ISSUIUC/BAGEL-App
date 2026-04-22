import Switch from "./Switch";
import { writable } from "svelte/store";
// import localStore from "@nativescript-use/nativescript-localstorage";
import { localStore } from "./localStore";
import { Bluetooth } from '@nativescript-community/ble';
import { get } from "svelte/store"

export const bluetooth = writable(new Bluetooth());

// export const switch1Label = localStore("switch1", "Switch 1");
// export const switch2Label = localStore("switch2", "Switch 2");
// export const switch3Label = localStore("switch3", "Switch 3");
// export const switch4Label = localStore("switch4", "Switch 4");
// export const switch5Label = localStore("switch5", "Switch 5");
// export const switch6Label = localStore("switch6", "Switch 6");

export const switchLabels = [];
for (let i=1; i<7; i++) {
    switchLabels.push(localStore(`switch${i}`, `Switch ${i}`))
}
export const switchInitData = [
    {
        state: 68,
        enabled: false,
        switchNum: 1,
        serviceUuid: "72737810-8272-9812-9898-98bcdef98198",
        charUuid: "1ab83456-7653-7384-2737-484838483848"
    },
    {
        state: 78,
        enabled: true,
        switchNum: 2,
        serviceUuid: "72737810-8272-9812-9898-98bcdef98198",
        charUuid: "637777ab-c738-7de7-2898-273738838838"
    },
    {
        state: 79,
        enabled: true,
        switchNum: 3,
        serviceUuid: "72737810-8272-9812-9898-98bcdef98198",
        charUuid: "72671834-8282-0308-2383-838bcde29092"
    },
    {
        state: false,
        enabled: true,
        switchNum: 4,
        serviceUuid: "73737373-7371-9192-1095-09128927266b",
        charUuid: "987187ab-d937-fe72-8374-020927167827"
    },
    {
        state: false,
        enabled: true,
        switchNum: 5,
        serviceUuid: "73737373-7371-9192-1095-09128927266b",
        charUuid: "67374498-9248-9249-8249-834893483bcd"
    },
    {
        state: true,
        enabled: true,
        switchNum: 6,
        serviceUuid: "73737373-7371-9192-1095-09128927266b",
        charUuid: "97198188-9289-2bcd-98f9-8e9898e71231"
    },
];

export const batteryVoltageCharacteristic = {
    serviceUuid: "72737810-8272-9812-9898-98bcdef98198",
    charUuid: "10209209-1249-8124-7127-912981298129"
}

export const batteryVoltageState = writable(0);


export async function startVoltageNotifications() {
    // try {
        await get(bluetooth).startNotifying({
            peripheralUUID: get(peripheralUUID),
            serviceUUID: batteryVoltageCharacteristic.serviceUuid,
            characteristicUUID: batteryVoltageCharacteristic.charUuid,
            onNotify: (result) => {
                let actualState = new Uint8Array(result.value)[0];
                console.log("Notified: ", actualState);
                // this.state = uint8View[0];

                // console.log(JSON.stringify(actualSwitch))
                batteryVoltageState.set(actualState);
                // console.log(get(switches))
            }
        });
    // } catch (err) {
    //     console.error("Notifications failed to be setup for battery voltage: ", err)
    // }
}


let switchesData = switchInitData.map(data => {
    let s = new Switch(data.label, data.state, data.enabled, data.switchNum, data.serviceUuid, data.charUuid);
    // Attach UUIDs to the model instance for easy access in handleToggle
    return s;
});



export const switches = writable([...switchesData]);

export const peripheralUUID = writable(false);