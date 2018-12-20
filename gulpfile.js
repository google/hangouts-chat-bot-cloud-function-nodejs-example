/*
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const {src, dest, series, parallel} = require('gulp');
const clean = require('gulp-clean');
const beautify = require('gulp-beautify');
const eslint = require('gulp-eslint');
const zip = require('gulp-zip');
const size = require('gulp-size');
const install = require('gulp-install');

const cleanOutput = () => src(['dist/'], {read: false, allowEmpty: true}).
    pipe(clean({force: true}));

const preparePackages = () => src(['./package.json']).
    pipe(dest('dist/'));

const lintCode = () => src(['src/**/*.js']).
    pipe(eslint({configFile: '.eslintrc.json'})).
    pipe(eslint.format());

const beautifyCode = () => src(['src/**/*.js']).
    pipe(beautify({
      indent_size: 2,
      preserve_newlines: false,
    })).
    pipe(size()).
    pipe(dest('dist/src/'));

const copyStatic = () => src(['src/**/*.html']).
    pipe(size()).
    pipe(dest('dist/src/'));

const createZip = () => src(['dist/**']).
    pipe(zip('function.zip')).
    pipe(size()).
    pipe(dest('dist/'));

exports.default =
    series(
        cleanOutput,
        parallel(lintCode, preparePackages, beautifyCode, copyStatic),
        createZip
    );