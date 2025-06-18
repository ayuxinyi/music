import { wxService } from "../../index";
import type { CategoryType, IBannerResponse, IPlayListResponse, ISongResponse, ISongTagResponse, BannerType } from "./models/home.model";

// 轮播图
export const getBanner = (type: BannerType = 2) => wxService.get<IBannerResponse>("/banner", { type })

// 推荐歌曲
export const getPlayList = (id: number) => wxService.get<IPlayListResponse>("/playlist/detail", { id })

// 获取歌单
export const getSongMenuList = (cat: CategoryType = "全部", limit = 6, offset = 0) => wxService.get<ISongResponse>("/top/playlist", { cat, limit, offset })

export const getSongTags = () => wxService.get<ISongTagResponse>("/playlist/hot")