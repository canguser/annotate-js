const toLowerCase = (name) => typeof name === 'string' ? name.toLowerCase() : name;

export default class BasicBeanContainer {

    beanMap = new Map();

    ignoreCase = true;

    getBean(name) {
        return this.beanMap.get(this.getParsedName(name));
    }

    setBean(name, bean) {
        name = this.getParsedName(name);
        if (this.beanMap.has(name)) {
            throw new Error(`Bean name: [${name}] is declared. `);
        }
        this.beanMap.set(name, bean);
    }

    hasBean(name) {
        name = this.getParsedName(name);
        return this.beanMap.has(name) && !!this.getBean(name);
    }

    getParsedName(name) {
        return this.ignoreCase ? toLowerCase(name) : name
    }

}