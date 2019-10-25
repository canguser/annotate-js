import AnnotationGenerator from "../decorator-generator/AnnotationGenerator";
import {PropertyDescribe} from "./Property";
import AnnotationUtils from "../utils/AnnotationUtils";

class AutowiredDescribe extends PropertyDescribe {

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

    hookProperty({proxy,container}) {
        super.hookProperty({proxy, container});
        const valueGetWay = (autowired) => {
            const targetBean = container.getBean(autowired.beanName);
            return autowired.isMapProperty ? targetBean[autowired.propertyName] : targetBean;
        };
        proxy.register('getOwnPropertyDescriptor',
            ([target, property], {next}) => {
                const propertyEntity = AnnotationUtils.getPropertyEntity(target, property);
                if (propertyEntity && propertyEntity.hasAnnotations(Autowired)) {
                    const autowired = propertyEntity.findAnnotationByType(Autowired);
                    return {
                        get: () => valueGetWay(autowired),
                        configurable: true,
                        enumerable: true
                    }
                } else {
                    next();
                }
            }
        );
        proxy.register('get',
            ([target, property], {next}) => {
                const propertyEntity = AnnotationUtils.getPropertyEntity(target, property);
                if (propertyEntity && propertyEntity.hasAnnotations(Autowired)) {
                    const autowired = propertyEntity.findAnnotationByType(Autowired);
                    return valueGetWay(autowired);
                } else {
                    next();
                }
            }
        )
    }

}

const Autowired = AnnotationGenerator.generate(AutowiredDescribe);

export {AutowiredDescribe, Autowired}