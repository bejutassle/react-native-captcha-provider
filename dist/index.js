"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_1 = require("react");
const react_native_1 = require("react-native");
const react_native_webview_1 = require("react-native-webview");
const Captcha = (0, react_1.forwardRef)((props, ref) => {
    const { baseUrl, onReceiveToken, siteKey, action, lang } = props;
    const webViewRef = (0, react_1.useRef)(null);
    const injectedJavaScript = `(${String(function () {
        var initializePostMessage = window.postMessage;
        var updatePostMessage = function (message, targetOrigin, transfer) {
            initializePostMessage(message, targetOrigin, transfer);
        };
        initializePostMessage.toString = function () {
            return String(Object.hasOwnProperty).replace("hasOwnProperty", "postMessage");
        };
        window.postMessage = updatePostMessage;
    })})();`;
    const getReadyScripts = (siteKey, action, lang) => {
        return `
      <!DOCTYPE html>
      <html>
      <head>
              <style>
                      .text-xs-center {
                              text-align: center;
                      }
      
                      .g-recaptcha {
                              display: inline-block;
                      }
              </style>
              <script src="https://www.google.com/recaptcha/api.js?render=${siteKey}&hl=${lang}"></script>
              <script type="text/javascript">
                      grecaptcha.ready(async function () {
                              try {
                                  let a = await grecaptcha.execute('${siteKey}', { action: '${action}' });
                                  window.ReactNativeWebView.postMessage(a);
                              } catch (err) {
                                  window.ReactNativeWebView.postMessage(err);
                              }
                      }); 
              </script>
      </head>
      </html>
      `;
    };
    const getRefreshScripts = (siteKey, action, lang) => {
        return `
        grecaptcha.ready(function() {
          grecaptcha.execute('${siteKey}', {action: 'submit'}).then(function(token) {
            window.ReactNativeWebView.postMessage(token);
          });
        });
      `;
    };
    const html = (0, react_1.useMemo)(() => {
        return getReadyScripts(siteKey, action, lang);
    }, [action, siteKey, lang]);
    const source = (0, react_1.useMemo)(() => ({
        html,
        baseUrl,
    }), [html, baseUrl]);
    const refreshToken = (0, react_1.useCallback)(() => {
        var _a, _b, _c;
        if (react_native_1.Platform.OS === "ios" && webViewRef) {
            (_a = webViewRef.current) === null || _a === void 0 ? void 0 : _a.injectJavaScript(getRefreshScripts(siteKey, action, lang));
        }
        else if (react_native_1.Platform.OS === "android" && webViewRef) {
            (_b = webViewRef.current) === null || _b === void 0 ? void 0 : _b.injectJavaScript(getRefreshScripts(siteKey, action, lang));
            (_c = webViewRef.current) === null || _c === void 0 ? void 0 : _c.reload();
        }
    }, [webViewRef]);
    (0, react_1.useImperativeHandle)(ref, () => ({
        refreshToken: refreshToken,
    }), [refreshToken]);
    return (React.createElement(React.Fragment, null,
        React.createElement(react_native_1.View, { style: styles.container },
            React.createElement(react_native_webview_1.WebView, { javaScriptEnabled: true, automaticallyAdjustContentInsets: true, bounces: false, ref: webViewRef, originWhitelist: ["*"], allowsBackForwardNavigationGestures: false, injectedJavaScript: injectedJavaScript, source: source, onMessage: (e) => {
                    onReceiveToken(e.nativeEvent.data);
                } }))));
});
const styles = react_native_1.StyleSheet.create({
    container: {
        width: 0,
        height: 0,
    },
});
exports.default = Captcha;
