import AnnotationUtils from "../utils/AnnotationUtils";
import Constants from "../utils/Constants";
import ClassEntity from "../entities/ClassEntity";
import PropertyEntity from "../entities/PropertyEntity";

class BasicAnnotationDescribe {

    params = {};
    args = [];

    getParams(key) {
        if (key == null) {
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
        this.args = args;

        if (flagMap.isCustomParams && args.length > 0) {
            this.applyDefaultArgs();
        }

        return this.onDecorate.bind(this);
    }

    applyDefaultArgs() {
        const {args} = this;
        if (!AnnotationUtils.isConfigurableObject(args[0])) {
            this.params[this.defaultKey] = args[0];
        } else {
            Object.assign(this.params, args[0]);
        }
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
            AnnotationUtils.applyClassEntity(args[0], this.classEntity);
            if (flagMap.isPropertyType || flagMap.isMethodType) {
                // mark the decorate
                this.storageInnerDecorator(...args);
            }
            if (flagMap.isClassType) {
                this.storageClassDecorator(...args);
            }
            AnnotationUtils.applyClassEntity(args[0], this.classEntity);
        }

        return this.onReturn();
    }


    storageClassDecorator(targetType) {
        this.classEntity.addAnnotation(this);
        const instance = new targetType();
        for (let field of AnnotationUtils.getPropertyNames(instance)) {
            this.scanProperty(instance, field);
        }
        this.onStorageFinished({
            classEntity: this.classEntity
        });
    }

    onStorageFinished({classEntity, PropertyEntity}) {
    }

    storageInnerDecorator(target, name) {
        const propertyEntity = new PropertyEntity(name);
        propertyEntity.addAnnotation(this);
        this.applyProperty(propertyEntity);
        this.onStorageFinished({propertyEntity})
    }

    applyProperty(property, extraAnnotations = []) {

        // store property name only using for property annotates
        const name = this.beanPropertyName = property.name;

        // find exist property
        const propertyEntity = this.classEntity.properties.find(p => p.name === name) || new PropertyEntity(name);

        // apply to add new annotates & values
        propertyEntity.initialValue = property.initialValue;
        property.annotations.forEach(annotation => {
            propertyEntity.addAnnotation(annotation);
        });
        extraAnnotations.forEach(annotation => {
            propertyEntity.addAnnotation(annotation);
        });

        // added to class if not exist (added to property set that is auto duplicate removal)
        this.classEntity.addProperty(propertyEntity);
    }

    scanProperty(instance, field) {
        this.applyProperty(new PropertyEntity(field, instance[field]));
    }

    onReturn() {
        return undefined;
    }
}

export {BasicAnnotationDescribe};