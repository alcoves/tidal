import axios from 'axios';
import { tidalTokenKey } from '../config/global';

const AUTH_TOKEN = localStorage.getItem(tidalTokenKey)
axios.defaults.headers.common['X-API-Key'] = `${AUTH_TOKEN}`;

export function getQueueJobs() {
  return axios(`http://localhost:5000/queues/adaptiveTranscode/jobs`).then(
    (result) => result.data,
  );
}