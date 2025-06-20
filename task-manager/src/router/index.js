import Vue from "vue";
import Router from "vue-router";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/login",
      name: "Login",
      component: Login,
    },
    {
      path: "/register",
      name: "Register",
      component: Register,
    },
    {
      path: "/tasks",
      name: "Tasks",
      component: () => import("../views/Tasks.vue"), 
    },
    {
      path: "*",
      redirect: "/login",
    },
  ],
});
