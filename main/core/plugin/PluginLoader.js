import * as AnnotateJS from '../../index';


export default class PluginLoader {

    static load(pluginOptions = {}) {
        if (typeof pluginOptions.mount === 'function') {
            pluginOptions.mount(AnnotateJS);
        }
    };

}