import gulp from "gulp";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import cleanCSS from "gulp-clean-css";
import rename from "gulp-rename";
import autoprefixer from "gulp-autoprefixer";
import imagemin from "gulp-imagemin";
import newer from "gulp-newer";
import plumber from "gulp-plumber";
import debug from "gulp-debug";
import gulpIf from "gulp-if";
import { deleteAsync } from "del"; 
import fileInclude from "gulp-file-include";
import bs from "browser-sync";
import fonter from "gulp-fonter";
import ttf2woff2 from "gulp-ttf2woff2";

const sass = gulpSass(dartSass);
const { src, dest, watch, series, parallel } = gulp;

/*- fonts -*/
const fontsSrc = "src/fonts/**/*.{ttf,otf}";
const fontsDest = "dist/fonts/";

export function fonts() {
  // OTF → TTF
  src("src/fonts/**/*.otf")
    .pipe(plumber())
    .pipe(fonter({ formats: ["ttf"] }))
    .pipe(dest(fontsDest))
    .pipe(debug({ title: "FONTS (OTF→TTF):" }));

  // Просто копируем все TTF в dist
  src("src/fonts/**/*.ttf")
    .pipe(plumber())
    .pipe(dest(fontsDest))
    .pipe(debug({ title: "FONTS (COPY TTF):" }));

  // TTF → WOFF
  src("src/fonts/**/*.ttf")
    .pipe(plumber())
    .pipe(fonter({ formats: ["woff"] }))
    .pipe(dest(fontsDest))
    .pipe(debug({ title: "FONTS (TTF→WOFF):" }));

  // TTF → WOFF2
  return src("src/fonts/**/*.ttf")
    .pipe(plumber())
    .pipe(ttf2woff2())
    .pipe(dest(fontsDest))
    .pipe(debug({ title: "FONTS (TTF→WOFF2):" }));
}

/*- paths -*/
const paths = {
  html: {
    src: ["src/*.html", "!src/partials/**"],
    watch: ["src/**/*.html"],
    dest: "dist/",
  },
  styles: {
    src: "src/scss/**/*.scss",
    dest: "dist/css/",
  },
  css: {
    src: "src/css/**/*.css",
    dest: "dist/css/",
  },
  images: {
    src: "src/img/**/*.{jpg,jpeg,png,svg,gif,webp}",
    dest: "dist/img/",
  },
  js: {
    src: "src/js/**/*.js",
    dest: "dist/js/",
  },
};

/*- clean -*/
export function clean() {
  return deleteAsync(["dist"]);
}

/*- html -*/
export function html() {
  return src(paths.html.src)
    .pipe(plumber())
    .pipe(fileInclude({ prefix: "@@", basepath: "@file" }))
    .pipe(dest(paths.html.dest))
    .pipe(debug({ title: "HTML:" }))
    .pipe(bs.stream());
}

/*- styles -*/
export function styles() {
  return src(paths.styles.src, { sourcemaps: false })
    .pipe(plumber())
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(dest(paths.styles.dest))
    .pipe(debug({ title: "SCSS:" }))
    .pipe(bs.stream());
}

/*- css -*/
export function css() {
  return src(paths.css.src)
    .pipe(plumber())
    .pipe(newer(paths.css.dest))
    .pipe(dest(paths.css.dest))
    .pipe(debug({ title: "CSS (plugins):" }))
    .pipe(bs.stream());
}

/*- images -*/
export async function images() {
  const webp = (await import("gulp-webp")).default;

  // jpg/png → webp
  src("src/img/**/*.{jpg,jpeg,png}")
    .pipe(plumber())
    .pipe(newer({ dest: paths.images.dest, ext: ".webp" }))
    .pipe(webp())
    .pipe(dest(paths.images.dest))
    .pipe(debug({ title: "WEBP:" }));

  // svg просто копируем (и оптимизируем)
  return src("src/img/**/*.svg")
    .pipe(plumber())
    .pipe(newer(paths.images.dest))
    .pipe(imagemin())
    .pipe(dest(paths.images.dest))
    .pipe(debug({ title: "SVG:" }))
    .pipe(bs.stream());
}

/*- js -*/
export function js() {
  return src(paths.js.src)
    .pipe(plumber())
    .pipe(newer(paths.js.dest))
    .pipe(dest(paths.js.dest))
    .pipe(debug({ title: "JS:" }))
    .pipe(bs.stream());
}

/*- serve -*/
export function serve() {
  bs.init({
    server: {
      baseDir: "dist/",
    },
  });

  watch(paths.html.watch, html);
  watch(paths.styles.src, styles);
  watch(paths.css.src, css);
  watch(paths.images.src, images);
  watch(paths.js.src, js);
}

/*- favicon -*/
export function favicon() {
  return src("src/favicon.ico")
    .pipe(plumber())
    .pipe(dest("dist/"))
    .pipe(debug({ title: "FAVICON:" }));
}

/*- default -*/
export default series(
  clean,
  parallel(html, styles, css, images, js, fonts, favicon),
  serve
);
