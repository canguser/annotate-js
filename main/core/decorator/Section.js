import AnnotationGenerator from "../decorator-generator/AnnotationGenerator";
import {PropertyDescribe} from "./Property";
import SectionMethodBuilder from "../builder/SectionMethodBuilder";

class SectionDescribe extends PropertyDescribe {

    constructor() {
        super();
        Object.assign(this.params, {
            after: undefined,
            before: () => undefined,
            onError: () => undefined,
            isAsync: false,
            independent: false,
            priority: 0
        });
    }

    get priority() {
        return this.getParams('priority');
    }

    getHookedMethod({origin}) {
        return SectionMethodBuilder.getHookedMethod({
            section: this, lastOrigin: origin, propertyEntity: this.propertyEntity
        })
    }

    onReturnForClass() {
        // todo surround all property
    }

    onReturn() {
        if (!this.params.independent) {
            return undefined;
        }
        if (this.isDecoratedProperty) {
            const descriptor = this.propertyEntity.descriptor;
            if ('value' in descriptor && typeof descriptor.value === 'function') {
                return Object.assign(descriptor, {
                    value: this.getHookedMethod({origin: descriptor.value})
                });
            }

            if ('set' in descriptor) {
                Object.assign(descriptor, {
                    set: this.getHookedMethod({origin: descriptor.set})
                });
            }

            if ('get' in descriptor) {
                Object.assign(descriptor, {
                    get: this.getHookedMethod({origin: descriptor.get})
                });
            }

            return descriptor;
        }
        return this.onReturnForClass();
    }

}

const Section = AnnotationGenerator.generate(SectionDescribe);

export {SectionDescribe, Section};