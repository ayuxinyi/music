import { wxService } from "../../index";
import type { IVideoParams, IVideoResponse, IMvInfo } from "./models/video.model";



export const getVideo = ({ offset = 0, limit = 30, area = "" }: IVideoParams = {}) => wxService.get<IVideoResponse>("/top/mv", { limit, area, offset })

export const getVideoUrl = (id: number) => wxService.get<{ code: number, msg: string, data: { url: string } }>("/mv/url", { id })


export const getMvInfo = (mvid: number) => wxService.get<IMvInfo>("/mv/detail", { mvid })

export const getMvRelates = (id: number) => wxService.get<IMvInfo>("/related/allvideo", { id })