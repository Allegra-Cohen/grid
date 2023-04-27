export default class Callback {

    constructor(name) {
        this.name = name;
    }

    exec(operation) {
        return operation;
    }

    log0(operation) {
        return () => {
            const args = []
            console.log("callback:", `${this.name}[${args}]`);
            const result = operation();
            return result;
        }
    }

    log1(operation) {
        return (arg1) => {
            const args = [arg1]
            console.log("callback:", `${this.name}[${args}]`);
            const result = operation(arg1);
            return result;
        }
    }

    get(operation) {
        return (...args) => {
            console.log(`callback: ${this.name}(`, ...args, ")");
            const result = operation(...args);
            return result;
        }
    }
}
