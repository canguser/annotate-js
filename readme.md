# Annotate JS [![gitee.png](https://palerock.cn/api-provider/files/view?identity=L2FydGljbGUvaW1hZ2UvMjAyMDA2MjkxNTQyMTMwNzVXcWZyU2dTbC5wbmc=&w=15)](https://gitee.com/HGJing/annotate-js) [![github.png](https://palerock.cn/api-provider/files/view?identity=L2FydGljbGUvaW1hZ2UvMjAyMDA2MjkxNjU3NDkzMDkybWNLRXhHMi5wbmc=&w=15)](https://github.com/canguser/annotate-js)

Annotate JS 是一个基于 Javascript 中的注解提案 `proposal-decorators` 而实现的一套注解框架，我们可以通过这套框架实现类似 Java 中的依赖注入，以及面向切面编程等，适用于 Node 服务器与常规的 Javascript 开发。

### 目录
**[快速开始](#快速开始)**
- **[引入](#引入)**
- **[开始使用](#开始使用)**
- **[实现自定义注解](#实现自定义注解)**
**[API文档](#api文档)**
- **[预置注解](#预置注解)**
    - [`@Bean`](#bean)
    - [`@Boot`](#boot)
    - [`@Property`](#property)
    - [`@Autowired`](#autowired)
    - [`@EnergyWire`](#energyWire)
    - [`@Section`](#section)
- **[项目目录扫描](#项目目录扫描)**

## 快速开始
### 引入
```
npm install @palerock/annotate-js
```
   
提前准备一个能使用 decorators 语法以及一些支持一些 javascript 的项目环境，如：
```json
// 使用 babel 7 的 .babelrc 配置文件
{
  "presets": [
    [
      "@babel/preset-env"
    ]
  ],
  "plugins": [
    [
      "@babel/plugin-proposal-decorators",
      {
        "legacy": true
      }
    ],
    "@babel/plugin-proposal-function-bind",
    [
      "@babel/plugin-proposal-class-properties",
      {
        "loose": true
      }
    ]
  ]
}
```
### 开始使用
使用 `@Bean`，`@Boot`，`@Autowired` 注解实现依赖注入
```javascript
import {Bean, Boot, Autowired} from '@palerock/annotate-js'; 

/**
 * 声明一个组件名为 Demo
 */
@Bean
class Demo{
    sayHello(){
        console.log('hello annotate-js.');
    }
}

@Boot
class Init{

    @Autowired
    Demo; // 自动注入

    // 代码入口
    main(){
        this.Demo.sayHello(); // output `hello annotate-js.`
    }
}
```
使用 `@Section` 实现面向切面编程，将以上代码中的 Demo 类修改如下
```javascript
import {Bean, Boot, Autowired, Section} from '@palerock/annotate-js'; 

/**
 * 声明一个组件名为 Demo
 */
@Bean
class Demo{

    @Section(
       {
           before() {
               console.log('before say.');
           },
           after() {
               console.log('after say.');
           }
       }
    )
    sayHello(){
        console.log('hello annotate-js.');
    }
    // other code here...
}
```
运行最后输出 3 行文字：
```
before say.
hello annotate-js.
after say.
```  
### 实现自定义注解  
使用 `BeanDescribe` 和 `PropertyDescribe` 通过 `AnnotationGenerator` 生成自定义注解： 
1. `BeanDescribe` 适用于声明在 Class 上，生成的注解默认和 `@Bean` 相同
2. `PropertyDescribe` 适用于声明在 property 或者 method 上，默认没有任何功效  
```javascript
// annotation generator demo
import {BeanDescribe, PropertyDescribe, Boot, AnnotationGenerator} from '@palerock/annotate-js';

class MyBeanDescribe extends BeanDescribe {

    constructor() {
        super();
        Object.assign(this.params, {
            // 这里可以对注解的默认参数进行添加或修改
        });
    }

    onCreated() {
        super.onCreated();
        // 当该注解标记的 class 以及内部的 property 初始化完成后
    }

    /**
     * 注册 Proxy
     * @param proxy 用途如下所示
     */
    proxyRegister(proxy) {
        super.proxyRegister(proxy);
        // 这是使用 proxy 去注册时，是处于 proxy chain 的最后，如果前面的所有相关 proxy 都调用了 next 才能执行到这里
        proxy.register('get', ([...args], {next}) =&gt; {
            if (!Reflect.get(...args)) {
                return 'Hello Proxy';
            }
            next() // 必须调用 next 否则所有非空属性都会返回空
        })
    }


}

class MyPropertyDescribe extends PropertyDescribe {

    constructor() {
        super();
        Object.assign(this.params, {
            // 这里可以对注解的默认参数进行添加或修改
            tip: ''
        });
    }

    /**
     * 该方法对应每个被注解的 property
     * @param proxy 是一个注册器，实际用法参考如下代码
     * @param container{BasicBeanContainer} 是保存所有 bean 的容器，通过 bean name 可以获取到所有 bean
     */
    hookProperty({proxy, container}) {
        super.hookProperty({proxy, container});

        proxy.register('get', ([target, property, receiver], {next}) =&gt; {
            // 在这里劫持该 property 的 get 方法，用法于 Proxy 类似

            // 获取真实的属性值, 也就是你声明的值
            const realValue = Reflect.get(target, property, receiver);

            const params = this.params;

            if (typeof realValue === 'function') {
                // 如果真实属性是个函数, 则将该注解的参数注入到该函数中
                return function (args = {}) {
                    args.annotateParams = params;
                    return realValue.bind(this)(args);
                }
            }

            next(); // 如果不符合条件则交由下一个 register 的 get 处理
        });
    }

    /**
     * 该方法在属性所属的 class 完全生成后执行
     * 可以在这里执行一些需要在 class 生成后需要做的事
     * 或者获取 Bean 注解的一些属性
     * @param propertyEntity{PropertyEntity} 属性对象，见 /main/core/entities/PropertyEntity
     * @param classDecorator{BeanDescribe} 属性对应的 class 所被注解标记的注解描述
     */
    onClassBuilt(propertyEntity, classDecorator) {
        super.onClassBuilt(propertyEntity, classDecorator);
        // TO be override.
    }

}

const MyBean = AnnotationGenerator.generate(MyBeanDescribe);
const MyProperty = AnnotationGenerator.generate(MyPropertyDescribe);


@Boot
@MyBean
class BootEntry {

    finalProxyValue;

    @MyProperty({tip: 'Testing My Property'})
    test({annotateParams: {tip}}) {
        console.log(tip);
        return tip;
    }

    main() {
        // 入口
        // 注意这里没有传入 annotateParams 和 tip 参数
        const result = this.test(); // output: `Testing My Property`
        console.assert(result === 'Testing My Property');
        console.assert(this.finalProxyValue === 'Hello Proxy');
    }
}

```
## API文档

### 预置注解
#### `@Bean`

该注解用于生成组件

使用范围：仅 class

参数：

- `name`
    - 类型：`String`
    - 默认值：class 名
    - 描述：该属性作为所装饰 class 的唯一标识
    - 注意事项：该属性对于整个项目是唯一的，不能有两个组件名是相同的
    - 可选
    - 默认参数：在注解参数只有一个且不是对象的时候，标注为默认参数的注解属性会被赋值为该参数
- `args`
    - 类型：`Array<Object>`
    - 默认值：`[]`
    - 描述：在组件初始化时，该参数可以在生成组件时为构造函数赋予参数
    - 可选
- `isSectionSurround`
    - 类型：`Boolean`
    - 默认值：`true`
    - 描述：该值为 `true` 时，组件可以自动识别 `@Section` 注解
    - 可选
- `containerType`
    - 类型：`Class`
    - 默认值：`BasicBeanContainer`
    - 描述：该属性决定生成的组件所放入的容器，通过该容器可以获取该组件的实例
    - 可选

示例：
```javascript
@Bean
class MyComponent {
  // 没有参数所有属性使用默认值， name = 'MyComponent'
}

@Bean('MyCmp')
class MyComponent1 {
  // 只有一个参数被设置，默认为 name 赋值， name = 'MyCmp'
}

@Bean({
    name:'CmpTest',
    args:[123]
})
class MyComponent2 {
  // 设置多个参数
  constructor(value) {
    console.log(value); // 123
  }
}
```

#### `@Boot`

该注解用于定义程序入口

功能及参数继承于 [`@Bean`](#bean)

默认参数：`name`

变动/额外参数：
- `name`
    - 类型：`String`
    - 默认值：`'bootBean'` 
    - 描述：同父级
    - 注意事项：在使用多个入口函数时，需要手动指定不同的 `name`
    - 可选
    - 默认参数：在注解参数只有一个且不是对象的时候，标注为默认参数的注解属性会被赋值为该参数
- `methodName`
    - 类型：`String`
    - 默认值：`'main'` 
    - 描述：指定该组件的入口方法名
    - 可选
    
#### `@Property`

该注解用于装饰成员属性，装饰该注解的成员属性可以被 `@Bean` 识别  
若要自定义注解用于装饰成员属性，推荐使用该注解的 Describer  
作用范围：`Class` 或 `Property`

参数：
- `priority`
    - 类型：`Number`
    - 默认值：`0` 
    - 描述：在属性被多个该注解或者继承于该注解 Describer 所生成的注解装饰时，该参数可以指定注解被 `@Bean` 访问的优先级，值越大，优先级越高
    - 可选
    - 默认参数：在注解参数只有一个且不是对象的时候，标注为默认参数的注解属性会被赋值为该参数

#### `@Autowired`

该注解继承于 [`@Property`](#property)  
该注解用于将指定 `Bean` 或其中的指定属性注入到该注解装饰的成员变量中  
作用范围：仅 `Property`

默认参数：`beanName`

新增参数：
- `name`
    - 类型：`String`
    - 默认值：被装饰变量的名字
    - 描述：在参数中 `isMapProperty` 不为 `true` 时，和 `beanName` 一致，若非，该参数作用和 `propertyName` 一致
    - 可选
- `beanName`
    - 类型：`String`
    - 默认值：参数中 `name` 的值
    - 描述：被注入的 `Bean` 的 `Name`，指定该参数可以从所有已声明的 `Bean` 中获取与该属性匹配的组件
    - 可选 
    - 默认参数：在注解参数只有一个且不是对象的时候，标注为默认参数的注解属性会被赋值为该参数
- `isMapProperty`
    - 类型：`Boolean`
    - 默认值：`false`
    - 描述：是否注入指定 `bean` 中的某个成员属性，只有在参数 `propertyName` 或 `name` 不为空时生效
    - 可选 
- `propertyName`
    - 类型：`String`
    - 默认值：`'''`
    - 描述：只有在参数中的 `isMapProperty` 为 `true` 时生效，指定注入 `bean` 中的成员属性名
    - 可选 

#### `@EnergyWire`

功能及参数继承于 [`@Autowired`](#autowired)  
值得注意的时，该注解专注于注入 `bean` 中的指定属性

默认参数：`beanName`

变动/额外参数：
- `name`
    - 类型：`String`
    - 默认值：被装饰变量的名字
    - 描述：在参数中 `isMapProperty` 不为 `true` 时，和 `beanName` 一致，若非，该参数可以指定为链式字符串用于表示 `beanName` + `propertyName`
    - 注意事项: 链式表达式最多支持两层
    - 例如: `'MyBean.MyProperty'`
    - 可选
- `beanName`
    - 类型：`String`
    - 默认值：参数中 `name` 的值
    - 描述：被注入的 `Bean` 的 `Name`，指定该参数可以从所有已声明的 `Bean` 中获取与该属性匹配的组件
    - 新增：该属性支持链式表达，如 `A.B` 其中 `A` 表示 `beanName`，`B` 表示 `propertyName`
    - 可选 
    - 默认参数：在注解参数只有一个且不是对象的时候，标注为默认参数的注解属性会被赋值为该参数
- `isMapProperty`
    - 类型：`Boolean`
    - 默认值：`false`
    - 描述：在该注解中，若 `propertyName` 或同义表达不为空，该值默认为 `true`
    - 可选 
- `propertyName`
    - 类型：`String`
    - 默认值：`'''`
    - 描述：指定注入 `bean` 中的成员属性名
    - 可选 

#### `@Section`

该注解继承于 [`@Property`](#property)  
作用范围：`class` 或 `property`，注意只对 `Function` 类型的 `property` 生效 
当作用于 `class` 时，表示该 `class` 的所有 `property` 都作用于该注解

默认参数：`priority` 作用同父级

新增参数：
- `after`
    - 类型：`Function`
    - 默认值：空方法
    - 描述：在被该注解装饰的方法被调用结束时，调用该方法
    - 回调参数：(对象形式)
        - origin: 原方法 - `Function`
        - params: 原方法调用的参数 - `Object - {key:vlaue}`
        - annotations: 该方法上的注解列表 - `Array<Object>`
        - propertyEntity: 属性实体，包含属性名等信息
        - lastOrigin: 若同时有多个 `@Section` 注解，外部的 `Section` 可以获取最近一次 `Surround` 的方法
        - lastValue: 表示 `lastOrigin` 的返回值
    - 返回值: 代替源方法的返回值，如果外部还有 `@Section` 注解，则由 `lastValue` 的形式交由下一个 `Section` 
 - 可选
- `before`
    - 类型：`Function`
    - 默认值：空方法
    - 描述：在被该注解装饰的方法被调用前时，调用该方法
    - 回调参数：(对象形式)
        - origin: 原方法 - `Function`
        - params: 原方法调用的参数 - `Object - {key:vlaue}`
        - annotations: 该方法上的注解列表 - `Array<Object>`
        - propertyEntity: 属性实体，包含属性名等信息
        - lastOrigin: 若同时有多个 `@Section` 注解，外部的 `Section` 可以获取最近一次 `Surround` 的方法
    - 返回值: 无特殊用途
    - 可选 
    - 默认参数：在注解参数只有一个且不是对象的时候，标注为默认参数的注解属性会被赋值为该参数
- `onError`
    - 类型：`Function`
    - 默认值：空方法
    - 描述：在调用该方法时出现错误时调用该方法(包括 before, after)
    - 回调参数：(对象形式)
        - error: 错误对象
        - resolve: 用于解决错误的方法，调用该方法表示不报错，参数表示正常的返回值 - `Function - result`
    - 返回值: 若 resolve 的参数为空，则使用该返回值
    - 可选 
- `isAsync`
    - 类型：`Boolean`
    - 默认值：`'false''`
    - 描述：该参数表示整个 `@Section` 是否异步允许
    - 注意：若由多个 `@Section` 注解装饰于同一个属性，其中任一一个注解被标示为 `isAsync = true`, 则所有的 `@Section` 注解都为异步运行
    - 可选 

### 项目目录扫描  
**环境要求：仅限 NodeJS 后台项目**  
在 NodeJS 环境中，我们可以使用 Scanner 对项目中的所有 JS 文件进行扫描，以实现加载多个 JS 文件中的多个组件  
例：  
```javascript
import BasicScanner from "@palerock/annotate-js";

new BasicScanner().setContext(__dirname).scan(
    ['./examples/01-basic/*'] // 项目路径，* 是通配符
);
```

### 文档持续撰写中...