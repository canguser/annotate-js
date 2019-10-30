import {BasicAnnotationDescribe} from "../decorator-generator/BasicAnnotationDescribe";
import PropertyEntity from "../entities/PropertyEntity";
import AnnotationGenerator from "../decorator-generator/AnnotationGenerator";

class PropertyDescribe extends BasicAnnotationDescribe {

    allowClassWorks = true;


    constructor() {
        super();
        // todo - Set matching property roles.
    }

    hookProperty({proxy, container}) {
        // TO be override.
    }

    onClassBuilt(propertyEntity, classDecorator) {
        // TO be override.
    }


    /**
     * override parent
     * @param instance
     * @param field
     */
    scanProperty(instance, field) {
        if (this.allowClassWorks) {
            this.applyProperty(new PropertyEntity(field, instance[field]), [this])
        } else {
            super.scanProperty(instance, field);
        }
    }
}

const Property = AnnotationGenerator.generate(PropertyDescribe);

export {PropertyDescribe, Property};