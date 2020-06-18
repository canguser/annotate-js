# Annotate JS
Annotate JS 是一个基于 Javascript 中的注解提案 `proposal-decorators` 而实现的一套注解框架，我们可以通过这套框架实现类似 Java 中的依赖注入，以及面向切面编程等，适用于 Node 服务器与常规的 Javascript 开发。
## 快速开始
### 引入
```
npm install @palerock/annotate-js
```
   
### 提前准备一个能使用 decorators 语法以及一些支持一些 javascript 的项目环境，如：
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
## API文档

### 文档撰写中...
