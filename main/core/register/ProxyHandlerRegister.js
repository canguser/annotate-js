export default class ProxyHandlerRegister {

    methodHandlersMap = {};

    resultHandler = {};

    register(method, handler) {
        const handlers = this.methodHandlersMap[method] || [];
        handlers.push(handler);
        this.methodHandlersMap[method] = handlers;
        this.refresh();
    }

    unregister(method, handler) {
        let handlers = this.methodHandlersMap[method] || [];
        handlers = handlers.filter(h => h !== handler);
        this.methodHandlersMap[method] = handlers;
        this.refresh();
    }

    refresh() {
        Object.entries(this.methodHandlersMap).forEach(([method, handlers]) => {
            this.resultHandler[method] = (...args) => {
                for (let handler of handlers) {
                    let goNext = false;
                    const params = [args, {
                        next() {
                            goNext = true;
                        }, params: {}
                    }];
                    let result = handler(...params);
                    if (!goNext) {
                        return result;
                    }
                }
                return Reflect[method](...args);
            }
        })
    }

    export() {
        return this.resultHandler;
    }
}