import HasAnnotations from "./HasAnnotations";

export default class PropertyEntity extends HasAnnotations {

    name;

    initialValue;

    descriptor;

    constructor(name, instance, descriptor) {
        super();
        this.name = name;
        if (instance) {
            descriptor = descriptor || Object.getOwnPropertyDescriptor(instance, name);
        }
        this.descriptor = descriptor;
        if (descriptor && 'value' in descriptor) {
            this.initialValue = descriptor.value;
        }
    }

}