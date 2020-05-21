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
        });
        this.allowClassWorks = false;
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

    get defaultKey() {
        return 'beanName'
    }

    hookProperty({proxy, container}) {
        super.hookProperty({proxy, container});
        const valueGetWay = (autowired) => {
            const targetBean = container.getBean(autowired.beanName);
            const targetProperty = targetBean[autowired.propertyName];
            return autowired.isMapProperty ? (typeof targetProperty === 'function' ? targetProperty.bind(targetBean) : targetProperty) : targetBean;
        };
        proxy.register('getOwnPropertyDescriptor',
            ([target, property], {next}) => {
                const propertyEntity = AnnotationUtils.getPropertyEntity(target, property);
                if (propertyEntity && propertyEntity.hasAnnotations(Autowired)) {
                    const autowired = propertyEntity.findAnnotationByType(Autowired);
                    if (container.hasBean(autowired.beanName)) {
                        return {
                            get: () => valueGetWay(autowired),
                            configurable: true,
                            enumerable: true
                        }
                    }
                }
                next();
            }
        );
        proxy.register('get',
            ([target, property], {next}) => {
                const propertyEntity = AnnotationUtils.getPropertyEntity(target, property);
                if (propertyEntity && propertyEntity.hasAnnotations(Autowired)) {
                    const autowired = propertyEntity.findAnnotationByType(Autowired);
                    if (container.hasBean(autowired.beanName)) {
                        return valueGetWay(autowired);
                    }
                }
                next();
            }
        )
    }

}

const Autowired = AnnotationGenerator.generate(AutowiredDescribe);

export {AutowiredDescribe, Autowired}