export default class Callback {

    constructor(name) {
        this.name = name;
    }

    get(operation) {
        return (...args) => {
            console.log(`callback: ${this.name}(`, ...args, ")");
            const result = operation(...args);
            return result;
        }
    }
}
