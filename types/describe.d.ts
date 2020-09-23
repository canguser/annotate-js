export class BasicAnnotationDescribe {
    params: Object;
    getParams: (key: string) => Object;
    paramsKeys: Array<string>;
    defaultKey: string;
    export: (...args: Array<Object>) => Object;
    onDecorate: (...args: Array<Object>) => Object;
    storageClassDecorator: (targetType: Function) => void;
    storageInnerDecorator: (target: Function, name: string) => void;
    onStorageFinished: (params: { classEntity: Object, PropertyEntity: Object }) => void;
    applyDefaultArgs: () => void;
    applyProperty: (property: Object, extraAnnotations: Object) => void;
    scanProperty: (instance: Object, field: string) => void;
    onReturn: () => Object;
}

export class BeanDescribe extends BasicAnnotationDescribe {
    createBean: (targetType: Function) => void;
    proxyRegister: (proxy: Object) => void;
    wireProperty: (proxy: Object) => void;
    applySections: (proxy: Object) => void;
    onCreated: () => void;
    beanName: string;
}

export class PropertyDescribe extends BasicAnnotationDescribe {
    allowClassWorks: boolean;
    hookProperty: (params: { proxy: Object, container: Object }) => void;
    onClassBuilt: (propertyEntity: Object, classDecorator: Object) => void;
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
    declareDecorator: () => void;
    applyPropertyAnnotates: (propertyMap: Object) => void;
}

export class DecoratorMergerDescribe extends BasicAnnotationDescribe {
    mergeDecorators: () => void;
}

export class AutowiredDescribe extends PropertyDescribe {
    beanName: string;
    propertyName: string;
    isMapProperty: boolean;
}

export class EnergyWireDescribe extends PropertyDescribe {
    usingEnergy: boolean;
}