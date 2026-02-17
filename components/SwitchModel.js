export default class SwitchModel {
  constructor(id, name, isActive = false) {
    this.id = id; // The switchNum
    this.name = name; // The switchName
    this.isActive = isActive;
  }

  // A helper to get the status text based on state
  getStatusString() {
    return this.isActive ? "Online" : "Offline";
  }
}