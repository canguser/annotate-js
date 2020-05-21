import Constants from "./Constants";

const STORAGE_SYMBOL_MAP = {};

export default class AnnotationUtils {

    static getClassEntity(instance) {
        const {CLASS_STORAGE, CLASS_ENTITY} = Constants;
        const prototype = Object.getPrototypeOf(instance);
        const classStorageField = this.getUniqueField(CLASS_STORAGE)
        let storage = prototype[classStorageField];
        if (!storage) {
            storage = {};
            prototype[classStorageField] = storage;
        }
        return storage[CLASS_ENTITY];

    }

    static getPropertyEntity(instance, property) {
        const classEntity = this.getClassEntity(instance);
        // console.log(classEntity);
        return classEntity && classEntity.getProperty(property);
    }

    static applyClassEntity(target, classEntity) {
        const {CLASS_STORAGE, CLASS_ENTITY} = Constants;
        const storage = this.getTargetStorage(target, CLASS_STORAGE);
        storage[CLASS_ENTITY] = classEntity;
    }

    static getUniqueField(field) {
        if (!STORAGE_SYMBOL_MAP[field]) {
            Object.defineProperty(STORAGE_SYMBOL_MAP, field, {
                enumerable: false,
                configurable: false,
                writable: false,
                value: Symbol(field)
            });
        }
        return STORAGE_SYMBOL_MAP[field];
    }

    static getTargetStorage(target, field, defaultValue = {}) {
        const symbolField = this.getUniqueField(field);
        if (typeof target === 'function') {
            const property = target.prototype;
            if (!property[symbolField]) {
                property[symbolField] = defaultValue;
            }
            return property[symbolField];
        }
        if (typeof target === 'object') {
            if (!target[symbolField]) {
                target[symbolField] = defaultValue;
            }
            return target[symbolField];
        }
        return undefined;
    }

    static waitImmediately(...args) {
        return AnnotationUtils.wait({args})
    }

    static wait({ms = 0, args = []} = {}) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(args)
            }, ms);
        });
    }

    static flagDecoratorByParams(params) {

        if (params.length === 0) {
            return {isCustomParams: true};
        }

        const flagCaseMap = {
            isClassType: (params) => {
                return params.length === 1 && typeof params[0] === 'function';
            },
            isMethodType: (params) => {
                return params.length === 3 && typeof params[1] === 'string' && typeof params[2].value === 'function';
            },
            isPropertyType: (params) => {
                return params.length === 3 && typeof params[1] === 'string' && !params[2].value;
            }
        };

        const basicFlag = {
            isClassType: flagCaseMap.isClassType(params),
            isMethodType: flagCaseMap.isMethodType(params),
            isPropertyType: flagCaseMap.isPropertyType(params)
        };

        return {
            ...basicFlag,
            isCustomParams: !basicFlag.isClassType && !basicFlag.isMethodType && !basicFlag.isPropertyType
        };
    }

    static fromEntries(entries) {
        const result = {};
        entries.forEach(entry => {
            result[entry[0] || ''] = entry[1]
        });
        return result;
    }

    static getPropertyNames(target) {
        const result = [];
        Object.getOwnPropertyNames(target).forEach(field => {
            result.push(field);
        });
        for (let field of Object.getOwnPropertyNames(Object.getPrototypeOf(target))) {
            if (field !== 'constructor') {
                result.push(field);
            }
        }
        return result;
    }

    static executeAsyncInQueue(methods = [], {params = {}, context, returnValueStack = []} = {}) {
        return new Promise(resolve => {
            methods = [...methods].filter(m => typeof m === 'function');
            returnValueStack = [...returnValueStack];
            let lastPromise = Promise.resolve();
            while (methods.length > 0) {
                const method = methods.shift();
                lastPromise = lastPromise.then(() => {
                    return Promise.resolve(method.call(context, {
                        ...params, returnValueStack, lastValue: returnValueStack[returnValueStack.length - 1]
                    })).then(value => {
                        returnValueStack.push(value);
                        return value;
                    });
                });
            }
            resolve(lastPromise);
        })
    }

    /**
     *
     * @param array {Array}
     * @param deep {number}
     * @returns {Array}
     */
    static flat(array, deep = Infinity) {

        const flat = Array.prototype.flat || function(deep = Infinity) {
            if (deep < 1) {
                return this;
            }
            let result = [];
            const nextDeep = deep - 1;
            this.forEach(a => {
                if (a instanceof Array) {
                    result = result.concat(flat.call(a, nextDeep));
                } else {
                    result.push(a);
                }
            });
            return result;
        };

        return flat.call(array, deep);

    }
}