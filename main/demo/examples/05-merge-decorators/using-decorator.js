import {DecoratorMerger} from "../../../core/decorator-generator/DecoratorMerger";
import {Autowired, Bean, Boot, Section} from "../../../core/decorator";

@DecoratorMerger({with: [Bean, Section]})
class MyLoggedBean {
    before({origin}) {
        console.log(origin.name + ' called');
    }
}

@MyLoggedBean
class Class1 {
    sayHello() {
        console.log('hello');
    }
}


@Boot
class Application {

    @Autowired
    class1;

    main() {
        this.class1.sayHello();
    }
}