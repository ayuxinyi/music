import { BASE_URL, TIME_OUT } from "../config/index"

// 封装网络请求
type MethodType = 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT'

class WxService {
  constructor(private baseUrl: string = BASE_URL) { }
  request<T extends ResponseCommon>(
    url: string,
    data?: any,
    method: MethodType = 'GET',
    options?: WechatMiniprogram.RequestOption
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      wx.request({
        ...options,
        url: this.baseUrl + url,
        data,
        method,
        timeout: options?.timeout ?? TIME_OUT,
        success: (res: WechatMiniprogram.RequestSuccessCallbackResult<T>) => {
          resolve(res.data)
        },
        fail: reject
      })
    })
  }
  get<T extends ResponseCommon>(url: string, data?: any, options?: WechatMiniprogram.RequestOption) {
    return this.request<T>(url, data, 'GET', options)
  }

  post<T extends ResponseCommon>(url: string, data?: any, options?: WechatMiniprogram.RequestOption) {
    return this.request<T>(url, data, 'POST', options)
  }

  put<T extends ResponseCommon>(url: string, data?: any, options?: WechatMiniprogram.RequestOption) {
    return this.request<T>(url, data, 'PUT', options)
  }

  delete<T extends ResponseCommon>(url: string, data?: any, options?: WechatMiniprogram.RequestOption) {
    return this.request<T>(url, data, 'DELETE', options)
  }
}

export const wxService = new WxService()
