// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
const gulp = require('gulp');
// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
const terser = require("gulp-terser");
// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
const bundle = require('gulp-bundle');
// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
const rename = require('gulp-rename');
// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
var sourcemaps = require('gulp-sourcemaps');
    

// eslint-disable-next-line no-undef


function build() {
  return gulp.src('./dist/**/*.js')
  .pipe(sourcemaps.init(), { loadMaps: true })
  .pipe(gulp.dest('./build'));
}


// eslint-disable-next-line no-undef
exports.default = gulp.parallel(build);