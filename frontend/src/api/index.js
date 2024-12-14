import http from "../util/request";

export const getCatListSync = () => http.get("/api/cat-info/get-cat");

export const removeCatSync = (id) =>
  http.delete(`/api/cat-info/remove-cat?id=${id}`);

export const addCatSync = (data) => http.post("/api/cat-info/save-cat", data);

export const editCatSync = (id, data) =>
  http.patch(`/api/cat-info/update-cat?id=${id}`, data);

export const searchCatSync = (id) => {
  return http.get(`/api/cat-info/search-cat?id=${id}`);
}

export const registerSync = (data) => {
  return http.post('/api/users/register', data)
}

export const loginSync = (data) => {
  return http.post('/api/users/login', data)
}

export const logoutSync = () => {
  return http.get('/api/users/logout')
}

export const getUserListSync = ()=> {
  return http.get('/api/users/user-list')
}

export const setRoleSync = (data)=> {
  return http.post('/api/users/set-role', data)
}

export const addRoleSync = (data)=> {
  return http.post('/api/role/add-role', data)
}

export const getRoleSync = ()=> {
  return http.get('/api/role/get-role')
}

export const editRoleSync = (id,data)=>{
  return http.patch('/api/role/edit-role?id='+ id, data)
}

export const deleteRoleSync = (id)=>{
  return http.delete('/api/role/delete-role?id='+ id)
}