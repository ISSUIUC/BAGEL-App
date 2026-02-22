async function writeByteToCharacteristic(bluetooth, peripheralUUID, serviceUUID, characteristicUUID, byteValue) {
    try {
        console.log(`Sending byte ${byteValue} to ${characteristicUUID}...`);

        // 1. Convert the number into a 1-byte Uint8Array
        const data = new Uint8Array([byteValue]);
        const value = Array.from(data);
        // 2. Perform the write operation
        await bluetooth.write({
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
    constructor(label, state, enabled, switchNum, serviceUuid, charUuid) {
        this.label = label;
        this.state = state;
        this.enabled = enabled;
        this.switchNum = switchNum;
        this.serviceUuid = serviceUuid;
        this.charUuid = charUuid;
        this.id = Math.random();
    }

    async toggle(bluetooth, peripheralUUID) {
        console.log(this.state)
        // if (this.enabled)
        //     this.state = true;
        if (this.state == true) {
            this.state = !this.state;
            await writeByteToCharacteristic(bluetooth, peripheralUUID, this.serviceUuid, this.charUuid, 0);
        } else {
            this.state = !this.state;
            await writeByteToCharacteristic(bluetooth, peripheralUUID, this.serviceUuid, this.charUuid, 1);
        }
    }

    setState(newState) {
        // send BLE stuff out
        if (this.enabled) {
            this.state = newState;
        }
        console.log(this.state)
    }

    disable() {
        this.enabled = false;
    }

    enable() {
        this.enabled = true;
    }
}