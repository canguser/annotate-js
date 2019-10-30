import {BasicAnnotationDescribe} from "../decorator-generator/BasicAnnotationDescribe";
import BasicBeanContainer from "../container/BasicBeanContainer";
import SimpleFactory from "../factory/SimpleFactory";
import ProxyHandlerRegister from "../register/ProxyHandlerRegister";
import AnnotationGenerator from "../decorator-generator/AnnotationGenerator";
import AnnotationUtils from "../utils/AnnotationUtils";
import {Section} from "./Section";
import {Property} from "./Property";

class BeanDescribe extends BasicAnnotationDescribe {

    constructor() {
        super();
        Object.assign(this.params, {
            name: '',
            args: [],
            containerType: BasicBeanContainer
        })
    }

    storageClassDecorator(targetType) {
        super.storageClassDecorator(targetType);
        this.createBean(targetType);
    }

    createBean(targetType) {
        this.targetType = targetType;
        const name = this.beanName;
        this.originInstance = new targetType(...this.getParams('args'));
        const proxyRegister = new ProxyHandlerRegister();
        const container = this.container = SimpleFactory.getInstance(this.getParams('containerType'));
        this.targetBean = container.getBean(name);
        if (!(this.targetBean && this.targetBean.constructor === targetType)) {
            this.proxyRegister(proxyRegister);
            const proxyInstance = new Proxy(this.originInstance, proxyRegister.export());
            container.setBean(name, proxyInstance);
            this.targetBean = proxyInstance;
        }
        this.onCreated();
    }

    proxyRegister(proxy) {
        this.wireProperty(proxy);
        this.applySections(proxy);
    }

    wireProperty(proxy) {
        for (let field of AnnotationUtils.getPropertyNames(this.originInstance)) {
            const propertyEntity = AnnotationUtils.getPropertyEntity(this.originInstance, field);
            if (propertyEntity) {
                propertyEntity.getAnnotationsByType(Property).forEach(property => {
                    property.hookProperty({proxy, container: this.container});
                });
            }
        }
    }

    applySections(proxy) {
        const getSectionAction = (sections = [], origin) => {
            const beforeList = [];
            const afterList = [];
            sections = [...sections];
            sections.sort((a, b) => {
                return a.priority - b.priority;
            });
            for (let section of sections) {
                if (typeof origin === 'function') {
                    beforeList.push(section.getParams('before'));
                    const after = section.getParams('after');
                    if (after) {
                        afterList.push(after);
                    }
                }
            }
            return {beforeList, afterList, isAsync: sections.find(s => s.getParams('isAsync'))};
        };
        const buildHookFunction =
            ({beforeList, afterList, propertyEntity, sections, origin, isAsync}) => function (...args) {
                try {
                    const baseParams = {
                        origin, params: args, annotations: propertyEntity.annotations, propertyEntity
                    };
                    if (isAsync) {
                        return AnnotationUtils.executeAsyncInQueue(beforeList, {params: baseParams, context: this})
                            .then(() => {
                                return Promise.resolve(this::origin(...args));
                            })
                            .then(returnValue => {
                                const returnValueStack = [returnValue];
                                return AnnotationUtils.executeAsyncInQueue(afterList, {
                                    params: baseParams, context: this, returnValueStack
                                })
                            });
                    }
                    beforeList.forEach(before => {
                        this::before(baseParams);
                    });
                    const returnValue = this::origin(...args);
                    const returnValueStack = [returnValue];
                    return afterList.reduce((last, after) => {
                        returnValueStack.push(last);
                        return this::after({
                            ...baseParams, returnValueStack,
                            lastValue: returnValueStack[returnValueStack.length - 1]
                        });
                    }, returnValue);
                } catch (error) {
                    // DO Responsibility chain
                    let isSolved = false;
                    let result;
                    const params = {
                        resolve(res) {
                            isSolved = true;
                            result = res;
                        }, error
                    };
                    for (const section of sections) {
                        const errorHandler = section.getParams('onError');
                        section::errorHandler(params);
                        if (isSolved) {
                            break;
                        }
                    }
                    if (!isSolved) {
                        throw error;
                    }
                    return result;
                }
            };

        // get function
        proxy.register('get',
            (args, {next}) => {
                const [target, property, rec] = args;
                const origin = Reflect.get(...args);
                const propertyEntity = AnnotationUtils.getPropertyEntity(target, property);
                if (typeof origin === 'function' && propertyEntity && propertyEntity.hasAnnotations(Section)) {
                    const sections = propertyEntity.getAnnotationsByType(Section);
                    const actionMap = getSectionAction(sections, origin);
                    return rec::buildHookFunction({...actionMap, origin, propertyEntity, sections});
                } else {
                    next();
                }
            }
        );

        // get other
        proxy.register('get', (args, {next}) => {
            const [target, property, rec] = args;
            const value = Reflect.get(...args);
            const get_value = v => v;
            const propertyEntity = AnnotationUtils.getPropertyEntity(target, property);
            if (propertyEntity && propertyEntity.hasAnnotations(Section)) {
                const sections = propertyEntity.getAnnotationsByType(Section);
                const actionMap = getSectionAction(sections, get_value);
                return rec::buildHookFunction({...actionMap, origin: get_value, propertyEntity, sections})(value);
            } else {
                next();
            }
        })
    }

    onCreated() {
        // console.log(`Decorator type [${this.constructor.name}] works on the bean [${this.beanName}]`)
        for (let field of AnnotationUtils.getPropertyNames(this.originInstance)) {
            const propertyEntity = AnnotationUtils.getPropertyEntity(this.originInstance, field);
            if (propertyEntity) {
                propertyEntity.getAnnotationsByType(Property).forEach(property => {
                    property.onClassBuilt(propertyEntity, this);
                });
            }
        }
        // to be override
    }

    get beanName() {
        return this.getParams('name') || this.targetType.name;
    }

    onReturn() {
        // override
        const proxyRegister = new ProxyHandlerRegister();
        proxyRegister.register('construct', () => this.targetBean);
        return new Proxy(this.targetType, proxyRegister.export());
    }

}

const Bean = AnnotationGenerator.generate(BeanDescribe);

export {BeanDescribe, Bean};