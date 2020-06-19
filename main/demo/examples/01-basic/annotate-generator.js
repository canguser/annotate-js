import {BeanDescribe, PropertyDescribe, Boot, AnnotationGenerator} from "../../../index";

class MyBeanDescribe extends BeanDescribe {

    constructor() {
        super();
        Object.assign(this.params, {
            // 这里可以对注解的默认参数进行添加或修改
        });
    }

    onCreated() {
        super.onCreated();
        // 当该注解标记的 class 以及内部的 property 初始化完成后
    }

    /**
     * 注册 Proxy
     * @param proxy 用途如下所示
     */
    proxyRegister(proxy) {
        super.proxyRegister(proxy);
        // 这是使用 proxy 去注册时，是处于 proxy chain 的最后，如果前面的所有相关 proxy 都调用了 next 才能执行到这里
        proxy.register('get', ([...args], {next}) => {
            if (!Reflect.get(...args)) {
                return 'Hello Proxy';
            }
            next() // 必须调用 next 否则所有非空属性都会返回空
        })
    }


}

class MyPropertyDescribe extends PropertyDescribe {

    constructor() {
        super();
        Object.assign(this.params, {
            // 这里可以对注解的默认参数进行添加或修改
            tip: ''
        });
    }

    /**
     * 该方法对应每个被注解的 property
     * @param proxy 是一个注册器，实际用法参考如下代码
     * @param container{BasicBeanContainer} 是保存所有 bean 的容器，通过 bean name 可以获取到所有 bean
     */
    hookProperty({proxy, container}) {
        super.hookProperty({proxy, container});

        proxy.register('get', ([target, property, receiver], {next}) => {
            // 在这里劫持该 property 的 get 方法，用法于 Proxy 类似

            // 获取真实的属性值, 也就是你声明的值
            const realValue = Reflect.get(target, property, receiver);

            const params = this.params;

            if (typeof realValue === 'function') {
                // 如果真实属性是个函数, 则将该注解的参数注入到该函数中
                return function (args = {}) {
                    args.annotateParams = params;
                    return realValue.bind(this)(args);
                }
            }

            next(); // 如果不符合条件则交由下一个 register 的 get 处理
        });
    }

    /**
     * 该方法在属性所属的 class 完全生成后执行
     * 可以在这里执行一些需要在 class 生成后需要做的事
     * 或者获取 Bean 注解的一些属性
     * @param propertyEntity{PropertyEntity} 属性对象，见 /main/core/entities/PropertyEntity
     * @param classDecorator{BeanDescribe} 属性对应的 class 所被注解标记的注解描述
     */
    onClassBuilt(propertyEntity, classDecorator) {
        super.onClassBuilt(propertyEntity, classDecorator);
        // TO be override.
    }

}

const MyBean = AnnotationGenerator.generate(MyBeanDescribe);
const MyProperty = AnnotationGenerator.generate(MyPropertyDescribe);


@Boot
@MyBean
class BootEntry {

    finalProxyValue;

    @MyProperty({tip: 'Testing My Property'})
    test({annotateParams: {tip}}) {
        console.log(tip);
        return tip;
    }

    main() {
        // 入口
        // 注意这里没有传入 annotateParams 和 tip 参数
        const result = this.test(); // output: `Testing My Property`
        console.assert(result === 'Testing My Property');
        console.assert(this.finalProxyValue === 'Hello Proxy');
    }
}