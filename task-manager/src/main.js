import Vue from 'vue';
import App from './App.vue';
import router from './router';
import { auth } from './firebase'; 
import Toasted from "vue-toasted";
import { KanbanPlugin } from '@syncfusion/ej2-vue-kanban';
import { registerLicense } from '@syncfusion/ej2-base';

registerLicense('Ngo9BigBOggjHTQxAR8/V1NNaF1cWWhPYVFzWmFZfVtgdVdMYlRbR35PIiBoS35Rc0VlWHdfcnZdRWhZUkB3VEBU');

Vue.use(KanbanPlugin);

Vue.use(Toasted, {
  duration: 4000,
  position: 'top-right',
  theme: 'bubble',
  iconPack: 'material'
});

Vue.config.productionTip = false;

Vue.config.errorHandler = (err, vm, info) => {
  console.error(`[Vue error]: ${err.toString()} \nInfo: ${info}`);
};

let app;
auth.onAuthStateChanged(async (user) => {
  Vue.prototype.$currentUser = user;
  if (!app) {
    app = new Vue({
      router,
      render: h => h(App)
    }).$mount('#app');
  }
});

