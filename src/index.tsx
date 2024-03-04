import React, {
  forwardRef,
  useRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { View, StyleSheet, Platform } from "react-native";
import { WebView } from "react-native-webview";
import { CaptchaFCProps, CaptchaFCRefProps } from "./types";

const Captcha = forwardRef<CaptchaFCRefProps, CaptchaFCProps>((props, ref) => {
  const { baseUrl, onReceiveToken, siteKey, action, lang } = props;
  const webViewRef = useRef<WebView>(null);

  const injectedJavaScript = `(${String(function () {
    var initializePostMessage = window.postMessage;
    var updatePostMessage = function (message, targetOrigin, transfer) {
      initializePostMessage(message, targetOrigin, transfer);
    };
    initializePostMessage.toString = function () {
      return String(Object.hasOwnProperty).replace(
        "hasOwnProperty",
        "postMessage"
      );
    };
    window.postMessage = updatePostMessage;
  })})();`;

  const getReadyScripts = (siteKey: string, action: string, lang: string) => {
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

  const getRefreshScripts = (siteKey: string, action: string, lang: string) => {
    return `
        grecaptcha.ready(function() {
          grecaptcha.execute('${siteKey}', {action: 'submit'}).then(function(token) {
            window.ReactNativeWebView.postMessage(token);
          });
        });
      `;
  };

  const html = React.useMemo(() => {
    return getReadyScripts(siteKey, action, lang);
  }, [action, siteKey, lang]);

  const source = React.useMemo(
    () => ({
      html,
      baseUrl,
    }),
    [html, baseUrl]
  );

  const refreshToken = useCallback(() => {
    if (Platform.OS === "ios" && webViewRef) {
      webViewRef.current?.injectJavaScript(
        getRefreshScripts(siteKey, action, lang)
      );
    } else if (Platform.OS === "android" && webViewRef) {
      webViewRef.current?.injectJavaScript(
        getRefreshScripts(siteKey, action, lang)
      );
      webViewRef.current?.reload();
    }
  }, [webViewRef]);

  useImperativeHandle(
    ref,
    () => ({
      refreshToken: refreshToken,
    }),
    [refreshToken]
  );

  return (
    <>
      <View style={styles.container}>
        <WebView
          javaScriptEnabled
          automaticallyAdjustContentInsets
          bounces={false}
          ref={webViewRef}
          originWhitelist={["*"]}
          allowsBackForwardNavigationGestures={false}
          injectedJavaScript={injectedJavaScript}
          source={source}
          onMessage={(e: any) => {
            onReceiveToken(e.nativeEvent.data);
          }}
        />
      </View>
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    width: 0,
    height: 0,
  },
});

export default Captcha;
