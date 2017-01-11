const gulp = require('gulp');
const imagemin = require('gulp-imagemin');              // 图片压缩
const pngquant = require('imagemin-pngquant');          // png图片压缩
const stylus = require('gulp-stylus');                  // 编译stylus
const replace = require('gulp-replace');                //- 路径替换
//const uglify = require('gulp-uglify');                  // js丑化
const argv = require('minimist')(process.argv.slice(2));

const pagePath = 'ROOT/WEB-INF/html_qzw_v2/activity/monthlyActivity2';
const staticPath = 'ROOT/themes/soonmes_qzw_v2/activity/monthlyActivity2/static/';
const staticPathStr = '/themes/soonmes_qzw_v2/activity/monthlyActivity2/static/';

var apiUrl = argv.env ? 'http://'+argv.env+'.qian360.com' : 'https://www.qian360.com';
var h5ApiUrl = argv.env ? 'http://h5.'+argv.env+'.qian360.com/' : 'https://h5.qian360.com/';
var timestamp = Date.now();
var project = argv.proj;
function replaceFn(){
    return replace(/\/?static\/([^\,\'\"]*)\.(jpg|gif|png|css|js|mp3)/g, staticPathStr+'$1.$2?t='+timestamp);
}
function replaceCssFn(){
    return replace(/\.(jpg|gif|png)('|"|\))/g, '.$1?t='+timestamp+'$2');
}
// 发布公共js文件
gulp.task('commonModuleJs', function(){
    return gulp.src('app/static/script/modules/*.js')
        .pipe(replace(/if\(true\)/g, "if(false)"))
        .pipe(replace(/var\s+pageUrl\s+=\s+.*;/g, "var pageUrl = require('url-map');"))
        .pipe(replace(/var\s+apiUrl\s+=\s+.*;/g, "var apiUrl = '"+apiUrl+"';"))
        .pipe(replace(/var\s+h5ApiUrl\s+=\s+.*;/g, "var h5ApiUrl = '"+h5ApiUrl+"';"))
        .pipe(replaceFn())
        .pipe(gulp.dest(staticPath+'/script/modules'));
});
gulp.task('commonJs', ['commonModuleJs'], function(){
    return gulp.src('app/static/script/*.js')
        .pipe(gulp.dest(staticPath+'/script'));
});
// 发布公共图片 并压缩
gulp.task('registerImg', function(){
    return gulp.src('app/static/images/register/*.*')
        .pipe(imagemin({
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            svgoPlugins: [{removeViewBox: false}], //不要移除svg的viewbox属性
            use: [pngquant()]  //使用pngquant深度压缩png图片的imagemin插件
        }))
        .pipe(gulp.dest(staticPath+'/images/register'));
});
gulp.task('commonImg', ['registerImg'], function(){
    return gulp.src('app/static/images/*.*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(staticPath+'/images'));
});
// 发布公共css 编译压缩 文件内部图片链接加时间戳
gulp.task('commonCss', function(){
    return gulp.src('app/static/style/*.styl')
        .pipe(stylus({
            compress: true  //css压缩
        }))
        .pipe(replaceCssFn())
        .pipe(gulp.dest(staticPath+'/style'));
});
// 发布公共iconfont文件
gulp.task('commonIconfont', function(){
    return gulp.src('app/static/style/iconfont/**')
        .pipe(gulp.dest(staticPath+'/style/iconfont'));
});
// 发布公共文件 html文件内部引用加

// 时间戳
gulp.task('common', ['commonJs', 'commonImg', 'commonCss', 'commonIconfont'], function(){
    return gulp.src('app/*.html')
        .pipe(replaceFn())
        .pipe(gulp.dest(pagePath));
});

// 发布指定目录js文件
gulp.task('projectJs', function(){
    return gulp.src('app/static/script/'+project+'/**/*.js')
        //.pipe(uglify({
        //    mangle: {except: ['require' ,'exports' ,'module' ,'$']}//排除混淆关键字
        //}))
        .pipe(gulp.dest(staticPath+'/script/'+project));
});
// 发布指定目录图片 并压缩
gulp.task('projectImg', function(){
    return gulp.src('app/static/images/'+project+'/**/*.*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(staticPath+'/images/'+project));
});
// 发布指定目录css文件 编译并压缩 引用图片后加时间戳
gulp.task('projectCss', function(){
    return gulp.src('app/static/style/'+project+'/**/*.styl')
        .pipe(stylus({
            compress: true
        }))
        .pipe(replaceCssFn())
        .pipe(gulp.dest(staticPath+'/style/'+project));
});
// 发布指定目录其他类型文件
gulp.task('projectOther', function(){
    return gulp.src(['app/static/script/'+project+'/**/*.*', '!app/static/script/'+project+'/*.js'])
        .pipe(gulp.dest(staticPath+'/script/'+project));
});

// 发布指定目录 html 内部引用加时间戳
gulp.task('project', ['projectJs', 'projectImg', 'projectCss', 'projectOther', 'common'], function(){
    return gulp.src('app/'+project+'/**/*.html')
        .pipe(replaceFn())
        .pipe(gulp.dest(pagePath+'/'+project));
});