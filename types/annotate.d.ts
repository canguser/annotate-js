import {BasicAnnotationDescribe} from "./describe";

export function Annotate<T extends BasicAnnotationDescribe>(params?: {
    name?: string;
    defaultParam?: string;
    extends?: T | Function
} | string): void;

export function Bean(params?: {
    name?: string;
    args?: Array<Object>;
    isSectionSurround?: true;
    containerType?: Function;
} | string): void ;

export function Autowired(params?: {
    name?: string;
    beanName?: string;
    isMapProperty?: boolean;
    propertyName?: string;
} | string): void ;

export function Section<T extends BasicAnnotationDescribe>(params?: {
    after?: (
        params: {
            origin?: Function,
            params?: Object,
            annotations?: Array<T>,
            propertyEntity?: Object,
            lastOrigin?: Function,
            lastValue?: any,
            isGetter: boolean,
            isSetter: boolean,
            annotate: T
        }
    ) => any;
    before?: (
        params: {
            origin?: Function,
            params?: Object,
            annotations?: Array<T>,
            propertyEntity?: Object,
            lastOrigin?: Function,
            isGetter: boolean,
            isSetter: boolean,
            annotate: T
        }
    ) => void;
    onError?: (
        params: {
            error?: Object,
            resolve?: Function,
        }
    ) => any;

} | number): void ;

export function Surround<T extends BasicAnnotationDescribe>(
    params?: {
        after?: (
            params: {
                origin?: Function,
                params?: Object,
                annotations?: Array<T>,
                propertyEntity?: Object,
                lastOrigin?: Function,
                lastValue?: any,
                isGetter: boolean,
                isSetter: boolean,
                annotate: T
            }
        ) => any;
        before?: (
            params: {
                origin?: Function,
                params?: Object,
                annotations?: Array<T>,
                propertyEntity?: Object,
                lastOrigin?: Function,
                isGetter: boolean,
                isSetter: boolean,
                annotate: T
            }
        ) => void;
        onError?: (
            params: {
                error?: Object,
                resolve?: Function,
            }
        ) => any;
    } | Function
): void;

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
} | string): void ;

export function DecoratorMerger(params?: {
    with?: Array<Function>
} | Array<Function>): void ;

export function DefaultParam(): void ;

export function DynamicParam(): void ;