var tokennames = ["#text", "#space", "comment", "string", "string-2", "number", "variable", "variable-2", "def", "operator", "keyword", "atom", "meta", "tag", "tag bracket", "attribute", "qualifier", "property", "builtin", "variable-3", "type", "string property", "tab"];
var cache = new class {
    constructor() {
        this.buffer = {};
    }
    get getAll() {
        this.buffer = this.buffer || {}
        return this.buffer;
    }
    get(property) {
        const _property = this.buffer[property];
        return _property
    };
    set(property, data) {
        let oldVal = this.buffer[property];
        if (oldVal != data) {
            this.buffer[property] = data;
        }
        return data
    };
}
