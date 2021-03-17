const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports={
    mode:'production',
    entry:{
        script: './app.js',
    },
    output:{
        path:path.resolve(__dirname, 'dist'),
        filename:'[name].js',
        clean: true
    },
    devtool: 'source-map',
    
    plugins:[
        new HtmlWebpackPlugin({
            title: 'Development',
            template: './src/index.html'
        })
    ],
    module:{
        rules:[
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: ['@babel/preset-env'],
                  },
                },
              },
           /* {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use:{
                    loader:'babel-loader',
                    options:{
                        presets:['@babel/preset-env']
                    }
                }
              },
            {
                test:/\.js$/,
                exclude:/node_modules/,
                use:{
                    loader:"script-loader"
                }
            },*/
            {
                test:/\.css$/i,
                use:['style-loader','css-loader'],
                
            }
        ]
    }
}