let is_literal_object=a=>a&&a.constructor&&"object"===a.constructor.name.toLowerCase(),is_class_object=a=>a&&!Array.isArray(a)&&a.constructor&&"object"!==a.constructor.name.toLowerCase();function array_has_values(a,b){for(let c=0;c<b.length;c++)if(!a.includes(b[c]))return!1;return!0}let array_equals=(a,b)=>array_has_values(a,b)&&array_has_values(b,a);function gettype(a){if(a===void 0)return"undefined";if(null===a)return"null";if("number"==typeof a)return new RegExp(/^[-]?(?:[0-9]*[,.]{1}[0-9]*)$/g).test(a)?"float":"int";if("boolean"==typeof a)return"boolean";if("function"==typeof a)return"function";if(Array.isArray(a))return"array";if("object"==typeof a){if(is_literal_object(a))return"literal";if(is_class_object(a))return`Object<${a.constructor.name}>`;throw new Exception(`gettype failed, unknown object type ${a}`)}else{if("string"==typeof a)return"string";throw new Exception(`gettype failed, unknown input type ${typeof a}`)}}function is_object_type(a){let b=/object<([a-z0-9_]+)>/gi.exec(a);return null!==b&&b[1]}class JSUnitTestException{constructor(a,b){this.message=a,this.data=b}getMessage(){return this.message}getData(){return this.data}}class JSUnitTest{constructor(){this.objectReferences=[],this.assertions=[],this.expectExceptions=[]}static getFunctionNames(a){let b=[];return Object.getOwnPropertyNames(a.__proto__).forEach(a=>{b.push(a)}),b}static getFunctionCaller(a){let b=JSUnitTest.getFunctionNames(a.__proto__),c=a.constructor.name,d=JSUnitTest.getFunctionNames(new a.constructor);try{throw new Error}catch(a){var f=a.stack.split("\n");!0===/firefox/gi.test(navigator.userAgent)&&(f=f.map(a=>a.replace(/(\s*)([a-z0-9]+)(\s*)(.*)/gi,`\$1at ${c}.\$2 \$3(\$4)`)));let e=f.map(a=>/s*at ([a-z0-9_]+).([a-z0-9_]+) ((.+))/gi.exec(a));e=e.filter(a=>null!==a&&a[1]===c&&!b.includes(a[2])&&d.includes(a[2]));let g=e.pop().slice(1);return{class:g[0],method:g[1],line:g[2]}}}addAssertion(a){let b=`${a["class"]}.${a.method}`;this.assertions.includes(b)||this.assertions.push(b)}throwException(a,b="",c){throw new JSUnitTestException(`Test '${a["class"]}.${a.method}' failed, ${b} at line '${a.line}'`,c)}isExpectingException(a,b){for(let c,d=0;d<this.expectExceptions.length;d++)if(c=this.expectExceptions[d],c.class==a&&c.method==b)return c;return!1}expectException(a){let b=JSUnitTest.getFunctionCaller(this);this.addAssertion(b),"string"==typeof a?b.exception=a:"object"==typeof a&&(b.exception=a.constructor.name),this.expectExceptions.push(b)}assertTrue(a){let b=JSUnitTest.getFunctionCaller(this);this.addAssertion(b),!0!==a&&this.throwException(b)}assertFalse(a){let b=JSUnitTest.getFunctionCaller(this);this.addAssertion(b),!1!==a&&this.throwException(b)}assertEmpty(a){let b=JSUnitTest.getFunctionCaller(this);this.addAssertion(b),a===void 0||null===a||this.throwException(b)}assertUndefined(a){let b=JSUnitTest.getFunctionCaller(this);this.addAssertion(b),a!==void 0&&this.throwException(b)}assertNull(a){let b=JSUnitTest.getFunctionCaller(this);this.addAssertion(b),null!==a&&this.throwException(b)}addAssertEqualsObjectDiffText(a,b){return[...`${a}`.split("\r"),...b]}indents(a){return"\t".repeat(a)}objectToString(a,b,c,d=!1){let e=[];for(const f in a)!1===(d&&("null"==a[f]||null==a[f]))&&e.push(`${this.indents(c+1)}- [${f}] => ${a[f]}\n`);return[`${this.indents(c)}${b} (\n`,...e,`${this.indents(c)})\n`]}getObjectChange(a,b,c){let d=[];for(const e in a)if(b[e]!==void 0){let f=gettype(a[e]),g=gettype(b[e]);if(f!==g)d.push(`${this.indents(c+1)}- [${e}] => ${a[e]}\n`),d.push(`${this.indents(c+1)}+ [${e}] => ${b[e]}\n`);else switch(!0){case!1!==is_object_type(f):if(a[e]===b[e])continue;let g=is_object_type(f),h=this.compareObject(a[e],b[e],g,c+3);2<h.length&&(d.push(`${this.indents(c+1)}- [${e}] => \n`),d=[...d,...this.objectToString(a[e],g,c+3)],d.push(`${this.indents(c+1)}+ [${e}] => \n`),d=[...d,...h]);break;case"literal"==f:if(a[e]===b[e])continue;let i="Literal",j=this.compareObject(a[e],b[e],i,c+3);2<j.length&&(d.push(`${this.indents(c+1)}- [${e}] => \n`),d=[...d,...this.objectToString(a[e],i,c+3)],d.push(`${this.indents(c+1)}+ [${e}] => \n`),d=[...d,...j]);break;case"array"==f:let k="Array",l=this.compareObject(this.convertArrayToObject(a[e]),this.convertArrayToObject(b[e]),k,c+3);2<l.length&&(d.push(`${this.indents(c+1)}- [${e}] => \n`),d=[...d,...this.objectToString(a[e],k,c+3)],d.push(`${this.indents(c+1)}+ [${e}] => \n`),d=[...d,...l]);break;default:a[e]!==b[e]&&(d.push(`${this.indents(c+1)}- [${e}] => ${a[e]}\n`),d.push(`${this.indents(c+1)}+ [${e}] => ${b[e]}\n`));}}else void 0===b[e]&&void 0!==a[e]&&d.push(`${this.indents(c+1)}- [${e}] => ${a[e]}\n`);for(const e in b)void 0===a[e]&&void 0!==b[e]&&d.push(`${this.indents(c+1)}+ [${e}] => ${b[e]}\n`);return d}convertArrayToObject(a){let b={};for(let c=0;c<a.length;c++)b[c]=a[c];return b}compareArray(a,b,c=0){a=this.convertArrayToObject(a),b=this.convertArrayToObject(b);let d=[`${this.indents(c)}Array (\n`,...this.getObjectChange(a,b,c),`${this.indents(c)})\n`];return!(2<d.length)||d}compareLiteral(a,b,c=0){let d=[`${this.indents(c)}Literal (\n`,...this.getObjectChange(a,b,c),`${this.indents(c)})\n`];return!(2<d.length)||d}compareObject(a,b,c,d=0){if(!this.objectReferences.includes(a))this.objectReferences.push(a);else return this.objectToString(a,c,d);if(!this.objectReferences.includes(b))this.objectReferences.push(b);else return this.objectToString(b,c,d);let e=[`${this.indents(d)}${c} (\n`,...this.getObjectChange(a,b,d),`${this.indents(d)})\n`];return!(2<e.length)||e}assertEquals(a,b){let c=JSUnitTest.getFunctionCaller(this);this.addAssertion(c);let d=gettype(a),e=gettype(b);d!==e&&this.throwException(c,`actual type '${e}' does not meet expected type '${d}'`);let f=null;switch(!0){case"float"==e:a!=b&&this.throwException(c,`actual (float) '${b}' does not meet expected (float) '${a}'`);break;case"int"==e:a!=b&&this.throwException(c,`actual (int) '${b}' does not meet expected (int) '${a}'`);break;case"boolean"==e:a!=b&&this.throwException(c,`actual (boolean) '${b}' does not meet expected (boolean) '${a}'`);break;case"function"==e:a!=b&&this.throwException(c,`actual (function) '${b}' does not meet expected (function) '${a}'`);break;case"string"==e:a!=b&&this.throwException(c,`actual (string) '${b}' does not meet expected (string) '${a}'`);break;case"array"==e:let d=this.compareArray(a,b);!0!==d&&(d=this.addAssertEqualsObjectDiffText(`Failed asserting that two arrays are equal.\n\r--- Expected.\n\r+++ Actual.\n`,d),this.throwException(c,`Expected array is not equal actual array`,d));break;case"literal"==e:let g=this.compareLiteral(a,b);!0!==g&&(g=this.addAssertEqualsObjectDiffText(`Failed asserting that two literal objects are equal.\n\r--- Expected.\n\r+++ Actual.\n`,g),this.throwException(c,`Expected object literal is not equal actual object literal`,g));break;case!1!==(f=is_object_type(e)):let h=this.compareObject(a,b,f);!0!==h&&(h=this.addAssertEqualsObjectDiffText(`Failed asserting that two objects are equal.\n\r--- Expected.\n\r+++ Actual.\n`,h),this.throwException(c,`Expected object of type '${f}' is not equal actual object`,h));break;default:a!=b&&this.throwException(c,`actual (unknown) '${b}' does not meet expected (unknown) '${a}'`);}}}class JSUnitTestRunner{constructor(){this.LOG_BREAK_AFTER_TESTS=50,this.version="1.0",this.runnerClass=null,this.testClasses=[],this.start=null,this.end=null,this.delta=null,this.tests=[],this.success=0,this.assertions=[],this.log="",this.logStyles=[]}addTest(a){this.testClasses.push(a)}createTestsArray(){this.testClasses.forEach(a=>{Object.getOwnPropertyNames(a.__proto__).forEach(b=>{/^test/g.test(b)&&this.tests.push(a[b])})})}addLog(a,b="background: white; color: black; font-weight: normal"){this.log+=0==this.logStyles.length%JSUnitTestRunner.LOG_BREAK_AFTER_TESTS&&0!==this.logStyles.length?`%c${a}\n`:`%c${a}`,this.logStyles.push(b)}printLog(){console.log(this.log,...this.logStyles)}runTests(a=!1){this.start=new Date().getTime(),this.createTestsArray(),this.testClasses.forEach(a=>{a.setUpBeforeClass&&a.setUpBeforeClass(),Object.getOwnPropertyNames(a.__proto__).forEach(b=>{let c=a.constructor.name,d=b;if(/^test/g.test(d)){a.setUp&&a.setUp();var e=!1;try{a[d]()}catch(b){if(e=a.isExpectingException(c,d),!1!==e)b.constructor.name!==e.exception&&a.throwException(e,`failed asserting that exception of type '${e.exception}' is thrown, received ${b.constructor.name}`);else throw b}var f=a.isExpectingException(c,d);!1===e&&!1!==f&&a.throwException(f,`failed asserting that exception of type '${f.exception}' is thrown`),this.success+=1,a.assertions.includes(`${a.constructor.name}.${d}`)?this.verbose?console.log(`${d}: Success (${this.success}/${this.tests.length})`):this.addLog(`.`):this.verbose?console.log(`%c${d}: No Assertion (${this.success}/${this.tests.length})`,"background: #e5e510; color: black; font-weight: bolder"):this.addLog(`R`,"background: #e5e510; color: black; font-weight: bolder"),a.tearDown&&a.tearDown()}}),a.tearDownAfterClass&&a.tearDownAfterClass(),this.assertions=[...this.assertions,...a.assertions]}),this.verbose||this.printLog(),this.success===this.tests.length&&(this.end=new Date().getTime(),this.delta=new Date().setTime(this.end-this.start),console.log(`Time: ${this.delta} ms`),this.tests.length===this.assertions.length?console.log(`%c OK (${this.tests.length} ${1===this.tests.length?"test":"tests"}, ${this.assertions.length} ${1===this.assertions.length?"assertion":"assertions"}) `,"line-height: 1.1rem; background: #0dbc79; color: black; font-weight: bolder"):console.log(`%c OK, but incomplete, skipped, or risky tests! \n Tests: ${this.tests.length}, Assertions: ${this.assertions.length}) `,"line-height: 1.1rem; background: #e5e510; color: black; font-weight: bolder"))}getUserAgent(){return navigator.userAgent.replaceAll(")",")\n").split("\n").map((a,b)=>`${0==b?"\t".repeat(0):"\t".repeat(3)}${a.trim()}`).join("\n")}showJSUnitInfo(){console.log(`%c\n JSUnit ${this.version} by Gijs Bos and contributors. \n\n Runtime:\t${this.getUserAgent()} \n`,"line-height: 1.1rem")}static runner(a){JSUnitTestRunner.runnerClass=new JSUnitTestRunner,a(JSUnitTestRunner.runnerClass),JSUnitTestRunner.run=(a=!1)=>{JSUnitTestRunner.runnerClass.verbose=a,JSUnitTestRunner.runnerClass.showJSUnitInfo();try{JSUnitTestRunner.runnerClass.runTests()}catch(a){if(a instanceof JSUnitTestException)a.getData()&&"array"==gettype(a.getData())&&console.log(...a.getData()),console.log(`${a.getMessage()}`);else throw a}}}}