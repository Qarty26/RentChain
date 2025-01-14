import { createRouter, createWebHistory } from 'vue-router';
import Owner from '../Owner.vue';
import Client from '../Client.vue';

const routes = [
  { path: '/owner', component: Owner },
  { path: '/client', component: Client },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;