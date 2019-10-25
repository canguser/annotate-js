import AnnotationGenerator from "../decorator-generator/AnnotationGenerator";
import {PropertyDescribe} from "./Property";

class SectionDescribe extends PropertyDescribe {

    constructor() {
        super();
        Object.assign(this.params, {
            after: undefined,
            before: () => undefined,
            onError: () => undefined
        });
    }

}

const Section = AnnotationGenerator.generate(SectionDescribe);

export {SectionDescribe, Section};