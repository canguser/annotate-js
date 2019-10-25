import AnnotationGenerator from "../core/decorator-generator/AnnotationGenerator";
import {Autowired, Bean, Boot, Section, SectionDescribe} from "../core/decorator";

const LogCallMethod = AnnotationGenerator.generate(
    class LogCallMethod extends SectionDescribe {
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
);

@Bean
class Configuration {
    port = 8081;

    @Autowired({beanName: 'HelloWorld', isMapProperty: true})
    sayHello;

    @Autowired({beanName: 'HelloWorld', isMapProperty: true})
    sayHi;

    @Autowired({beanName: 'bootBean', propertyName: 'port', isMapProperty: true})
    syncPort;
}

@Bean
@LogCallMethod
class HelloWorld {

    sayHello() {
        return 'hello express-annotate!';
    }

    sayHi() {
        return 'hi express-annotate!';
    }

    @Section({
        onError({resolve, error}) {
            console.log('thinking for error...');
            if (.5 > Math.random()) {
                resolve(`Get an error: [${error.message}], solution: dress more clothes.`)
            }
        }
    })
    testError() {
        throw new Error('Weather is too cold!');
        return 'nothing happened.'
    }
}


@Boot
class BootApplication {

    @Autowired('Configuration')
    config;

    @Autowired({beanName: 'Configuration', isMapProperty: true})
    port;

    @Autowired({name: 'testError', beanName: 'HelloWorld', isMapProperty: true})
    testError;

    main() {
        console.log(this.config, this.port);
        console.log(this.config.sayHello());
        console.log(this.config.sayHi());
        console.log(this.config.syncPort);
        console.log(this.testError());
    }
}
