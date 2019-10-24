export default class HasAnnotations {

    annotationsSet = new Set();

    getAnnotationsByType(type) {
        return this.getAnnotationsByDescribe(type.describeType);
    }

    findAnnotationByType(type) {
        return this.findAnnotationByDescribe(type.describeType);
    }

    getAnnotationsByDescribe(describe) {
        return this.annotations.filter(a => a instanceof describe);
    }

    findAnnotationByDescribe(describe) {
        return this.annotations.find(a => a instanceof describe);
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
        return !!this.annotations.find(a => type.describeType ? (a instanceof type.describeType) : true);
    }


}