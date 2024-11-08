import axios from "axios";

const service = axios.create({
  baseUrl: "/",
  timeOut: 60000,
});

service.interceptors.response.use(
  function (response) {
    const dataAxios = response;
    return dataAxios;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default service;
