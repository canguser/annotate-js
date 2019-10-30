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
        return this.propertyEntity.getAnnotationsByType(Section);
    }

    get originMethod() {
        return this.origin || this.target[this.name];
    }

    set originMethod(origin){
        this.origin = origin;
    }

    isSurroundSection() {
        this.isSurround = true;
        return this;
    }

    setOriginMethod(origin){
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
        const isAsync = !!sections.find(s => s.getParams('isAsync'));
        sections.sort((a, b) => {
            return b.priority - a.priority
        });
        return function (...args) {
            return sections.reduce((lastMethod, section) => _this.getHookedMethod({
                section, lastOrigin: lastMethod, isAsync
            }), origin).bind(this)(...args);
        }
    };

    getHookedMethod({section, isAsync, lastOrigin}) {
        const origin = this.originMethod;
        const propertyEntity = this.propertyEntity;
        if (typeof origin !== 'function') {
            return origin;
        }
        const before = section.getParams('before');
        const after = section.getParams('after');
        const onError = section.getParams('onError');

        if (section.isAsync || isAsync) {
            return function (...args) {
                const baseParams = {
                    origin, params: args, annotations: propertyEntity.annotations, propertyEntity, lastOrigin
                };
                let result = new Promise(resolve => {
                    resolve(this::before(baseParams))
                }).then(() => {
                    return this::lastOrigin(...args);
                });
                if (after) {
                    result = result.then(returnValue => {
                        return this::after({...baseParams, lastValue: returnValue})
                    });
                }
                return result.catch(error => {
                    let isSolved = false;
                    let message = '';
                    const resolve = (msg) => {
                        message = msg;
                        isSolved = true;
                    };
                    return Promise.resolve(this::onError({error, resolve}))
                        .then(solution => {
                            if (!isSolved) {
                                throw error;
                            }
                            return message || solution;
                        });
                })
            }
        }
        return function (...args) {
            try {
                const baseParams = {
                    origin, params: args, annotations: propertyEntity.annotations, propertyEntity, lastOrigin
                };
                this::before(baseParams);
                let returnValue = this::lastOrigin(...args);
                if (after) {
                    returnValue = this::after({...baseParams, lastValue: returnValue});
                }
                return returnValue;
            } catch (error) {
                let isSolved = false;
                let message = '';
                const resolve = (msg) => {
                    message = msg;
                    isSolved = true;
                };
                const result = this::onError({error, resolve});
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
                            return new Promise(resolve => resolve(this::origin(...args)));
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
                    this::before(baseParams);
                });
                const returnValue = this::origin(...args);
                const returnValueStack = [returnValue];
                return afterList.reduce((last, after) => {
                    returnValueStack.push(last);
                    return this::after({
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
            section::errorHandler(params);
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