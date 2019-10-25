const {Bean, Autowired, Section, Boot} = require('./core/decorator');
const {BeanDescribe, AutowiredDescribe, SectionDescribe, BootDescribe} = require('./core/decorator');
const {Annotation, BasicAnnotationDescribe} = require('./core/decorator-generator/BasicAnnotationDescribe');

const AnnotationGenerator = require('./core/decorator-generator/AnnotationGenerator');
const AnnotationUtils = require('./core/utils/AnnotationUtils');
const BasicBeanContainer = require('./core/container/BasicBeanContainer');
const BasicScanner = require('./core/scanner/BasicScanner');
const Injector = require('./core/injector');
const ProxyHandlerRegister = require('./core/register/ProxyHandlerRegister');
const ClassEntity = require('./core/entities/ClassEntity');
const PropertyEntity = require('./core/entities/PropertyEntity');
const HasAnnotations = require('./core/entities/HasAnnotations');
const SimpleFactory = require('./core/factory/SimpleFactory');

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
