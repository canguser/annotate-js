import {BeanDescribe} from "./Bean";
import AnnotationUtils from "../utils/AnnotationUtils";
import AnnotationGenerator from "../decorator-generator/AnnotationGenerator";

class BootDescribe extends BeanDescribe {

    constructor() {
        super();
        Object.assign(this.params, {
            methodName: 'main',
            name: 'bootBean'
        })
    }


    onCreated() {
        super.onCreated();
        AnnotationUtils.waitImmediately()
            .then(() => {
                this.targetBean[this.methodName]();
            })
            .catch(e => {
                console.warn(e);
            })
    }

    get methodName() {
        return this.getParams('methodName');
    }

    get defaultKey() {
        return 'methodName';
    }
}

const Boot = AnnotationGenerator.generate(BootDescribe);

export {BootDescribe, Boot};