import {PropertyDescribe} from "../../core/decorator";
import AnnotationGenerator from "../../core/decorator-generator/AnnotationGenerator";

export class OrderedPropertyDescribe extends PropertyDescribe {

    get defaultKey() {
        return 'priority'
    }

    onClassBuilt(propertyEntity, classDecorator) {
        super.onClassBuilt(propertyEntity, classDecorator);

        const wireMethod = classDecorator.targetBean[propertyEntity.name];

        if (typeof wireMethod === 'function') {
            wireMethod(this.getParams('priority'));
        }
    }
}

export const OrderedProperty = AnnotationGenerator.generate(OrderedPropertyDescribe);
