import { switches, switchLabels } from "./states.svelte";
import { get } from "svelte/store";
import { writeByte, subscribeToByteNotifications } from "~/services/bleService";

/**
 * Represents one physical switch on the BAGEL device: its current state,
 * whether it's currently allowed to be toggled, and the BLE service/characteristic
 * UUIDs used to read/write/notify it. UUIDs are fixed by the device firmware
 * (see switchInitData in states.svelte.js), not discovered at runtime.
 *
 * `state` is the single-byte ASCII code the hardware reports over BLE: 68='D'
 * (Disconnected), 78='N' (Nominal), 79='O' (Off). Switch itself doesn't branch
 * on these values - it just stores and forwards the byte; StatusMessage.svelte
 * is what maps state to D/N/O, falling back to a generic "Impossible" badge
 * for anything else (e.g. a corrupted read).
 *
 * All actual BLE I/O is delegated to services/bleService.js - this class only
 * knows its own identity (UUIDs, switchNum) and current state, not how to
 * talk to the Bluetooth plugin.
 */
export default class Switch {
    constructor(state, enabled, switchNum, serviceUUID, charUUID) {
        this.state = state;
        this.enabled = enabled;
        this.switchNum = switchNum;
        this.serviceUUID = serviceUUID;
        this.charUUID = charUUID;
        this.id = Math.random();
    }

    // Labels are stored separately (and persisted) in switchLabels, keyed by
    // switchNum, so they survive renames/app restarts independent of this instance.
    get label() {
        return get(switchLabels[this.switchNum - 1]);
    }

    // Updates local state only - does not talk to the hardware. Used to reflect
    // a value that's already known to be correct (e.g. from a BLE notification).
    setState(newState) {
        this.state = newState;
    }

    /** Writes a raw value straight to this switch's characteristic, gated on `enabled`. */
    async bleSendVal(val) {
        if (!this.enabled)
            return;
        await writeByte(this.serviceUUID, this.charUUID, val);
    }

    disable() {
        this.enabled = false;
    }

    enable() {
        this.enabled = true;
    }

    /**
     * Subscribes to this switch's BLE characteristic so hardware-reported
     * state changes (e.g. after a toggle, or a change made outside the app)
     * flow back into the `switches` store and update the UI.
     */
    async setupNotifications() {
        try {
            await subscribeToByteNotifications(this.serviceUUID, this.charUUID, (actualState) => {
                let this_id = this.id;
                const actualSwitch = get(switches).filter(obj => obj.id == this_id)[0];
                const otherSwitches = get(switches).filter(obj => obj.id != this_id);

                actualSwitch.state = actualState;
                switches.set([actualSwitch, ...otherSwitches]);
            });
            console.log("things happened for ", this.label);
        } catch (err) {
            console.error("Notifications failed to be setup: ", err)
        }
    }
}
