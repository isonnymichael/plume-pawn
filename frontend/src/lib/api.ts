import axios from "axios";

export const get = async ({
  url,
  params,
}: {
  url: string;
  params?: Record<string, string | number>;
}) => {
  const response = await axios.get(url, { params });
  return response.data;
};

export const post = async <T = unknown>({
    url,
    data,
  }: {
    url: string;
    data?: Record<string, any>;
  }): Promise<T> => {
    const res = await axios.post(url, data);
    return res.data;
};