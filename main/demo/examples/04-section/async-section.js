import AnnotationUtils from "../../../core/utils/AnnotationUtils";
import {Autowired, Bean, BeanDescribe, Boot, EnergyWire, Section, SectionDescribe} from "../../../core/decorator";
import AnnotationGenerator from "../../../core/decorator-generator/AnnotationGenerator";


class LogCallMethodDescribe extends SectionDescribe {
    constructor() {
        super();
        this.params.priority = 0;
        this.params.before = ({origin}) => {
            console.log(origin.name, 'called');
        };
        this.params.onError = ({resolve, error}) => {
            resolve('Some thing went wrong, ' + error.message);
        }
    }
}

const LogCallMethod = AnnotationGenerator.generate(
    LogCallMethodDescribe
);

const LoggedBean = AnnotationGenerator.generate(BeanDescribe, [LogCallMethodDescribe]);


@Bean
@LogCallMethod
class MockService {

    asyncFetchService(url) {
        if (Math.random() < 1) {
            AnnotationUtils.wait({ms: 3000})
                .then(
                    () => Promise.reject('asyncFetchService got a error')
                )
        }
        return AnnotationUtils.wait({ms: 3000, args: {result: {message: `[fetched]: ${url}`}}});
    }

    syncFetchService(url) {
        if (Math.random() < 0.3) {
            throw new Error('syncFetchService got a error');
        }
        return {result: {message: `[fetched]: ${url}`}};
    }
}


@Bean
class SyncSectionTest {

    @EnergyWire('MockService')
    syncFetchService;

    @Section(
        {
            before({params}) {
                params[0] += '(Second Section)';
            },
            after({lastValue}) {
                if (Math.random() < 0.3) {
                    throw new Error('second section got a error');
                }
                return lastValue + ' - second result'
            },
            onError({resolve, error}) {
                console.log(error.message);
                resolve({result: ''});
            }
        }
    )
    @Section(
        {
            before({params}) {
                params[0] += '(First Section)';
            },
            after({lastValue}) {
                if (Math.random() < 0.3) {
                    throw new Error('first section got a error');
                }
                return lastValue + ' - first result'
            },
            onError({resolve, error}) {
                console.log(error.message);
                resolve(error.message);
            }
        }
    )
    getNameById(id) {
        if (Math.random() < 0.3) {
            throw new Error('getNameById got a error');
        }
        return JSON.stringify(this.syncFetchService('http://test.com/' + id + '/name'));
    }
}


@Bean
class AsyncSectionTest {

    @EnergyWire('MockService')
    asyncFetchService;

    @Section(
        {
            before({params}) {
                params[0] += '(Second Section)';
            },
            after({lastValue}) {
                if (Math.random() < 0.3) {
                    throw new Error('second section got a error');
                }
                return lastValue + ' - second result'
            },
            onError({resolve, error}) {
                console.log(error.message);
                console.log('looks like you got some errors, pls wait...');
                console.time('think for problem');
                return AnnotationUtils.wait({ms: 2000})
                    .then(() => {
                        resolve({result: 'I think that is not a problem, haha'});
                        console.timeEnd('think for problem')
                    });
            },
            priority: 1
        }
    )
    @Section(
        {
            before({params}) {
                params[0] += '(First Section)';
            },
            after({lastValue}) {
                if (Math.random() < 0.3) {
                    throw new Error('first section got a error');
                }
                return lastValue + ' - first result'
            },
            onError({resolve, error}) {
                console.log(error.message);
                resolve(error.message);
            },
            priority: 2
            // isAsync: true
        }
    )
    getNameById(id) {
        if (Math.random() < 0.3) {
            throw new Error('getNameById got a error');
        }
        return Promise.resolve(this.asyncFetchService('http://test.com/' + id + '/name')).then(res => JSON.stringify(res));
    }
}

@Boot
class Application {

    @Autowired
    SyncSectionTest;
    @Autowired
    AsyncSectionTest;

    main() {
        // const name = this.SyncSectionTest.getNameById('Q233KJBJ4234');
        // console.log(name);
        this.AsyncSectionTest.getNameById('Q233KJBJ4234')
            .then(name => {
                console.log(name);
            })
    }
}

