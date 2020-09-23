import {BeanDescribe, Boot, EnergyWire, SectionDescribe} from "../../../core/decorator";
import {Annotate, DefaultParam, DynamicParam} from "../../../core/decorator-generator/Annotate";

// 申明一个注解 ConfigurableBean 该注解继承了 BeanDescribe 也就是 @Bean
// 通过在定义成员变量改变其参数
@Annotate({extends: BeanDescribe})
class ConfigurableBean {

    // 将 args 设为默认参数，并且默认值为 [1,3,4]
    @DefaultParam
    args = [1, 3, 4];

    // 将 name 参数改为动态参数，所谓动态参数是通过一个方法，动态得到结果，这里是动态获取被装饰的 Class 的 name 并且将 Bean 参数的 name 值小写
    @DynamicParam
    name({classEntity}) {
        return classEntity.name.toLowerCase();
    }

}

@Annotate({extends: SectionDescribe})
class ParamsAppendMethodName {

    // 动态使被该注解装饰后的方法被调用时，将第一个参数加上含方法名的后缀
    @DynamicParam
    before({propertyEntity}) {
        return ({params}) => {
            params[0] = params[0] + ' - from method: ' + propertyEntity.name;
        }
    }
}

@ConfigurableBean // 测试默认值
class TestBean {
    constructor(...args) {
        this.args = args;
    }
}

@ConfigurableBean([3, 4, 5]) // 测试默认参数是否为 args
class TestBean1 {
    constructor(...args) {
        this.args = args;
    }

    @ParamsAppendMethodName // 测试方法参数是否添加了含方法名的后缀
    sayHello(word) {
        console.log('hello', word);
    }
}


@Boot
class Application {

    /**
     * 动态注入参数及方法
     */

    @EnergyWire('TestBean')
    args;

    @EnergyWire('TestBean1.args')
    args1;

    @EnergyWire('TestBean1')
    sayHello;

    main() {
        console.log(this.args);
        console.log(this.args1);
        this.sayHello('world');
    }
}