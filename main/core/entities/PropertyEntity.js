import HasAnnotations from "./HasAnnotations";

export default class PropertyEntity extends HasAnnotations {

    name;

    initialValue;

    descriptor;

    constructor(name, initialValue, descriptor) {
        super();
        this.name = name;
        this.initialValue = initialValue;
        if (descriptor) {
            this.descriptor = descriptor;
        }
    }

}