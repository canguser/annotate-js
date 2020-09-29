export class BasicAnnotationDescribe {
    params: Object;
    readonly args: Array<any>;
    readonly targetInstance: Object;
    readonly classEntity: ClassEntity;
    readonly propertyEntity: PropertyEntity;
    readonly targetType: Function;
    readonly beanPropertyName: string;
    readonly isDecoratedClass: boolean;
    readonly isNewStage: boolean;
    readonly isDecoratedProperty: boolean;

    getParams(key: string): any;

    get paramsKeys(): Array<string>;

    get defaultKey(): string;

    onStorageFinished(params: { classEntity: ClassEntity, propertyEntity: PropertyEntity }): void;

    onPropertyDecorated(params: { propertyEntity: PropertyEntity }): void;

    onClassDecorated(params: { classEntity: ClassEntity }): void;

    applyDefaultArgs(): void;

    applyProperty(property: Object, extraAnnotations: Object): void;

    scanProperty(instance: Object, field: string): void;

    onReturn(): any;

}

export class BeanDescribe extends BasicAnnotationDescribe {

    readonly targetBean: Object;
    readonly container: Object;

    createBean(targetType: Function): void;

    proxyRegister(proxy: Object): void;

    wireProperty(proxy: Object): void;

    applySections(proxy: Object): void;

    onCreated(): void;

    beforeCreated(): void;

    get beanName(): string;
}

export class PropertyDescribe extends BasicAnnotationDescribe {
    allowClassWorks: boolean;

    hookProperty(params: { proxy: Object, container: Object }): void;

    onClassBuilt<T extends BeanDescribe>(propertyEntity: PropertyEntity, classDecorator: T): void;
}

export class BootDescribe extends BeanDescribe {
    methodName: string;
}

export class SectionDescribe extends PropertyDescribe {
    priority: number;
}

export class DynamicParamDescribe extends PropertyDescribe {
}

export class DefaultParamDescribe extends PropertyDescribe {
}

export class AnnotateDescribe extends BasicAnnotationDescribe {
    declareDecorator(): void;

    applyPropertyAnnotates(propertyMap: Object): void;
}

export class DecoratorMergerDescribe extends BasicAnnotationDescribe {
    mergeDecorators(): void;
}

export class AutowiredDescribe extends PropertyDescribe {
    beanName: string;
    propertyName: string;
    isMapProperty: boolean;
}

export class EnergyWireDescribe extends PropertyDescribe {
    usingEnergy: boolean;
}

export class ClassEntity extends HasAnnotations {
    readonly name: string;

    readonly classType: Function;

    get propertyAnnotations(): Array<Object>;

    get properties(): Array<PropertyEntity>;

    addProperty(property: PropertyEntity): void;

    getProperty(propertyName: string): PropertyEntity;
}


export class PropertyEntity extends HasAnnotations {
    readonly name: string;
    readonly initialValue: any;
    readonly descriptor: Object;
}


export class HasAnnotations {
    getAnnotationsByType<T extends BasicAnnotationDescribe>(type: Function): Array<T>

    findAnnotationByType<T extends BasicAnnotationDescribe>(type: Function): T;

    getAnnotationsByDescribe<T extends BasicAnnotationDescribe>(describe: T, ...moreDescribes: Array<T>): Array<T>

    findAnnotationByDescribe<T extends BasicAnnotationDescribe>(describe: T, ...moreDescribes: Array<T>): Array<T>

    addAnnotation<T extends BasicAnnotationDescribe>(annotation: T): void

    removeAnnotation<T extends BasicAnnotationDescribe>(annotation: T): void

    hasAnnotations(type: Function): boolean

    get annotations(): Array<BasicAnnotationDescribe>;
}