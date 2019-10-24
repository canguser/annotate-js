export default class BasicBeanContainer {

    beanMap = new Map();

    getBean(name) {
        return this.beanMap.get(name);
    }

    setBean(name, bean) {
        if (this.beanMap.has(name)) {
            throw new Error(`Bean name: [${name}] is declared. `);
        }
        this.beanMap.set(name, bean);
    }

    hasBean(name){
        return this.beanMap.has(name);
    }

}