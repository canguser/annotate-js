import AnnotationGenerator from "../../../core/decorator-generator/AnnotationGenerator";
import {Autowired, Bean, BeanDescribe, Boot} from "../../../core/decorator";

const {SectionDescribe} = require("../../../index");

const LogCallMethod = AnnotationGenerator.generate(
    BeanDescribe, [class LogCallMethod extends SectionDescribe {
        constructor() {
            super();
            this.params.before = ({origin}) => {
                console.log(origin.name, ' logged called');
            }
        }
    }]
);

@LogCallMethod
class DoTest {
    test01() {
        console.log('haha');
    }
}

@Boot
class boot {
    @Autowired
    doTest;

    main() {
        this.doTest.test01();
    }
}