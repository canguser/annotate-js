export {
    Annotate,
    Bean,
    Autowired,
    Section,
    Boot,
    Property,
    EnergyWire,
    DecoratorMerger,
    DefaultParam,
    DynamicParam
} from "./annotate";

export {
    BeanDescribe,
    AnnotateDescribe,
    AutowiredDescribe,
    SectionDescribe,
    BootDescribe,
    BasicAnnotationDescribe,
    PropertyDescribe,
    EnergyWireDescribe,
    DecoratorMergerDescribe,
    DynamicParamDescribe,
    DefaultParamDescribe
} from "./describe";

export class AnnotationGenerator {
    generate: (describe: Function, impls: Array<Function>) => Function
}

export class AnnotationUtils {
}

export class BasicBeanContainer {
}

export class BasicScanner {
}

export class Injector {
}


export class ProxyHandlerRegister {
}


export class ClassEntity {
}


export class PropertyEntity {
}


export class HasAnnotations {
}

export class SimpleFactory {
}