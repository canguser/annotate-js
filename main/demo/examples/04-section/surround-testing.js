import {Surround} from "../../../core/decorator/Surround";
import {Annotate, DefaultParam, DynamicParam} from "../../../core/decorator-generator/Annotate";

@Annotate({extends: Surround})
class LogTime {

    @DefaultParam
    @DynamicParam
    logApi({propertyEntity}) {
        return propertyEntity.name;
    }

    before({isGetter, isSetter, annotate}) {
        const suffix = isGetter ? 'Getter' : isSetter ? 'Setter' : 'Method';
        console.time(annotate.params.logApi + '[' + suffix + ']');
    }

    after({lastValue, isGetter, isSetter, annotate}) {
        const suffix = isGetter ? 'Getter' : isSetter ? 'Setter' : 'Method';
        console.timeEnd(annotate.params.logApi + '[' + suffix + ']');
        return lastValue;
    }
}


class A {

    _name;

    @LogTime
    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    @LogTime
    @LogTime('lalala')
    doIt() {
        let i = 0;
        while (i < 10000) {
            i++;
        }
        console.log('do it done');
    }

}

const a = new A();

a.doIt();
console.log(a.name);
a.name = 'hahaha';
console.log(a.name);