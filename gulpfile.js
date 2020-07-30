"use strict";

//  Через src считывает. Через dest помещает.
const {src,dest} = require("gulp");
const gulp = require("gulp");

//  Подключаем плагины. 
const autoprefixer = require("gulp-autoprefixer");
const cssbeautify = require("gulp-cssbeautify");
const removeComments = require('gulp-strip-css-comments');
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const cssnano = require("gulp-cssnano");
const rigger = require("gulp-rigger");
const uglify = require("gulp-uglify");
const plumber = require("gulp-plumber");
const imagemin = require("gulp-imagemin");
const del = require("del");
const panini = require("panini");
const browsersync = require("browser-sync").create();

// Откуда будут браться исходники и куда будут улетать
let path = {
    // Куда перемещаем исходники
    build: {
        html: 'dist/',
        js: 'dist/assets/js/',
        css: 'dist/assets/css/',
        images: 'dist/assets/img/'
    },
    // Исходники
    src: {
        html: 'src/*.html',
        js: 'src/assets/js/*.js',
        css: 'src/assets/sass/style.scss',
        // ? ** означает,что могут быть подпапки
        images: 'src/assets/img/**/*.{jpg,png,svg,gif,ico}'
    },
    // Пути к файлам,за которыми мы будем наблюдать. 
    // Чтобы происходила перезагрузка страницы при изменении файдлв
    watch: {
        html: 'src/**/*.html',
        js: 'src/assets/js/**/*.js',
        css: 'src/assets/sass/**/*.scss',
        // ? ** означает,что могут быть подпапки
        images: 'src/assets/img/**/*.{jpg,png,svg,gif,ico}'
    },
    // Где будут храниться все скомпелированные файлы
    // Будет очищать папку dist перед дем,как в нее загрузить скомпелированные файлы
    // За очистку отвечает плагин del
    clean: './dist'
}

// Gulp Task

/* Tasks */
// Локальный сервер
function browserSync(done) {
    browsersync.init({
        server: {
            baseDir: "./dist/"
        },
        port: 5000
    });
}

function browserSyncReload(done) {
    browsersync.reload();
}

function html() {
    panini.refresh()
    // Считывание
    return src(path.src.html, { base: "src/" })
        // Запись
        .pipe(plumber())
        .pipe(panini({
            root: 'src/',
            layouts: 'src/template/layouts/',
            partials: 'src/template/partials/',
            helpers: 'src/template/helpers/',
            data: 'src/template/data/'
          }))
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream());
}

function css() {
    return src(path.src.css, { base: "src/assets/sass/" })
        .pipe(plumber())
        .pipe(sass())
        .pipe(autoprefixer({
            overrideBrowserslist:  ['last 5 versions'],
            cascade: true
        }))
        .pipe(cssbeautify())
        .pipe(dest(path.build.css))
        .pipe(cssnano({
            zindex: false,
            discardComments: {
                removeAll: true
            }
        }))
        .pipe(removeComments())
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream());
}

function js() {
    return src(path.src.js, {base: './src/assets/js/'})
        .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest(path.build.js))
        .pipe(uglify())
        .pipe(rename({
            suffix: ".min",
            extname: ".js"
        }))
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream());
}

function images() {
    return src(path.src.images)
        .pipe(imagemin())
        .pipe(dest(path.build.images));
}

function clean() {
    return del(path.clean);
}
// Следит за всеми изменениями
function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.images], images);
}

// Выполнение всех тасков
// Очистка и вызов всех тасков 
const build = gulp.series(clean, gulp.parallel(html, css, js, images));
// Вызываем билд
// Очистка и вызов всех тасков затем вотчер и локальный сервер
const watch = gulp.parallel(build, watchFiles, browserSync);



/* Exports Tasks */
exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
// Дефолтный таск, который запускает watch
exports.default = watch;
