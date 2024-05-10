const path = require('path');
const webpack = require('webpack');

module.exports = {
    context: __dirname + '/',
    entry: {
        ngscrolllist: './ngscrolllist.js',
    },
    output: {
        filename: '[name].min.js',
        path: path.resolve(__dirname, './../assets'),
        //library: 'global', //вывести в глобальную переменную код
    },
    externals: {
        prestashop: 'prestashop',
        $: '$',
        jquery: 'jQuery',
        Popper: ['popper.js', 'default']
    },
    plugins: [
        new webpack.ContextReplacementPlugin(/node_modules\/moment\/locale/, /ru|en-gb/), //указываем какие файлы подгружать модулем "moment"
    ]
    //watch: true, //проверяется на изменение и выполняется перезборка
    //devtool: 'cheap-inline-module-source-map',
};