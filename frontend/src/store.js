import { defineStore } from "pinia";//表示要定义store
//通过defineStore定义store,内部会自动管理store
const userStore = defineStore("counter", {
    state: () => ({
        isCloseSide: false,
    }),
})
// 调用userCounter
export default userStore;