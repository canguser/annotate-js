import {BasicAnnotationDescribe} from "../decorator-generator/BasicAnnotationDescribe";
import AnnotationGenerator from "../decorator-generator/AnnotationGenerator";

class AutowiredDescribe extends BasicAnnotationDescribe {

    constructor() {
        super();
        Object.assign(this.params, {
            beanName: ''
        })
    }

    get beanName() {
        return this.getParams('beanName');
    }

}

const Autowired = AnnotationGenerator.generate(AutowiredDescribe);

export {AutowiredDescribe, Autowired}