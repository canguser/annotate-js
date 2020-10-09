import PluginLoader from "../../../core/plugin/PluginLoader";

PluginLoader.load({
    name: 'testing',
    mount({BasicScanner}) {
        console.log(BasicScanner);
    }
});