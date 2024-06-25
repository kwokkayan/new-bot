import axios from "axios";

const oneWayAxios = axios.create({
    baseURL: "https://www.1wayfm.com.au"
})

const getStationData = async () => {
    const res = await oneWayAxios.get("wp-json/metaradio/v1/stationnow", {
        params: {
            station: 1,
            "_c": Date.now(),
        }
    });
    return res.data;
}

export const getStationAudio = async () => {
    const info = await getStationData();
    const streamUrl = info.station.streams[0].url;
    return axios.get(streamUrl, {responseType: "stream"});
}

export const getCurrentPlayingInfo = async () => {
    const info = await getStationData();
    const {now, refreshSecs} = info;
    if (now === null) return { refreshSecs };
    const {title, artist} = now;
    const {artwork} = now.links;
    return {
        title,
        artist,
        artwork,
        refreshSecs
    };
}