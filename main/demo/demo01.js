import AnnotationGenerator from "../core/decorator-generator/AnnotationGenerator";
import {Autowired, Bean, BeanDescribe, Boot, Section, SectionDescribe} from "../core/decorator";
import {EnergyWire} from "../core/decorator/EnergyWire";
import AnnotationUtils from "../core/utils/AnnotationUtils";

class LogCallMethodDescribe extends SectionDescribe {
    constructor() {
        super();
        this.params.priority = 0;
        this.params.before = ({origin}) => {
            console.log(origin.name, 'called');
        };
        this.params.onError = ({resolve, error}) => {
            resolve('Some thing went wrong, ' + error.message);
        }
    }
}

const LogCallMethod = AnnotationGenerator.generate(
    LogCallMethodDescribe
);

const LoggedBean = AnnotationGenerator.generate(BeanDescribe, [LogCallMethodDescribe]);


@Bean
class Configuration {
    port = 8081;

    @Autowired({beanName: 'HelloWorld', isMapProperty: true})
    sayHello;

    @Autowired({beanName: 'HelloWorld', isMapProperty: true})
    sayHi;

    @EnergyWire('bootBean.port')
    syncPort;
}

// @Bean
// @LogCallMethod
@LoggedBean
class HelloWorld {


    sayHello() {
        return 'hello express-annotate!';
    }

    sayHi() {
        return 'hi express-annotate!';
    }

    @Section({
        after({lastValue}) {
            console.log(lastValue);
            return lastValue + 100
        }
    })
    a = 1000;

    @Section({
        onError({resolve, error}) {
            console.log('thinking for error...');
            if (.5 > Math.random()) {
                resolve(`Get an error: [${error.message}], solution: dress more clothes.`)
            }
        }
    })
    testError() {
        console.log(this);
        console.log(this.sayHi(), this.a);
        throw new Error('Weather is too cold!');
        return 'nothing happened.'
    }
}


@Boot
class BootApplication {

    @Autowired('Configuration')
    config;

    @EnergyWire('Configuration')
    port;

    @EnergyWire('HelloWorld')
    testError;

    @EnergyWire('AsyncTest')
    getId;


    main() {
        console.log(this.config, this.port);
        console.log(this.config.sayHello());
        console.log(this.config.sayHi());
        console.log(this.config.syncPort);
        console.log(this.testError());
        console.time('async test');
        this.getId().then(v => {
            console.log(v);
            console.timeEnd('async test');
        })
    }
}

const a = new HelloWorld();

console.log(a.testError());


// @Bean
@LoggedBean
class AsyncTest {

    @Section({
        after({lastValue}) {
            return lastValue + ' error?'
        },
        onError({resolve, error}) {
            resolve('get a error1234?')
        }
    })
    @Section({
        isAsync: true,
        priority: 2,
        before({params}) {
            return AnnotationUtils.wait({ms: 1000});
        },
        after({lastValue}) {
            return AnnotationUtils.wait({ms: 2000}).then(() => lastValue + ' - test successfully.');
        },
        onError({resolve, error}) {
            resolve('get a error?')
        }
    })
    getId() {
        // throw new Error('asdasd');
        return 'do test';
    }
}