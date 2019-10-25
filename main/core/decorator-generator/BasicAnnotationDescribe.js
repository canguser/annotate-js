import AnnotationGenerator from "./AnnotationGenerator";
import AnnotationUtils from "../utils/AnnotationUtils";
import Constants from "../utils/Constants";
import ClassEntity from "../entities/ClassEntity";
import PropertyEntity from "../entities/PropertyEntity";

class BasicAnnotationDescribe {

    params = {};

    getParams(key) {
        if (key == null){
            return this.params;
        }
        return this.params[key];
    }

    get paramsKeys() {
        return Object.keys(this.params);
    }

    get defaultKey() {
        return this.paramsKeys[0] || 'value';
    }

    export(...args) {

        const flagMap = AnnotationUtils.flagDecoratorByParams(args);

        if (flagMap.isCustomParams && args.length > 0) {

            if (typeof args[0] !== 'object') {
                this.params[this.defaultKey] = args[0];
            } else {
                Object.assign(this.params, args[0]);
            }
        }

        return this.onDecorate.bind(this);
    }

    onDecorate(...args) {

        const flagMap = AnnotationUtils.flagDecoratorByParams(args);

        if (!flagMap.isCustomParams) {
            this.storage = AnnotationUtils.getTargetStorage(
                args[0],
                Constants.CLASS_STORAGE
            );
            this.classEntity = this.storage[Constants.CLASS_ENTITY] || new ClassEntity(
                (typeof args[0] === 'function') ? args[0] : args[0].constructor
            );
            if (flagMap.isClassType) {
                this.storageClassDecorator(...args);
            }
            if (flagMap.isPropertyType || flagMap.isMethodType) {
                // mark the decorate
                this.storageInnerDecorator(...args);
            }
            AnnotationUtils.applyClassEntity(args[0], this.classEntity);
        }
    }

    storageClassDecorator(targetType) {
        this.classEntity.addAnnotation(this);
        const instance = new targetType();
        Object.getOwnPropertyNames(instance).forEach(field => {
            this.applyProperty(new PropertyEntity(field, instance[field]));
        });
        for (let field of Object.getOwnPropertyNames(Object.getPrototypeOf(instance))) {
            if (field !== 'constructor'){
                this.applyProperty(new PropertyEntity(field, instance[field]));
            }
        }
    }

    storageInnerDecorator(target, name) {
        const propertyEntity = new PropertyEntity(name);
        propertyEntity.addAnnotation(this);
        this.applyProperty(propertyEntity);
    }

    applyProperty(property) {
        const name = property.name;
        const propertyEntity = this.classEntity.properties.find(p => p.name === name) || new PropertyEntity(name);
        propertyEntity.initialValue = property.initialValue;
        property.annotations.forEach(annotation => {
            propertyEntity.addAnnotation(annotation);
        });
        this.classEntity.addProperty(propertyEntity);
    }
}

const Annotation = AnnotationGenerator.generate(BasicAnnotationDescribe);

export {Annotation, BasicAnnotationDescribe};