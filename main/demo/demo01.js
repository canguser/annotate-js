import AnnotationGenerator from "../core/decorator-generator/AnnotationGenerator";
import {Autowired, Bean, BeanDescribe, Boot, Section, SectionDescribe} from "../core/decorator";
import {EnergyWire} from "../core/decorator/EnergyWire";

class LogCallMethodDescribe extends SectionDescribe {
    constructor() {
        super();
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

const LoggedBean = AnnotationGenerator.generate(BeanDescribe,[LogCallMethodDescribe]);

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

    main() {
        console.log(this.config, this.port);
        console.log(this.config.sayHello());
        console.log(this.config.sayHi());
        console.log(this.config.syncPort);
        console.log(this.testError());
    }
}
