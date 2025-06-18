import { wxService } from "../../index";
import type { IMusicResponse, ILyricResponse } from "./models/player.model";

export const getSongInfo = (ids: string) => wxService.get<IMusicResponse>("/song/detail", { ids })

export const getSongLyric = (id: string) => wxService.get<ILyricResponse>("/lyric", { id })