import {BasicAnnotationDescribe} from "../decorator-generator/BasicAnnotationDescribe";
import AnnotationGenerator from "../decorator-generator/AnnotationGenerator";

class AutowiredDescribe extends BasicAnnotationDescribe {

    constructor() {
        super();
        Object.assign(this.params, {
            name: '',
            beanName: '',
            propertyName: '',
            isMapProperty: false
        })
    }

    applyProperty(property) {
        super.applyProperty(property);
        const originName = this.params.name;
        this.params.name = originName || property.name;
    }

    get beanName() {
        const {beanName, name, isMapProperty} = this.getParams();
        return isMapProperty ? beanName : (beanName || name);
    }

    get propertyName() {
        const {name, isMapProperty, propertyName} = this.getParams();
        return isMapProperty ? (propertyName || name) : ''
    }

    get isMapProperty() {
        return this.getParams('isMapProperty');
    }

}

const Autowired = AnnotationGenerator.generate(AutowiredDescribe);

export {AutowiredDescribe, Autowired}