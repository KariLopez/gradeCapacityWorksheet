const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports={
    mode:'production',
    entry:{
        script: './src/script.js',
        styles: './src/styles.css'
    },
    output:{
        path:path.resolve(__dirname, 'dist'),
        filename:'[name].bundle.js',
        clean: true
    },
    plugins:[
        new HtmlWebpackPlugin({
            title: 'Development',
            template: './src/index.html'
        })
    ],
    module:{
        rules:[
            {
                test:/\.js$/,
                exclude:/node_modules/,
                use:{
                    loader:"script-loader"
                }
            },
            {
                test:/\.css$/i,
                use:['style-loader','css-loader'],
                
            }
        ]
    }
}