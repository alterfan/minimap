/**
 * Provides requestAnimationFrame in a cross browser way.
 * @author paulirish  http://paulirish.com/
 */
const tokenlist = ["#text", "#space", "comment", "string", "string-2", "number", "variable", "variable-2",
    "def", "operator", "keyword", "atom", "meta", "tag", "tag bracket", "attribute", "qualifier", "property", "builtin", "variable-3", "type", "string property", "tab"
];
const viewboxStyle = {
    position: "absolute",
    cursor: "pointer",
    zIndex: "1",
    background: "rgba(255,255,255,0.5)",
    transition: "background-color 300ms ease-in-out, opacity 300ms ease-in-out",
    WebkitTransition: "background-color 300ms ease-in-out, opacity 300ms ease-in-out",
    MozTransition: "background-color 300ms ease-in-out, opacity 300ms ease-in-out",
    MsTransition: "background-color 300ms ease-in-out, opacity 300ms ease-in-out",
    OTransition: "background-color 300ms ease-in-out, opacity 300ms ease-in-out",
}


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
