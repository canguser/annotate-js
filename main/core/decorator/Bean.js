import {BasicAnnotationDescribe} from "../decorator-generator/BasicAnnotationDescribe";
import BasicBeanContainer from "../container/BasicBeanContainer";
import SimpleFactory from "../factory/SimpleFactory";
import ProxyHandlerRegister from "../register/ProxyHandlerRegister";
import AnnotationGenerator from "../decorator-generator/AnnotationGenerator";
import AnnotationUtils from "../utils/AnnotationUtils";
import {Section} from "./Section";
import {Property} from "./Property";
import SectionMethodBuilder from "../builder/SectionMethodBuilder";

class BeanDescribe extends BasicAnnotationDescribe {

    targetBean;
    container;

    constructor() {
        super();
        Object.assign(this.params, {
            name: '',
            isSectionSurround: true,
            containerType: BasicBeanContainer
        })
    }

    onClassDecorated({classEntity}) {
        super.onClassDecorated({classEntity});
        this.createBean(this.targetType);
    }

    createBean(targetType) {
        const name = this.beanName;
        const proxyRegister = new ProxyHandlerRegister();
        const container = this.container = SimpleFactory.getInstance(this.getParams('containerType'));
        this.targetBean = container.getBean(name);
        if (!(this.targetBean && this.targetBean.constructor === targetType)) {
            this.proxyRegister(proxyRegister);
            const proxyInstance = new Proxy(this.targetInstance, proxyRegister.export());
            container.setBean(name, proxyInstance);
            this.targetBean = proxyInstance;
        }
        this.invokeProperties();
    }

    proxyRegister(proxy) {
        this.wireProperty(proxy);
        this.applySections(proxy);
    }

    wireProperty(proxy) {
        for (let field of AnnotationUtils.getPropertyNames(this.targetInstance)) {
            const propertyEntity = AnnotationUtils.getPropertyEntity(this.targetInstance, field);
            if (propertyEntity) {
                propertyEntity.getAnnotationsByType(Property).forEach(property => {
                    property.hookProperty({
                        proxy: {
                            register(...args) {
                                return proxy.registerProperty(property.beanPropertyName, ...args);
                            },
                            getOriginProxy() {
                                return proxy;
                            }
                        }, container: this.container
                    });
                });
            }
        }
    }

    applySections(proxy) {
        // get function
        proxy.register('get',
            (args, {next}) => {
                const [target, property, rec] = args;
                const origin = Reflect.get(...args);
                const propertyEntity = AnnotationUtils.getPropertyEntity(target, property);
                if (typeof origin === 'function' && propertyEntity && propertyEntity.hasAnnotations(Section)) {
                    const builder = new SectionMethodBuilder(propertyEntity, target);
                    if (!this.getParams('isSectionSurround')) {
                        return builder.build().bind(rec);
                    }
                    return builder.isSurroundSection().build().bind(rec);
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
                const builder = new SectionMethodBuilder(propertyEntity, target).setOriginMethod(get_value);
                if (!this.getParams('isSectionSurround')) {
                    return builder.build().bind(rec)(value);
                }
                return builder.isSurroundSection().build().bind(rec)(value);
            } else {
                next();
            }
        })
    }

    invokeProperties() {

        // get all annotates of properties sort by priority
        const allPropertyAnnotates = AnnotationUtils.flat(
            AnnotationUtils.getPropertyNames(this.targetInstance)
                .map(field => {
                    const propertyEntity = AnnotationUtils.getPropertyEntity(this.targetInstance, field);
                    if (propertyEntity) {
                        return (propertyEntity.getAnnotationsByType(Property) || []).map(annotate => ({
                            annotate, propertyEntity
                        }));
                    }
                    return [];
                }), 2)
            .sort((a, b) => {
                return b.annotate.getParams('priority') - a.annotate.getParams('priority')
            });


        // call each annotate
        allPropertyAnnotates.forEach(({annotate, propertyEntity}) => {
            annotate.onClassBuilt(propertyEntity, this);
        });

        console.log(`Decorator type [${this.constructor.name}] works on the bean [${this.beanName}]`)

        this.onCreated();
    }

    /**
     * when the bean created, the property annotate is all ready
     */
    onCreated() {
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