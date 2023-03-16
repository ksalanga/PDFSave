// builds a file in our src path
// and puts it into the static build scripts
// refer to #6 Overriding Create React App configuration in this tutorial: 
// https://medium.com/litslink/how-to-create-google-chrome-extension-using-react-js-5c9e343323ff
var HtmlWebpackSkipAssetsPlugin = require('html-webpack-skip-assets-plugin').HtmlWebpackSkipAssetsPlugin;
require('dotenv').config()

process.env.REACT_APP_ENVIRONMENT = 'CHROME_EXTENSION'

module.exports = {
    webpack: {
        configure: (webpackConfig, { env, paths }) => {
            return {
                ...webpackConfig,
                entry: {
                    main: [env === 'development' &&
                        require.resolve('react-dev-utils/webpackHotDevClient'), paths.appIndexJs].filter(Boolean),
                    content: './src/chrome/pdfViewer.js',
                    serviceWorker: './src/chrome/pdfTabs.js'
                },
                output: {
                    ...webpackConfig.output,
                    filename: 'static/js/[name].js',
                },
                optimization: {
                    ...webpackConfig.optimization,
                    runtimeChunk: false,
                }
            }
        },
        plugins: [
            new HtmlWebpackSkipAssetsPlugin({
                excludeAssets: ['/static/js/content.js', '/static/js/serviceWorker.js', (asset) => (asset.attributes && asset.attributes['x-skip'])]
            })
        ]
    }
}