const {Bean, Autowired, Section, Boot} = require('./core/decorator');
const {BeanDescribe, AutowiredDescribe, SectionDescribe, BootDescribe} = require('./core/decorator');
const {Annotation, BasicAnnotationDescribe} = require('./core/decorator-generator/BasicAnnotationDescribe');

const AnnotationGenerator = require('./core/decorator-generator/AnnotationGenerator').default;
const AnnotationUtils = require('./core/utils/AnnotationUtils').default;
const BasicBeanContainer = require('./core/container/BasicBeanContainer').default;
const BasicScanner = require('./core/scanner/BasicScanner').default;
const Injector = require('./core/injector').default;
const ProxyHandlerRegister = require('./core/register/ProxyHandlerRegister').default;
const ClassEntity = require('./core/entities/ClassEntity');
const PropertyEntity = require('./core/entities/PropertyEntity').default;
const HasAnnotations = require('./core/entities/HasAnnotations').default;
const SimpleFactory = require('./core/factory/SimpleFactory').default;

exports.Annotation = Annotation;
exports.Bean = Bean;
exports.Autowired = Autowired;
exports.Section = Section;
exports.Boot = Boot;

exports.BeanDescribe = BeanDescribe;
exports.AutowiredDescribe = AutowiredDescribe;
exports.SectionDescribe = SectionDescribe;
exports.BootDescribe = BootDescribe;
exports.BasicAnnotationDescribe = BasicAnnotationDescribe;

exports.AnnotationGenerator = AnnotationGenerator;
exports.AnnotationUtils = AnnotationUtils;
exports.BasicBeanContainer = BasicBeanContainer;
exports.BasicScanner = BasicScanner;
exports.Injector = Injector;
exports.ProxyHandlerRegister = ProxyHandlerRegister;
exports.ClassEntity = ClassEntity;
exports.PropertyEntity = PropertyEntity;
exports.HasAnnotations = HasAnnotations;
exports.SimpleFactory = SimpleFactory;
