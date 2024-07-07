import React from 'react';
import axios from 'axios';
import FormData from 'form-data';

export function useHttpClient() {
  const [loading, setLoading] = React.useState(false);

  const uploadFile = async (file: any) => {
    let token = localStorage.getItem('token');
    console.log('uploadFile', file);
    setLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_VIDEO_TOUCH_API_URL}/upload`;
      let formData = new FormData();
      formData.append('file', file);

      console.log(formData);

      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (err) {
      let message = (err as any).message;
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };


  return {
    uploadFile,
    loading
  };
}