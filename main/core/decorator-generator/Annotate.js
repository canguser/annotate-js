import {BasicAnnotationDescribe} from "../decorator-generator/BasicAnnotationDescribe";
import AnnotationUtils from "../utils/AnnotationUtils";
import AnnotationGenerator from "../decorator-generator/AnnotationGenerator";
import {PropertyDescribe} from "../decorator";


export class AnnotateDescribe extends BasicAnnotationDescribe {

    targetDecoratedClass;
    targetAnnotate;
    targetAnnotateDefaultKey;
    targetDynamicPropertyMap = {};

    constructor() {
        super();
        Object.assign(this.params, {
            name: '',
            extends: BasicAnnotationDescribe
        })
    }

    get defaultKey() {
        return 'name';
    }

    get extendsDescribe() {
        const extendsDescribe = this.params.extends;
        const instance = {};
        Object.setPrototypeOf(instance, extendsDescribe.prototype);
        if (instance instanceof BasicAnnotationDescribe) {
            return extendsDescribe;
        }
        return BasicAnnotationDescribe;
    }

    storageClassDecorator(targetType) {
        super.storageClassDecorator(targetType);
        this.targetDecoratedClass = targetType;
        this.declareDecorator();
    }

    declareDecorator() {
        // get target decorated class
        const target = new this.targetDecoratedClass();

        const propertyMap = AnnotationUtils.fromEntries(
            [
                ...Object.getOwnPropertyNames(target),
                ...Object.getOwnPropertyNames(Object.getPrototypeOf(target))
            ].map(key => [key, target[key]])
        );

        // find related property annotate
        this.applyPropertyAnnotates(propertyMap);
        const _this = this;

        this.targetAnnotate = class _AnonymousDescribe extends this.extendsDescribe {

            constructor() {
                super();
                Object.assign(this.params, propertyMap);
            }

            get defaultKey() {
                return _this.targetAnnotateDefaultKey || super.defaultKey;
            }

            onStorageFinished(params) {
                super.onStorageFinished(params);
                Object.entries(
                    _this.targetDynamicPropertyMap
                ).forEach(
                    ([name, func]) => {
                        this.params[name] = func.bind(this)(params)
                    }
                )
            }

        }
    }

    applyPropertyAnnotates(propertyMap) {
        let hasSetDefault = false;
        for (const property of this.classEntity.properties) {
            const name = property.name;
            if (!hasSetDefault) {
                if (property.hasAnnotations(DefaultParam)) {
                    this.targetAnnotateDefaultKey = name;
                    hasSetDefault = true;
                }
            }
            if (property.hasAnnotations(DynamicParam)) {
                const targetProperty = propertyMap[name];
                if (typeof targetProperty === 'function') {
                    this.targetDynamicPropertyMap[name] = targetProperty;
                    delete propertyMap[name];
                }
            }
        }
    }

    onReturn() {
        return AnnotationGenerator.generate(this.targetAnnotate);
    }
}


const Annotate = AnnotationGenerator.generate(AnnotateDescribe);

export {Annotate}

export class DefaultParamDescribe extends PropertyDescribe {
    allowClassWorks = false;
}

const DefaultParam = AnnotationGenerator.generate(DefaultParamDescribe);

export {DefaultParam}

export class DynamicParamDescribe extends PropertyDescribe {
}

const DynamicParam = AnnotationGenerator.generate(DynamicParamDescribe);

export {DynamicParam}