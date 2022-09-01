// builds a file in our src path
// and puts it into the static build scripts
// refer to #6 Overriding Create React App configuration in this tutorial: 
// https://medium.com/litslink/how-to-create-google-chrome-extension-using-react-js-5c9e343323ff

module.exports = {
    webpack: {
        configure: (webpackConfig, {env, paths}) => {
            return {
                ...webpackConfig,
                entry: {
                    main: [env === 'development' &&
                    require.resolve('react-dev-utils/webpackHotDevClient'),paths.appIndexJs].filter(Boolean),
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
    }
}