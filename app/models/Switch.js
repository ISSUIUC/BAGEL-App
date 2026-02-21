export default class Switch {
    constructor(label, state, enabled, switchNum, uuid=null) {
        this.label = label;
        this.state = state;
        this.enabled = enabled;
        this.switchNum = switchNum;
        this.uuid = uuid;
        this.id = Math.random();
    }

    toggle() {
        if (this.enabled)
            this.state = true;
        if (this.state) {
            // do fancy BLE stuff
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