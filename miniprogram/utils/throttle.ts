type ThrottledFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): Promise<ReturnType<T>>;
  cancel: () => void;
};
type ThrottleOptions = {
  leading?: boolean;
  trailing?: boolean;
};
export default function throttle<T extends (...args: any[]) => any>(fn: T, interval = 300, { leading = true, trailing = false }: ThrottleOptions = {}): ThrottledFunction<T> {
  let startTime = 0
  let timer: number | null = null
  const _throttle = function (this: any, ...args: any[]): Promise<ReturnType<T>> {
    return new Promise((resolve, reject) => {
      try {
        const nowTime = new Date().getTime()
        // 不需要立即执行时,给定一个初始时间
        if (!leading && startTime === 0) {
          startTime = nowTime
        }
        // 通过时间差值来判断是否需要执行回调函数
        const waitTime = interval - (nowTime - startTime)
        if (waitTime <= 0) {
          if (timer) clearTimeout(timer)
          const res = fn.apply(this, args)
          resolve(res)
          startTime = nowTime
          timer = null
          return
        }
        // 最后一次是否执行,如果设置了trailing，则开启一个
        // 定时器,并根据剩余时间去执行回调函数,如果触发了最后一次事件，则取消定时器。
        if (trailing && !timer) {
          timer = setTimeout(() => {
            const res = fn.apply(this, args)
            resolve(res)
            startTime = new Date().getTime()
            timer = null
          }, waitTime)
        }
      } catch (error) {
        reject(error)
      }
    })
  }
  // 取消功能
  _throttle.cancel = function () {
    if (timer) clearTimeout(timer)
    timer = null
    startTime = 0
  }
  return _throttle
}