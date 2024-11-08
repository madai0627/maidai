import http from "../util/request";

export const getCatListSync = () => http.get("/api/cat-info/get-cat");

export const removeCatSync = (id) =>
  http.delete(`/api/cat-info/remove-cat?id=${id}`);

export const addCatSync = (data) => http.post("/api/cat-info/save-cat", data);

export const editCatSync = (id, data) =>
  http.patch(`/api/cat-info/update-cat?id=${id}`, data);

export const searchCatSync = (id) => {
  http.get(`/api/cat-info/search-cat?id=${id}`);
}
