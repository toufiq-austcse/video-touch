import React from "react";
import axios from "axios";
import FormData from "form-data";
import { VODPlaybackRes } from "@/contexts/types/vod-playback-res";

export function useHttpClient() {
  const [loading, setLoading] = React.useState(false);

  const uploadFile = async (file: any) => {
    let token = localStorage.getItem("token");
    console.log("uploadFile", file);
    setLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_VIDEO_TOUCH_API_URL}/upload`;
      let formData = new FormData();
      formData.append("file", file);

      console.log(formData);

      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (err) {
      let message = (err as any).message;
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const getVodPlaybackUrl = async (
    assetId: string,
  ): Promise<VODPlaybackRes> => {
    setLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_S3_MANAGER_URL}/api/v1/vod/playback-url?provider=gumlet&media_id=${assetId}`;
      const response = await axios.get(url, {
        headers: {
          "x-tenms-service-key": process.env
            .NEXT_PUBLIC_X_TENMS_SERVICE_KEY as any,
        },
      });
      return response.data.data;
    } catch (err) {
      let message = (err as any).message;
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadFile,
    getVodPlaybackUrl,
    loading,
  };
}
