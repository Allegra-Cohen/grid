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
            operation();
        }
    }

    log1(operation) {
        return (arg1) => {
            const args = [arg1]
            console.log("callback:", `${this.name}[${args}]`);
            operation(arg1);
        }
    }
}
