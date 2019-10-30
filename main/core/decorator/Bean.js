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
            isSectionSurround: true,
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
            return {beforeList, afterList, isAsync: sections.find(s => s.getParams('isAsync')), sections};
        };
        const dealError = ({error, sections}) => {
            // DO Responsibility chain
            let isSolved = false;
            let result;
            const params = {
                resolve(res) {
                    isSolved = true;
                    result = res;
                }, error
            };
            // more priority, more execute
            sections = [...sections];
            sections.reverse();
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
                                return new Promise(resolve => resolve(this::origin(...args)));
                            })
                            .then(returnValue => {
                                const returnValueStack = [returnValue];
                                return AnnotationUtils.executeAsyncInQueue(afterList, {
                                    params: baseParams, context: this, returnValueStack
                                })
                            }).catch(error => {
                                return dealError({error, sections});
                            })
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
                    return dealError({error, sections});
                }
            };

        const getHookedMethod = ({section, origin, propertyEntity, isAsync, lastOrigin}) => {
            if (typeof origin !== 'function') {
                return origin;
            }
            const before = section.getParams('before');
            const after = section.getParams('after');
            const onError = section.getParams('onError');

            if (section.isAsync || isAsync) {
                return function (...args) {
                    const baseParams = {
                        origin, params: args, annotations: propertyEntity.annotations, propertyEntity, lastOrigin
                    };
                    let result = new Promise(resolve => {
                        resolve(this::before(baseParams))
                    }).then(() => {
                        return this::lastOrigin(...args);
                    });
                    if (after) {
                        result = result.then(returnValue => {
                            return this::after({...baseParams, lastValue: returnValue})
                        });
                    }
                    return result.catch(error => {
                        let isSolved = false;
                        let message = '';
                        const resolve = (msg) => {
                            message = msg;
                            isSolved = true;
                        };
                        return Promise.resolve(this::onError({error, resolve}))
                            .then(solution => {
                                if (!isSolved) {
                                    throw error;
                                }
                                return message || solution;
                            });
                    })
                }
            }
            return function (...args) {
                try {
                    const baseParams = {
                        origin, params: args, annotations: propertyEntity.annotations, propertyEntity, lastOrigin
                    };
                    this::before(baseParams);
                    let returnValue = this::lastOrigin(...args);
                    if (after) {
                        returnValue = this::after({...baseParams, lastValue: returnValue});
                    }
                    return returnValue;
                } catch (error) {
                    let isSolved = false;
                    let message = '';
                    const resolve = (msg) => {
                        message = msg;
                        isSolved = true;
                    };
                    const result = this::onError({error, resolve});
                    if (!isSolved) {
                        throw error;
                    }
                    return message || result;
                }
            }
        };

        const buildSurroundMethod = ({origin, sections, propertyEntity}) => {
            sections = [...sections];
            const isAsync = !!sections.find(s => s.getParams('isAsync'));
            sections.sort((a, b) => {
                return b.priority - a.priority
            });
            return function (...args) {
                return sections.reduce((lastMethod, section) => getHookedMethod({
                    section, lastOrigin: lastMethod, propertyEntity, isAsync, origin
                }), origin).bind(this)(...args);
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
                    if (this.getParams('isSectionSurround')) {
                        return rec::buildSurroundMethod({sections, origin, propertyEntity});
                    }
                    const actionMap = getSectionAction(sections, origin);
                    return rec::buildHookFunction({...actionMap, origin, propertyEntity});
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
                if (this.getParams('isSectionSurround')) {
                    return rec::buildSurroundMethod({sections, origin: get_value, propertyEntity})(value);
                }
                const actionMap = getSectionAction(sections, get_value);
                return rec::buildHookFunction({...actionMap, origin: get_value, propertyEntity})(value);
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