import axios from "axios";

const service = axios.create({
  baseURL: "/",
  timeout: 60000,
});

service.interceptors.response.use(
  function (response) {
    const dataAxios = response;
    return dataAxios.data;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default service;
