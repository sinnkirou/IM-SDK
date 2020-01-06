const path = require('path');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 用于将组件的css打包成单独的文件输出到`dist`目录中

const devConfig = {
	entry: './src/index.ts',
	mode: 'production',
	output: {
		path: path.resolve(__dirname, '../dist'),
		filename: 'index.js', // 输出文件
		libraryTarget: 'umd', // 采用通用模块定义, 注意webpack到4.0为止依然不提供输出es module的方法，所以输出的结果必须使用npm安装到node_modules里再用，不然会报错
		library: 'nlp-tree-compoment', // 库名称
		libraryExport: 'default' // 兼容 ES6(ES2015) 的模块系统、CommonJS 和 AMD 模块规范
	},
	externals: {
		react: {
			root: 'React',
			commonjs2: 'react',
			commonjs: 'react',
			amd: 'react'
		},
		'react-dom': {
			root: 'ReactDOM',
			commonjs2: 'react-dom',
			commonjs: 'react-dom',
			amd: 'react-dom'
		},
		moment: {
			commonjs: 'moment', //如果我们的库运行在Node.js环境中，import moment from 'moment'等价于const moment = require('moment')
			commonjs2: 'moment', //同上
			amd: 'moment', //如果我们的库使用require.js等加载,等价于 define(["moment"], factory);
			root: 'moment' //如果我们的库在浏览器中使用，需要提供一个全局的变量‘moment’，等价于 var moment = (window.moment) or (moment);
    },
    uuid: {
			root: 'uuid',
			commonjs2: 'uuid',
			commonjs: 'uuid',
			amd: 'uuid'
		},
	},
	module: {
		rules: [
			{
				test: /\.(le|c)ss$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					{
						loader: 'less-loader',
						options: {
							sourceMap: false
						}
					}
				]
			}
		]
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'main.min.css' // 提取后的css的文件名
		})
	]
};

module.exports = merge(devConfig, baseConfig);
