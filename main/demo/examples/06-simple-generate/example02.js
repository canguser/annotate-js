import {Annotate, DefaultParam, DynamicParam} from "../../../core/decorator-generator/Annotate";

@Annotate
class MyAnnotate {

    /**
     * 参数区域
     */

    a = 10;

    @DynamicParam
    b({classEntity}){
        return classEntity.name;
    }
}

// 参数 b 的值将会被设置为 'TestClass'
@MyAnnotate
class TestClass {}