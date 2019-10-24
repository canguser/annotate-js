const factory = new Map();
export default {
    getInstance(type) {
        if (!factory.has(type)) {
            factory.set(type, new type());
        }
        return factory.get(type);
    }
}