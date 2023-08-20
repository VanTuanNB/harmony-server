const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
    entry: './src/index.ts', // Điểm bắt đầu của ứng dụng
    output: {
        filename: 'bundle.js', // Tên tệp bundle được tạo ra
        path: path.resolve(__dirname, 'dist'), // Thư mục đích cho bundle
    },
    resolve: {
        extensions: ['.ts', '.js'],
        plugins: [
            new TsconfigPathsPlugin({
                configFile: './tsconfig.json',
                baseUrl: './',
            }),
        ],
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
        // fallback: {
        //     util: require.resolve('util/'),
        //     url: require.resolve('url/'),
        //     crypto: require.resolve('crypto-browserify'),
        //     fs: false, // You might not need this if you're not using fs directly in the browser
        //     path: require.resolve('path-browserify'),
        //     stream: require.resolve('stream-browserify'),
        //     http: require.resolve('stream-http'),
        // },
    },
    module: {
        rules: [
            {
                test: /\.ts$/, // Sử dụng ts-loader cho tệp TypeScript
                use: ['ts-loader'],
                // exclude: /node_modules/,
                // include: [path.resolve(__dirname, 'src')],
            },
        ],
    },
};
