import HasAnnotations from "./HasAnnotations";

export default class ClassEntity extends HasAnnotations {

    name;

    classType;

    propertiesSet = new Set();


    constructor(classType, name) {
        super();
        this.classType = classType;
        this.name = name || classType.name;
    }

    get propertyAnnotations() {
        return [...this.properties.map(p => ({[p.name]: p.annotations}))];
    }

    get properties() {
        return Array.from(this.propertiesSet);
    }

    addProperty(property) {
        this.propertiesSet.add(property);
    }

    getProperty(propertyName) {
        return this.properties.find(p => p.name === propertyName);
    }

}