export default class HasAnnotations {

    annotationsSet = new Set();

    getAnnotationsByType(type) {
        const describes = type.describeTypes;
        return this.annotations.filter(a => describes.reduce((is, describe) => is && (a instanceof describe), true));
    }

    findAnnotationByType(type) {
        const describes = type.describeTypes;
        return this.annotations.find(a => describes.reduce((is, describe) => is && (a instanceof describe), true));
    }

    getAnnotationsByDescribe(describe, ...moreDescribes) {
        const describes = [describe, ...moreDescribes];
        return this.annotations.filter(a => describes.reduce((is, describe) => is || (a instanceof describe), false));
    }

    findAnnotationByDescribe(describe, ...moreDescribes) {
        const describes = [describe, ...moreDescribes];
        // console.log(describes);
        return this.annotations.find(a => describes.reduce((is, describe) => is || (a instanceof describe), false));
    }

    get annotations() {
        return Array.from(this.annotationsSet);
    }

    addAnnotation(annotation) {
        this.annotationsSet.add(annotation);
    }

    removeAnnotation(annotation) {
        this.annotationsSet.delete(annotation);
    }

    hasAnnotations(type) {
        return !!this.findAnnotationByDescribe(...type.describeTypes);
    }


}