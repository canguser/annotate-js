import {BeanDescribe, Boot, EnergyWire, SectionDescribe} from "../../../core/decorator";
import {Annotate, DefaultParam, DynamicParam} from "../../../core/decorator-generator/Annotate";

@Annotate({extends: BeanDescribe})
class ConfigurableBean {

    @DefaultParam
    args = [1, 3, 4];

    @DynamicParam
    name({classEntity}) {
        return classEntity.name.toLowerCase();
    }

}

@Annotate({extends: SectionDescribe})
class ParamsAppendMethodName {
    @DynamicParam
    before({propertyEntity}) {
        return ({params}) => {
            params[0] = params[0] + ' - from method: ' + propertyEntity.name;
        }
    }
}

@ConfigurableBean
class TestBean {
    constructor(...args) {
        this.args = args;
    }
}

@ConfigurableBean([3, 4, 5])
class TestBean1 {
    constructor(...args) {
        this.args = args;
    }

    @ParamsAppendMethodName
    sayHello(word) {
        console.log('hello', word);
    }
}


@Boot
class Application {

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