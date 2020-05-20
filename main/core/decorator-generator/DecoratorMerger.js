import {BasicAnnotationDescribe} from "../decorator-generator/BasicAnnotationDescribe";
import AnnotationUtils from "../utils/AnnotationUtils";
import AnnotationGenerator from "../decorator-generator/AnnotationGenerator";

class DecoratorMergerDescribe extends BasicAnnotationDescribe {


    constructor() {
        super();
        Object.assign(this.params, {
            with: []
        });
    }

    storageClassDecorator(targetType) {
        super.storageClassDecorator(targetType);
        this.targetType = targetType;
        this.mergeDecorators();
    }


    mergeDecorators() {
        const target = new this.targetType();
        const propertyMap = AnnotationUtils.fromEntries(
            [...Object.getOwnPropertyNames(target), ...Object.getOwnPropertyNames(Object.getPrototypeOf(target))]
                .map(key => [key, target[key]])
        );

        this.decorators = this.getParams('with').map(
            d => d instanceof BasicAnnotationDescribe ? [d] : d.describeTypes
        ).filter(d => d != null).flat().map(d =>
            class MergedDecorators extends d {
                constructor() {
                    super();
                    Object.assign(this.params, propertyMap);
                }
            }
        );
    }

    onReturn() {
        return AnnotationGenerator.generate(this.decorators[0], this.decorators.slice(1));
    }
}

const DecoratorMerger = AnnotationGenerator.generate(DecoratorMergerDescribe);

export {DecoratorMergerDescribe, DecoratorMerger};