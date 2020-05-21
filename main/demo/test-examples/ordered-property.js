import {Bean, Boot} from "../../core/decorator";
import {OrderedProperty} from "./annotate";

@Bean
class Test01 {

    @OrderedProperty
    test01(order) {
        console.log('test01', order);
    }

    @OrderedProperty(2)
    test02(order) {
        console.log('test02', order);
    }

    @OrderedProperty(8)
    test03(order) {
        console.log('test03', order);
    }

    @OrderedProperty(4)
    test04(order) {
        console.log('test04', order);
    }

    @OrderedProperty(-1)
    test05(order) {
        console.log('test05', order);
    }

}

@Boot
class TestBoot {
    main() {
        console.log('booted');
    }
}