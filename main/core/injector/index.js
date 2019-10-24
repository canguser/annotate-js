import AnnotationUtils from "../utils/AnnotationUtils";

export default class Injector {

    params = {};
    localParams = {};
    localPrefix;

    constructor(prefix = '$') {
        this.setLocalPrefix(prefix);
    }

    setLocalPrefix(prefix) {
        this.localPrefix = prefix;
        return this;
    }

    inject(params, isLocal = false) {
        if (isLocal) {
            Object.assign(this.localParams, params);
        } else {
            Object.assign(this.params, params);
        }
        return this;
    }

    injectKeyValue(key, value, isLocal = false) {
        return this.inject({[key]: value}, isLocal);
    }

    injectLocalKeyValue(key, value) {
        return this.injectKeyValue(key, value, true);
    }

    injectLocal(params) {
        return this.inject(params, true);
    }

    result() {
        return {
            ...this.params,
            ...AnnotationUtils.fromEntries(
                Object.entries(
                    this.localParams
                ).map(
                    ([key, value]) => {
                        return [this.localPrefix + key, value];
                    }
                )
            )
        }
    }

}