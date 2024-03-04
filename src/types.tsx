export type CaptchaFCProps = {
  version: string;
  baseUrl: string;
  onReceiveToken: (captchaToken: string) => void;
  onRefreshToken(): void;
  siteKey: string;  
  action: string;
  lang: string;
};

export type CaptchaFCRefProps = {
  refreshToken: () => void;
};

export type updatePostMessage = {
  message: any;
  targetOrigin: any;
  transfer: any;
};
