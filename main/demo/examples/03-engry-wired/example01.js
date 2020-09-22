import {Bean, Boot, EnergyWire} from "../../../index";

@Bean
class APIService {

    API_KEY = 'API Key';

    api01() {
        console.log('api 01 called', this.API_KEY);
    }

    api02() {
        console.log('api 02 called', this.API_KEY);
    }
}

@Boot
class TestBoot {

    @EnergyWire('APIService')
    api01;

    @EnergyWire({
        beanName: 'APIService',
        propertyName: 'api02'
    })
    api02;

    @EnergyWire('APIService.api02')
    api03;

    main() {
        this.api01(); // api 01 called API Key
        this.api02(); // api 02 called API Key
        this.api03(); // api 02 called API Key
    }
}