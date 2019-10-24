import HasAnnotations from "./HasAnnotations";

export default class PropertyEntity extends HasAnnotations {

    name;

    initialValue;

    constructor(name, initialValue) {
        super();
        this.name = name;
        this.initialValue = initialValue
    }

}