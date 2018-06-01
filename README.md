钱庄网活动页面项目
================
介绍--
----------------
钱庄活动页面，用于钱庄APP和微信端的活动页
项目依赖
----------------
该项目依赖与`gulp`构建工具，全局安装gulp `npm install gulp -g`;
还需要一个本地服务器工具，可以使用`http-server`,全局安装http-server `npm install http-server -g`;
下载项目依赖，运行`npm install`
页面预览
----------------
进入app目录，命令行下输入 `cd app` 在app目录下启动本地服务器 命令行下输入 `http-server`,默认使用`8080`端口；
浏览器输入URL http://localhost:8080/ 进入项目预览。
发布
----------------
采用 `gulp` 发布；
发布任务 `gulp project`；
发布时会读取 命令行 参数，有两个参数

    1. `--env` 发布到具体环境 test test3 或者正式（默认为正式环境 可不写该参数）
    2. `--proj` 发布的具体某个活动页 如要发布`m1511`则写`--proj m1511`(必写参数)

例子：

如要发布活动m20151212到test 命令行 `gulp project --env test --proj m20151212`;

如要发布活动m20151212到线上环境 命令行 `gulp project --proj m20151212`
项目结构
----------------
公共 `html` 页面直接放在 `./app` 目录下;
单独的活动的 `html` 页面在 `./app` 目录下新建文件夹放入其中；

`css`放在`./app/static`下的 `style`中，公共部分直接放在目录下，单独的活动新建对应文件夹

`image`放在`./app/static`下的 `images`中，公共部分直接放在目录下，单独的活动新建对应文件夹

`js`放在`./app/static`下的 `script`中，公共部分直接放在目录下，单独的活动新建对应文件夹
