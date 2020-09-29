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
    DefaultParamDescribe,
    PropertyEntity,
    ClassEntity,
    HasAnnotations
} from "./describe";

export class AnnotationGenerator {
    static generate(describe: Function, impls?: Array<Function>): Function
}

export class AnnotationUtils {
}

export class BasicBeanContainer {
}

export class BasicScanner {
    scan(urls: Array<string>): void;

    setContext(context: string): BasicScanner;

    showLogs(): BasicScanner;
}

export class Injector {
    inject(params, isLocal?: false): Injector;

    injectKeyValue(key, value, isLocal?: false): Injector;

    injectLocalKeyValue(key, value): Injector;

    injectLocal(params): Injector;

    result(): Object;
}


export class ProxyHandlerRegister {
}

export class SimpleFactory {
}