import {BasicAnnotationDescribe} from "./BasicAnnotationDescribe";
import AnnotationUtils from "../utils/AnnotationUtils";

const runDecorators = (describe, impls, args, innerArgs) => {
    const dec = new describe();
    impls = impls.map(impl => new impl());
    const decorators = [dec, ...impls];
    return decorators.reduce((last, decorator) => {
        if (decorator instanceof BasicAnnotationDescribe) {
            let result = decorator.export(...args)(...innerArgs);
            last = last || result;
        }
        return last;
    }, null);
};

export default class AnnotationGenerator {
    static generate(describe, impls = []) {
        const resultDecorator = (...args) => {
            if (AnnotationUtils.flagDecoratorByParams(args).isCustomParams) {
                return (...innerArgs) => {
                    return runDecorators(describe, impls, args, innerArgs);
                }
            }
            return runDecorators(describe, impls, args, args);
        };
        resultDecorator.describeTypes = [describe, ...impls];
        return resultDecorator;
    }
}