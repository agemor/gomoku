var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        lobby: './src/lobby.js',
        game: './src/game.js',
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: '[name].bundle.js',
    },

    devServer: {
        inline: true,
        port: 7777,
        contentBase: path.resolve(__dirname, "dist"),
    },

    module: {
        loaders: [{
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        }]
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: 'src/game.html' },
            { from: 'src/lobby.html', to: 'index.html' },
            { from: 'src/skeleton.css' },
            { from: 'src/images', to: 'images' }
        ]),
    ]
}