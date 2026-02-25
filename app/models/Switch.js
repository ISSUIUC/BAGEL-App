import { peripheralUUID, bluetooth, switches } from "./states.svelte";
import { get } from "svelte/store";

async function writeByteToCharacteristic(peripheralUUID, serviceUUID, characteristicUUID, byteValue) {
    try {
        console.log(`Sending byte ${byteValue} to ${characteristicUUID}...`);

        // 1. Convert the number into a 1-byte Uint8Array
        const data = new Uint8Array([byteValue]);
        const value = Array.from(data);
        // 2. Perform the write operation
        (get(bluetooth)).write({
            peripheralUUID: peripheralUUID,
            serviceUUID: serviceUUID,
            characteristicUUID: characteristicUUID,
            value: value // We pass the underlying ArrayBuffer
        });

        console.log(`Write for ${characteristicUUID} successful!`);
        return true;
    } catch (err) {
        console.error("Write failed:", err);
        // Common error: 'Characteristic does not support write'
        return false;
    }
}

export default class Switch {
    constructor(label, state, enabled, switchNum, serviceUUID, charUUID) {
        this.label = label;
        this.state = state;
        this.enabled = enabled;
        this.switchNum = switchNum;
        this.serviceUUID = serviceUUID;
        this.charUUID = charUUID;
        this.id = Math.random();
    }

    async toggle() {
        console.log(this.state)
        const D_ascii = 68;
        const I_ascii = 73;
        const N_ascii = 78;
        const O_ascii = 79;
        if (!this.enabled)
            return;
        if (this.state == N_ascii) {
            // this.state = !this.state;
            await writeByteToCharacteristic(get(peripheralUUID), this.serviceUUID, this.charUUID, 0);
        } else {
            // this.state = !this.state;
            await writeByteToCharacteristic(get(peripheralUUID), this.serviceUUID, this.charUUID, 1);
        }
    }

    setState(newState) {
        // send BLE stuff out
        this.state = newState;
    }

    async bleSendVal(val) {
        await writeByteToCharacteristic(get(peripheralUUID), this.serviceUUID, this.charUUID, val);

    }

    disable() {
        this.enabled = false;
    }

    enable() {
        this.enabled = true;
    }

    async setupNotifications() {
        try {
        await get(bluetooth).startNotifying({
            peripheralUUID: get(peripheralUUID),
            serviceUUID: this.serviceUUID,
            characteristicUUID: this.charUUID,
            onNotify: (result) => {
                let actualState = new Uint8Array(result.value)[0];
                // this.state = uint8View[0];
                let this_id = this.id;
                const actualSwitch = get(switches).filter(obj => obj.id == this_id)[0];
                const fakeSwitches = get(switches).filter(obj => obj.id != this_id);

                // console.log(JSON.stringify(actualSwitch))
                actualSwitch.state = actualState;
                switches.set([actualSwitch, ...fakeSwitches]);
                // console.log(get(switches))
            }
        }).then(() => {
            console.log("things happened for ", this.label);
        })
        } catch (err) {
            console.error("Notifications failed to be setup: ", err)
        }
    }
}