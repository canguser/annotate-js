import {Section} from "../decorator";
import AnnotationUtils from "../utils/AnnotationUtils";


export default class SectionMethodBuilder {

    constructor(propertyEntity, target) {
        this.propertyEntity = propertyEntity;
        this.target = target;
    }

    get name() {
        return this.propertyEntity.name;
    }

    get sections() {
        return this.propertyEntity.getAnnotationsByType(Section).filter(section => !section.params.independent);
    }

    get originMethod() {
        return this.origin || this.target[this.name];
    }

    set originMethod(origin) {
        this.origin = origin;
    }

    isSurroundSection() {
        this.isSurround = true;
        return this;
    }

    setOriginMethod(origin) {
        this.originMethod = origin;
        return this;
    }

    build() {
        if (this.isSurround) {
            return this.buildSurroundMethod();
        }
        return this.buildHookFunction();
    }

    buildSurroundMethod() {
        const origin = this.originMethod;
        const _this = this;
        let sections = this.sections;
        sections = [...sections];
        sections.sort((a, b) => {
            return b.priority - a.priority
        });
        return function (...args) {
            return sections.reduce((lastMethod, section) => SectionMethodBuilder.getHookedMethod({
                section, lastOrigin: lastMethod, propertyEntity: _this.propertyEntity, origin: _this.originMethod
            }), origin).bind(this)(...args);
        }
    };

    static getHookedMethod({section, lastOrigin, propertyEntity, origin}) {
        if (typeof lastOrigin !== 'function') {
            return lastOrigin;
        }
        const before = section.getParams('before');
        const after = section.getParams('after');
        const onError = section.getParams('onError');

        return function (...args) {
            try {
                const isGetter = 'get' in propertyEntity.descriptor && lastOrigin.name === 'get';
                const isSetter = 'set' in propertyEntity.descriptor && lastOrigin.name === 'set';
                const baseParams = {
                    origin, params: args, annotations: propertyEntity.annotations, propertyEntity, lastOrigin,
                    annotate: section, isGetter, isSetter
                };

                let preventDefault = false;
                // parsing before
                const beforeResult = before.call(this, {
                    ...baseParams,
                    preventDefault() {
                        preventDefault = true;
                    }
                });
                if (preventDefault) {
                    return beforeResult;
                }
                let returnValue;
                if (beforeResult instanceof Promise) {
                    returnValue = beforeResult.then(
                        () => {
                            return lastOrigin.apply(this, args);
                        }
                    )
                } else {
                    returnValue = lastOrigin.apply(this, args);
                }

                // parsing origin
                if (typeof after === 'function') {
                    if (returnValue instanceof Promise) {
                        returnValue = returnValue.then(value => after.call(this, {...baseParams, lastValue: value}))
                    } else {
                        returnValue = after.call(this, {...baseParams, lastValue: returnValue});
                    }
                }

                if (returnValue instanceof Promise) {
                    return returnValue.catch(error => {
                        let isSolved = false;
                        let message = '';
                        const resolve = (msg) => {
                            message = msg;
                            isSolved = true;
                        };
                        return Promise.resolve(onError.call(this, {error, resolve}))
                            .then(solution => {
                                if (!isSolved) {
                                    throw error;
                                }
                                return message || solution;
                            });
                    });
                }
                return returnValue;
            } catch (error) {
                let isSolved = false;
                let message = '';
                const resolve = (msg) => {
                    message = msg;
                    isSolved = true;
                };
                const result = onError.call(this, {error, resolve});
                if (!isSolved) {
                    throw error;
                }
                return message || result;
            }
        }
    };

    buildHookFunction() {
        const _this = this;
        const {beforeList, afterList, sections, isAsync} = this.getSectionAction();
        const origin = this.originMethod;
        const propertyEntity = this.propertyEntity;
        return function (...args) {
            try {
                const baseParams = {
                    origin, params: args, annotations: propertyEntity.annotations, propertyEntity
                };
                if (isAsync) {
                    return AnnotationUtils.executeAsyncInQueue(beforeList, {params: baseParams, context: this})
                        .then(() => {
                            return new Promise(resolve => resolve(origin.apply(this, args)));
                        })
                        .then(returnValue => {
                            const returnValueStack = [returnValue];
                            return AnnotationUtils.executeAsyncInQueue(afterList, {
                                params: baseParams, context: this, returnValueStack
                            })
                        }).catch(error => {
                            return _this.dealError({error, sections});
                        })
                }
                beforeList.forEach(before => {
                    before.call(this, baseParams);
                });
                const returnValue = origin.call(this, ...args);
                const returnValueStack = [returnValue];
                return afterList.reduce((last, after) => {
                    returnValueStack.push(last);
                    return after.call(this, {
                        ...baseParams, returnValueStack,
                        lastValue: returnValueStack[returnValueStack.length - 1]
                    });
                }, returnValue);
            } catch (error) {
                return _this.dealError({error, sections});
            }
        };
    }

    dealError({error, sections}) {
        // DO Responsibility chain
        let isSolved = false;
        let result;
        const params = {
            resolve(res) {
                isSolved = true;
                result = res;
            }, error
        };
        // more priority, more execute
        sections = [...sections];
        sections.reverse();
        for (const section of sections) {
            const errorHandler = section.getParams('onError');
            errorHandler.call(section, params);
            if (isSolved) {
                break;
            }
        }
        if (!isSolved) {
            throw error;
        }
        return result;
    };

    getSectionAction() {
        const beforeList = [];
        const afterList = [];
        const sections = [...this.sections];
        sections.sort((a, b) => {
            return a.priority - b.priority;
        });
        for (let section of sections) {
            if (typeof origin === 'function') {
                beforeList.push(section.getParams('before'));
                const after = section.getParams('after');
                if (after) {
                    afterList.push(after);
                }
            }
        }
        return {beforeList, afterList, isAsync: sections.find(s => s.getParams('isAsync')), sections};
    };
}