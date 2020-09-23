export function Annotate(params?: {
    name?: string;
    defaultParam?: string;
    extends?: Function
} | string): void;

export function Bean(params?: {
    name?: string;
    args?: Array<Object>;
    isSectionSurround?: boolean;
    containerType?: Function;
} | string): void ;

export function Autowired(params?: {
    name?: string;
    beanName?: string;
    isMapProperty?: boolean;
    propertyName?: string;
} | string): void ;

export function Section(params?: {
    after?: (
        params: {
            origin?: Function,
            params?: Object,
            annotations?: Array<Object>,
            propertyEntity?: Object,
            lastOrigin?: Function,
            lastValue?: Object
        }
    ) => Object;
    before?: (
        params: {
            origin?: Function,
            params?: Object,
            annotations?: Array<Object>,
            propertyEntity?: Object,
            lastOrigin?: Function,
        }
    ) => void;
    onError?: (
        params: {
            error?: Object,
            resolve?: Function,
        }
    ) => Object;
} | number): void ;

export function Boot(params?: {
    name?: string;
    args?: Array<Object>;
    isSectionSurround?: boolean;
    containerType?: Function;
    methodName?: string;
} | string): void ;

export function Property(params?: {
    priority?: number
} | number): void ;

export function EnergyWire(params?: {
    name?: string;
    beanName?: string;
    propertyName?: string;
}): void ;

export function DecoratorMerger(params?: {
    with?: Array<Function>
} | Array<Function>): void ;

export function DefaultParam(): void ;
export function DynamicParam(): void ;