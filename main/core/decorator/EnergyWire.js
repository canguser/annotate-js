import {AutowiredDescribe} from "./Autowired";
import AnnotationGenerator from "../decorator-generator/AnnotationGenerator";


class EnergyWireDescribe extends AutowiredDescribe {

    sparePropertyName;

    applyProperty(property) {
        super.applyProperty(property);
        this.sparePropertyName = property.name;
    }

    get beanName() {
        if (!this.usingEnergy) {
            return super.beanName;
        }
        return super.beanName.split('.')[0] || super.beanName;
    }

    get propertyName() {
        if (!this.usingEnergy) {
            return super.propertyName;
        }
        return super.beanName.split('.')[1] || this.sparePropertyName;
    }

    get isMapProperty() {
        if (!this.usingEnergy) {
            return super.isMapProperty;
        }
        return true;
    }

    get usingEnergy() {
        return !super.propertyName && !super.isMapProperty;
    }
}

const EnergyWire = AnnotationGenerator.generate(EnergyWireDescribe);

export {EnergyWire, EnergyWireDescribe};