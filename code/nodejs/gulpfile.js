const {src, dest, series, parallel} = require('gulp');
const clean = require('gulp-clean');
const beautify = require('gulp-beautify');
const eslint = require('gulp-eslint');
const zip = require('gulp-zip');
const size = require('gulp-size');
const install = require('gulp-install');

const cleanOutput = () => src(['../../output/nodejs/'], {read: false}).
    pipe(clean({force: true}));

const preparePackages = () => src(['./package.json']).
    pipe(dest('../../output/nodejs/dist')).
    pipe(install({
      ignoreScripts: true,
      noOptional: true,
      production: true,
    }));

const lintCode = () => src(['src/**/*.js']).
    pipe(eslint({configFile: '.eslintrc.json'})).
    pipe(eslint.format());

const beautifyCode = () => src(['src/**/*.js']).
    pipe(beautify({
      indent_size: 2,
      preserve_newlines: false,
    })).
    pipe(size()).
    pipe(dest('../../output/nodejs/dist/'));

const createZip = () => src(['../../output/nodejs/dist/**']).
    pipe(zip('function.zip')).
    pipe(size()).
    pipe(dest('../../output/nodejs/'));

exports.default =
    series(
        cleanOutput,
        parallel(lintCode, preparePackages, beautifyCode),
        createZip
    );