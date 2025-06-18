
interface IRectResult {
  width: number
  height: number
  left: number
  bottom: number
  top: number
  right: number
}
export function querySelect(selector: string): Promise<IRectResult[]> {
  return new Promise((resolve) => {
    const query = wx.createSelectorQuery()
    // 通过选择器获取元素的矩形框
    query.select(selector).boundingClientRect()
    // 返回矩形框的结果
    query.exec((res: IRectResult[]) => {
      resolve(res)
    })
  })
}