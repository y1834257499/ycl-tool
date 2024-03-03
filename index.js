import fs from "fs";
import crypto from "crypto";
import dotenv from "dotenv";
import chalk from "chalk";
import minimist from "minimist";

// env初始化
dotenv.config()

const tool = {
    /**
     * 休眠
     * @param {number} ms
     * @returns {Promise<unknown>}
     */
    sleep: async (ms) => {
        return new Promise(resolve => setTimeout(() => resolve(), ms));
    },

    /**
     * 停止进程
     * @param text
     */
    exitProcess: (...text) => {
        console.error(...text);
        process.exit(1);
    },

    /**
     * 获取当前时间戳
     * @returns {number}
     */
    getTime: () => {
        return Math.round(new Date().getTime() / 1000);
    },

    /**
     * 获取typeof
     * @param {*} value
     * @returns {"undefined"|"object"|"boolean"|"number"|"string"|"function"|"symbol"|"bigint"}
     */
    getTypeof: (value) => {
        return (typeof value);
    },

    /**
     * 判断是否一个方法
     * @param {*} value
     * @returns {boolean}
     */
    isFunction: (value) => {
        return tool.getTypeof(value) === "function";
    },

    /**
     * 判断是否是一个对象
     * @param {*} value
     * @returns {boolean}
     */
    isObject: (value) => {
        return tool.getTypeof(value) === "object";
    },

    /**
     * 判断是否是一个数组
     * @param {*} value
     * @returns {boolean}
     */
    isArray: (value) => {
        return Array.isArray(value);
    },

    /**
     * 判断是否是一个空对象
     * @param {*} value
     * @return {boolean}
     */
    isEmptyObject: (value) => {
        return !tool.isObject(value) || Object.keys(value).length === 0;
    },

    /**
     * 判断是否为空
     * @param {*} value
     * @return {boolean}
     */
    isEmpty: (value) => {
        return !value || (tool.isObject(value) && tool.isEmptyObject(value));
    },

    /**
     * 判断是否是一个字符串
     * @param {*} value
     * @returns {boolean}
     */
    isString: (value) => {
        return tool.getTypeof(value) === "string";
    },

    /**
     * 判断是否是一个数字
     * @param {*} value
     * @returns {boolean}
     */
    isNumber: (value) => {
        return tool.getTypeof(value) === "number" || (tool.isString(value) && !isNaN(Number(value)));
    },

    /**
     * 判断是否是一个整数
     * @param {*} value
     * @returns {boolean}
     */
    isInt: (value) => {
        return tool.isNumber(value) && value == parseInt(value);
    },

    /**
     * 判断是否是一个浮点数
     * @param {*} value
     * @returns {boolean}
     */
    isFloat: (value) => {
        return tool.isNumber(value) && value == parseFloat(value);
    },

    /**
     * 判断是否是一个大数字
     * @param {*} value
     * @returns {boolean}
     */
    isBigint: (value) => {
        return tool.getTypeof(value) === "bigint";
    },

    /**
     * 判断是否是一个boolean
     * @param {*} value
     * @returns {boolean}
     */
    isBoolean: (value) => {
        return tool.getTypeof(value) === "boolean";
    },

    /**
     * 判断是否是一个json
     * @param {*} value
     * @returns {boolean}
     */
    isJson: (value) => {
        try {
            if (typeof value == "object" || typeof JSON.parse(value) == "object") {
                return true;
            }
        } catch (e) {

        }
        return false;
    },

    /**
     * 判断字符串中是否包含数组中的字符串
     * @param {array} arr
     * @param {string} str
     * @returns {boolean|string}
     */
    isStrIncludeArrStr: (arr, str) => {
        for (let i = 0; i < arr.length; i++) {
            if (str.includes(arr[i])) {
                return arr[i];
            }
        }
        return false;
    },

    /**
     * 获取字符串中包含对象中的字符串
     * @param {object} list
     * @param {string} str
     * @returns {{value: string, key: string}|boolean}
     */
    getStrIncludeListStr: (list, str) => {
        for (let listKey in list) {
            if (str.includes(list[listKey])) {
                return {key: listKey, value: list[listKey]};
            }
        }
        return false;
    },

    /**
     * 获取对象指定键的值
     * @param {object} object 对象
     * @param {string} key 键
     * @param {*} [value=undefined] 默认值
     * @returns {*}
     */
    getObjectValue: (object, key, value) => {
        object = tool.isObject(object) ? object : {};
        return object.hasOwnProperty(key) ? object[key] : value;
    },

    /**
     * 删除对象指定的键
     * @param {object} object 对象
     * @param {string} key 键
     * @return {boolean}
     */
    delObjectValue: (object, key) => {
        return object.hasOwnProperty(key) ? (delete object[key]) : true;
    },

    /**
     * 判断对象中是否存在某个值
     * @param {object} object 对象
     * @param {string} value 值
     * @return {boolean}
     */
    isObjectValue: (object, value) => {
        for (let k in object) {
            if (object.hasOwnProperty(k) && object[k] === value) {
                return true;
            }
        }
        return false;
    },

    /**
     * 字符串转json
     * @param value
     * @returns {boolean}
     */
    strToJson: (value) => {
        if (!value.startsWith('JSON_')) return false;
        value = value.substring(5);
        try {
            // 解析特殊字符
            function parseObj(obj) {
                for (let key in obj) {
                    if (typeof obj[key] === 'object') {
                        obj[key] = parseObj(obj[key]);
                    } else if (typeof obj[key] === 'string' && obj[key].startsWith('BigInt_')) {
                        obj[key] = BigInt(obj[key].substring(7));
                    }
                }
                return obj;
            }

            let value_ = JSON.parse(value);
            if (typeof value == "object" || typeof value_ == "object") return parseObj(value_);
        } catch (e) {}
        return false;
    },

    /**
     * json转字符串
     * @param obj
     * @returns {string}
     */
    jsonToStr: (obj) => {
        obj = tool.isArray(obj) ? obj : Object.assign({}, obj);
        return `JSON_` + JSON.stringify(obj, (key, value) => {
            if (typeof value === 'bigint') {
                return `BigInt_${value.toString()}`;
            }
            return value;
        });
    },

    /**
     * 把时间戳转换为日期格式
     * @param {*} $timestamp 时间戳
     * @param {string|null} $format 指定格式
     * @returns {*}
     */
    formatTime: ($timestamp = null, $format = null) => {
        if (!$format) $format = 'Y-m-d H:i:s';
        let $time;
        if (true === $timestamp || tool.isArray($timestamp)) {
            $time = tool.isArray($timestamp) ? new Date($timestamp[0]) : new Date();
            $time = new Date($time.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'}))
        } else if ($timestamp && isNaN(Number($timestamp))) {
            $time = new Date($timestamp);
        } else {
            $time = $timestamp ? new Date(Math.round($timestamp * 1000)) : new Date();
        }
        if ($format.indexOf('Y') >= 0) {
            let y = $time.getFullYear().toString();
            $format = $format.replace(/Y/g, y);
        }
        if ($format.indexOf('m') >= 0) {
            let m = $time.getMonth() + 1;
            $format = $format.replace(/m/g, (m < 10 ? '0' + m : m));
        }
        if ($format.indexOf('d') >= 0) {
            let d = $time.getDate();
            $format = $format.replace(/d/g, (d < 10 ? '0' + d : d));
        }
        if ($format.indexOf('H') >= 0) {
            let d = $time.getHours();
            $format = $format.replace(/H/g, (d < 10 ? '0' + d : d));
        }
        if ($format.indexOf('i') >= 0) {
            let d = $time.getMinutes();
            $format = $format.replace(/i/g, (d < 10 ? '0' + d : d));
        }
        if ($format.indexOf('s') >= 0) {
            let d = $time.getSeconds();
            $format = $format.replace(/s/g, (d < 10 ? '0' + d : d));
        }
        return $format;
    },

    /**
     * 获取随机字符串 若不传参则返回32 存在最小长度不存在最大长度，返回最小长度 存在最大长度不存在最小长度，返回10位到最大长度的随机数 最小最大都存在返回区间值
     * @param {number} [min=32] 最小长度
     * @param {number} [max=0] 最大长度
     * @param {boolean} [isNum=true] 是否包含数字
     * @returns {string}
     */
    randomStr: (min = 32, max = 0, isNum = true) => {
        let length = (undefined === min) ? ((undefined === max) ? 32 : 10) : Math.floor(min);
        length = isNaN(length) ? 32 : length;
        if (undefined !== max) {
            max = Math.floor(max);
            max = isNaN(max) ? Math.round(Math.random() * 22 + 10) : max;
            length = Math.round(Math.random() * Math.abs(max - length)) + length;
        }

        let randowm_str = "",
            string = (isNum ? "0123456789" : "") + "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM",
            str_len = string.length - 1;
        for (let i = 0; i < length; i++) {
            randowm_str += string.charAt(Math.round(Math.random() * str_len));
        }
        return randowm_str;
    },

    /**
     * 重试一个函数
     * @param {function} callback 需要执行的函数
     * @param {number} maxCount 最大重试次数
     * @param {any} args
     * @returns {*}
     */
    retryFunction: async (callback, maxCount, ...args) => {
        let errorCount = 0, error;
        do {
            try {
                return await callback(...args);
            } catch (e) {error = e}
        } while (errorCount++ < maxCount);
        throw new Error(error);
    },

    /**
     * 异步执行一个函数
     * @param callback
     * @param args
     * @returns {Promise<void>}
     */
    asyncFunction: async (callback, args) => {
        if (!tool.isArray(args)) args = [args];
        await callback(...args);
    },


    /**
     * 多线程执行一个函数
     * @param {function} callback 需要执行的函数
     * @param {number} maxCount 最大进程
     * @param {function|number|string|array} argsList 参数
     * @param {boolean} [errLog=false] 是否显示错误日志
     * @param {boolean} [execLog=false] 是否显示执行日志
     * @returns {Promise<{diffTime: number, successCount: number, errorCount: number}>}
     */
    processFunction: async (callback, maxCount, argsList, errLog = false, execLog = false) => {
        // 处理参数
        if (tool.isFunction(argsList)) {
            argsList = argsList();
        } else if (tool.isNumber(argsList)) {
            let argsList_ = [];
            for (let i = 0; i < argsList; i++) {
                argsList_.push([]);
            }
            argsList = argsList_;
        }
        // 创建异步执行函数
        let asyncFunction = async function (callback, args, execCount) {
            if (execLog) console.log(`开始执行第 ${execCount} 次`);
            try {
                await tool.asyncFunction(callback, args);
                successCount++;
            } catch (e) {
                if (errLog) console.log(e);
                errorCount++;
            }
            processCount--;
            if (execLog) console.log(`第 ${execCount} 次执行完成`);
        }
        // 记录进程数和开始时间
        let processCount = 0, execCount = 0, successCount = 0, errorCount = 0, startTime = new Date().getTime();
        for (let i in argsList) {
            // 判断进程数量
            while (processCount >= maxCount) {
                await tool.sleep(5);
            }
            // 开始执行
            processCount++;
            execCount++;
            asyncFunction(callback, argsList[i], execCount).then();
        }
        // 判断进程是否执行完毕
        while (processCount > 0) {
            await tool.sleep(5);
        }
        // 返回执行时间，单位秒
        let endTime = new Date().getTime();
        return {
            successCount: successCount,
            errorCount: errorCount,
            diffTime: parseFloat(((endTime - startTime) / 1000).toFixed(3))
        };
    },

    /**
     * 多线程同时执行多个函数
     * @param funcList
     */
    processFunctions: async (...funcList) => {
        // 创建异步执行函数
        let asyncFunction = async function (func) {
            try {
                await func()
                successCount++
            } catch (e) {errorCount++}
            processCount--;
        }
        // 记录进程数和开始时间
        let processCount = 0, successCount = 0, errorCount = 0, startTime = new Date().getTime();
        for (let i in funcList) {
            // 开始执行
            processCount++;
            asyncFunction(funcList[i]).then();
        }
        // 判断进程是否执行完毕
        while (processCount > 0) {
            await tool.sleep(5);
        }
        // 返回执行时间，单位秒
        let endTime = new Date().getTime();
        return {
            successCount: successCount,
            errorCount: errorCount,
            diffTime: parseFloat(((endTime - startTime) / 1000).toFixed(3))
        };
    },

    /**
     * 替换模板变量
     * @param {string} template 模板如：我是：${name},我今年：${age}
     * @param {Object} templateData 变量如：{name: '脚本', age: 108}
     * @returns {*}
     */
    replaceTemplateVariables: (template, templateData) => {
        if (tool.isEmpty(template)) {
            return template;
        }
        let variableKeys = template.match(/\${[a-zA-Z1-9_]+}/g);
        if (!tool.isEmpty(variableKeys)) {
            for (let idx in variableKeys) {
                let variable = variableKeys[idx],
                    variable_ = variable.replace(/^(\${)+|(})+$/g, '');
                if (!templateData.hasOwnProperty(variable_)) {
                    throw new Error(`缺少变量：${variable_}`);
                }
                template = template.replace(new RegExp(`\\${variable}`, 'g'), templateData[variable_]);
            }
        }
        return template;
    },

    /**
     * 打乱数组
     * @param {[number]} arr
     * @returns {*}
     */
    shuffleTheArray: (arr) => {
        for (let i = 1; i < arr.length; i++) {
            let random = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[random]] = [arr[random], arr[i]];
        }
        return arr;
    },

    /**
     * 获取规则数据
     * @param {object} object
     * @param {object} rules {参数: {name: "名称", alias: "别名", rule: "规则：string|number|int|float|boolean", default: "默认值", value: "数据处理回调"}}
     * @returns {{}}
     */
    getObjectRuleData: (object, rules) => {
        let ruleData = {};
        for (let key in rules) {
            let rule = rules[key], name = tool.getObjectValue(rule, "alias", key),
                title = tool.getObjectValue(rule, "name", name), value;
            if (object.hasOwnProperty(name) && object[name] !== undefined && object[name] !== null && object[name] !== "") {
                value = object[name];
            } else {
                if (!rule.hasOwnProperty("default")) throw Error(`${title} 是必须的`);
                value = rule["default"];
            }
            // 验证数据类型
            if (rule.hasOwnProperty("rule")) {
                if (rule["rule"] === "string") {
                    if (!tool.isString(value)) throw Error(`${title} 不是一个字符串`);
                    value = value.toString();
                } else if (rule["rule"] === "number") {
                    if (!tool.isNumber(value)) throw Error(`${title} 不是一个数字`);
                    value = Number(value);
                } else if (rule["rule"] === "int") {
                    if (!tool.isInt(value)) throw Error(`${title} 不是一个整数`);
                    value = parseInt(value);
                } else if (rule["rule"] === "float") {
                    if (!tool.isFloat(value)) throw Error(`${title} 不是一个浮点数`);
                    value = parseFloat(value);
                } else if (rule["rule"] === "boolean") {
                    if (!tool.isBoolean(value)) throw Error(`${title} 不是布尔值`);
                } else if (tool.isFunction(rule["rule"])) {
                    let verify = rule["rule"](value);
                    if (tool.isObject(verify)) {
                        if (!verify.res) throw Error(verify.err);
                    } else if (!verify) throw Error(`${title} 规则错误`);
                } else {
                    throw Error(`${title} 错误的规则`);
                }
            }
            // 处理数据
            if (rule.hasOwnProperty("value") && tool.isFunction(rule["value"])) {
                value = rule["value"](value);
            }
            ruleData[key] = value;
        }
        return ruleData;
    },

    /**
     * 获取错误信息
     * @param {string|object|array} error
     * @param {string} replace 需要替换的消息，替换其中的{$error}为处理后的错误信息
     * @returns {string}
     */
    getErrorMessage: (error, replace = "") => {
        let stack = tool.isObject(error) && error.hasOwnProperty("stack") ? error.stack : "";
        error = tool.isArray(error) || tool.isObject(error) ? tool.jsonToStr(error) : error;
        error = `${error}${stack ? `    ${stack}` : ""}`;
        return replace ? replace.replace(`{$error}`, error) : error;
    },

    /**
     * 保存错误日志
     * @param error 错误信息
     * @param {string} file 错误文件，.log为文件后缀
     */
    saveErrorLog: (error, file = 'error.log') => {
        error = tool.isString(error) ? error : tool.getErrorMessage(error);
        error = `【${tool.formatTime(true)}】 ${error}\n\n\n`;
        try {
            fs.writeFileSync(`./error/${file}`, error, {flag: "a"});
        } catch (e) {
            console.log(`保存错误日志失败：${e.message}\n${error}`);
        }
    },

    /**
     * 启动异常处理
     * @param {string|function|boolean} handle function=自定义处理函数 string=错误输出到的error目录下的文件名字 boolean=控制台打印
     */
    startErrorHandle: (handle = false) => {
        function errorHandle(err, handle, type) {
            if (tool.isFunction(handle)) {
                handle(err, type);
            } else if (tool.isString(handle)) {
                tool.saveErrorLog(`未捕获的异常：${err.stack ? err.stack : JSON.stringify(err)}`, handle);
            } else {
                console.log(`未捕获的异常：${err.stack ? err.stack : JSON.stringify(err)}`);
            }
        }

        // 监控错误
        process.on('uncaughtException', (err) => {
            errorHandle(err, handle, 'uncaughtException')
        }).on('unhandledRejection', (err) => {
            errorHandle(err, handle, 'unhandledRejection')
        }).on('warning', (err) => {
            errorHandle(err, handle, 'warning')
        });
    },

    /**
     * md5加密
     * @param plaintext
     * @returns {string}
     */
    md5: (plaintext) => {
        const hash = crypto.createHash('md5');
        hash.update(plaintext.toString());
        return hash.digest('hex');
    },

    /**
     * sha256加密
     * @param plaintext
     * @returns {string}
     */
    sha256: (plaintext) => {
        const hash = crypto.createHash('sha256');
        hash.update(plaintext.toString());
        return hash.digest('hex');
    },

    /**
     * aes-256-cbc加密
     * @param text
     * @param key
     * @returns {string}
     */
    aes256cbcEncrypt: (text, key) => {
        key = tool.md5(key);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, key.slice(0, 16));
        let encrypted = cipher.update(text.toString(), 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return encrypted;
    },

    /**
     * aes-256-cbc解密
     * @param encrypted
     * @param key
     * @returns {string}
     */
    aes256cbcDecrypt: (encrypted, key) => {
        key = tool.md5(key);
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, key.slice(0, 16));
        let decrypted = decipher.update(encrypted, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    },

    /**
     * 获取env
     * @param {string} name
     * @param {number|string} type 类型: 1=string|2=boolean|3=number|4=int|5=float|6=bigint|7=json
     * @param {any} [$default=undefined]
     * @returns {*|string}
     */
    env: (name, type = "string", $default = undefined) => {
        let value = process.env[name.toString()];
        if (value === undefined) {
            if ($default === undefined) throw Error(`ENV中未获取到【${name}】`);
            value = $default;
        }
        type = tool.isString(type) ? type.toLowerCase() : type;
        switch (type) {
            case 1:
            case "string":
                return value;
            case 2:
            case "boolean":
                return value === "true" || value === true;
            case 3:
            case "number":
                return Number(value);
            case 4:
            case "int":
                return parseInt(value);
            case 5:
            case "float":
                return parseFloat(value);
            case 6:
            case "bigint":
                return BigInt(value);
            case 7:
            case "json":
                return tool.strToJson(value);
            default:
                return value;
        }
    },

    /**
     * 获取命令行启动参数 h/help：为内置参数，存在则必定打印帮助
     * @param {object} startUpArgs {参数: {name: "名称", alias: "别名", type: "规则：1=string|2=boolean|3=number|4=float", default: "默认值", callback: "回调函数，返回处理后的值"}}
     * @param {boolean} isHelp 无参数是否打印启动说明
     * @returns {{}}
     */
    getProcessStartUpArgs: (startUpArgs, isHelp = true) => {
        let startArgv = process.argv.slice(2),
            isShowHelp = minimist(startArgv, {string: ["help"], alias: {help: "h"}}).hasOwnProperty("h");
        // 判断是否需要打印帮助
        if (isShowHelp || (isHelp && startArgv.length < 3)) {
            // 打印参数
            let outputInfo = `启动示例：${chalk.blue('node xxxx.js --参数简称或全称 参数值')}\n启动参数列表：\n`;
            startUpArgs["help"] = {alias: "h", type: 2, default: false, name: "获取帮助"};
            for (let name in startUpArgs) {
                let info = startUpArgs[name];
                outputInfo += chalk.red(`${name}${info.hasOwnProperty("alias") ? `,${info.alias}` : ""}：`);
                if (info.hasOwnProperty("type")) {
                    let typeAlias = {1: "字符串", 2: "布尔值", 3: "数字", 4: "浮点数"};
                    outputInfo += `类型=${chalk.yellow(typeAlias[info.type])}，`;
                } else {
                    tool.exitProcess(chalk.red(`程序错误：启动参数 ${name} 缺少类型声明`));
                }
                outputInfo += info.hasOwnProperty("default") ? `default=${chalk.blue(info.default)}` : chalk.red("必填");
                outputInfo += `，${info.hasOwnProperty("name") ? info.name : ""}\n`;
            }
            tool.exitProcess(outputInfo.trim());
        }

        let argsString = [], argsBoolean = [], argsAlias = {}, argsDefault = {}, args = {};
        for (let name in startUpArgs) {
            let info = startUpArgs[name];
            // 添加别名映射
            if (info.hasOwnProperty("alias")) argsAlias[name] = info.alias;
            // 添加类型转换
            if (info.hasOwnProperty("type")) {
                info.type === 2 ? argsBoolean.push(name) : argsString.push(name);
            } else {
                tool.exitProcess(chalk.red(`程序错误：启动参数 ${name} 缺少类型声明`));
            }
            // 添加默认值
            if (info.hasOwnProperty("default")) argsDefault[name] = info.default;
        }
        // 获取启动参数值
        let argv = minimist(startArgv, {
            string: argsString, boolean: argsBoolean,
            alias: argsAlias, default: argsDefault
        });
        // 处理参数值
        for (let name in startUpArgs) {
            let info = startUpArgs[name];
            // 判断参数是否存在
            if (!argv.hasOwnProperty(name)) {
                tool.exitProcess(chalk.red(`缺少参数：${name}${info.hasOwnProperty("alias") ? `（${info.alias}）` : ""}`));
            }
            // 处理数据
            let value = argv[name];
            switch (info.type) {
                case 3:
                    if (!tool.isInt(value)) tool.exitProcess(chalk.red(`${name} 不是一个数字`));
                    value = parseInt(value);
                    break;
                case 4:
                    if (!tool.isFloat(value)) tool.exitProcess(chalk.red(`${name} 不是一个浮点数`));
                    value = parseFloat(value);
                    break;
            }
            // 保存数据
            args[name] = tool.isFunction(info.callback) ? info.callback(value) : value;
        }
        return args;
    },
}

export default tool;
