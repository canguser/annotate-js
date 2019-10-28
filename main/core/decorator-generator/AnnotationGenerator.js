import {BasicAnnotationDescribe} from "./BasicAnnotationDescribe";
import AnnotationUtils from "../utils/AnnotationUtils";

export default class AnnotationGenerator {
    static generate(describe, impls = []) {
        const resultDecorator = (...args) => {
            const dec = new describe();
            impls = impls.map(impl => new impl());
            const decorators = [...impls, dec];

            if (AnnotationUtils.flagDecoratorByParams(args).isCustomParams) {
                return (...innerArgs) => {
                    return decorators.reduce((last, decorator) => {
                        if (decorator instanceof BasicAnnotationDescribe) {
                            return decorator.export(...args)(...innerArgs);
                        }
                    }, null)
                }
            }

            return decorators.reduce((last, decorator) => {
                if (decorator instanceof BasicAnnotationDescribe) {
                    return decorator.export(...args)(...args);
                }
            }, null)
        };
        resultDecorator.describeTypes = [describe,...impls];
        return resultDecorator;
    }
}