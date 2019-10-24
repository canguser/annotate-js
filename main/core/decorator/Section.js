import {BasicAnnotationDescribe} from "../decorator-generator/BasicAnnotationDescribe";
import AnnotationGenerator from "../decorator-generator/AnnotationGenerator";

class SectionDescribe extends BasicAnnotationDescribe {

    constructor() {
        super();
        Object.assign(this.params, {
            after: undefined,
            before: () => undefined
        });
    }

}

const Section = AnnotationGenerator.generate(SectionDescribe);

export {SectionDescribe, Section};