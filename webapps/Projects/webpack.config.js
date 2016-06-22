'use strict';

// webpack -w
// set NODE_ENV=production & webpack -p --optimize-minimize --optimize-dedupe

const path = require("path");
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const basePlugins = [
    new webpack.DefinePlugin({
        __DEV__: process.env.NODE_ENV !== 'production',
        __PRODUCTION__: process.env.NODE_ENV === 'production',
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    new webpack.optimize.CommonsChunkPlugin({
        name: ['app', 'vendor']
    }),
    /*new HtmlWebpackPlugin({
        template: './src/index.html',
        inject: 'body',
        minify: false
    }),*/
    new webpack.NoErrorsPlugin()
];

const devPlugins = [];

const prodPlugins = [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
        beautify: false,
        mangle: false,
        comments: false,
        sourceMap: false,
        compress: {
            warnings: false
        },
        output: {
            comments: false
        }
    }),
    // new CompressionPlugin({
    //     asset: 'vendor.js.gz',
    //     algorithm: 'gzip',
    //     regExp: /\.js$|\.html|\.css|.map$/,
    //     threshold: 10240,
    //     minRatio: 0.8
    // })
];

const plugins = basePlugins
    .concat(process.env.NODE_ENV === 'production' ? prodPlugins : [])
    .concat(process.env.NODE_ENV !== 'production' ? devPlugins : []);

module.exports = {

    debug: true,

    devtool: process.env.NODE_ENV === 'production' ? false : 'inline-source-map',

    entry: {
        app: './app/main.browser.ts',
        vendor: './app/vendors.ts'
    },

    output: {
        path: path.resolve(__dirname, 'js'),
        filename: '[name].js',
        publicPath: '/js/'
    },

    resolve: {
        extensions: ['', '.ts', '.js']
    },

    plugins: plugins,

    module: {
        loaders: [{
                test: /\.ts$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            }, {
                test: /\.html$/,
                loader: 'raw'
            },
            /*{ test: /\.css$/, loader: 'style-loader!css-loader?sourceMap' },
            { test: /\.svg/, loader: 'url' },
            { test: /\.eot/, loader: 'url' },
            { test: /\.woff/, loader: 'url' },
            { test: /\.woff2/, loader: 'url' },
            { test: /\.ttf/, loader: 'url' },*/
        ],
        noParse: [/zone\.js\/dist\/.+/]
    }
}
