require('dotenv').config();

const fs = require('fs-extra');
const axios = require('axios');

const { DO_API_TOKEN } = process.env;
axios.defaults.headers.common['Authorization'] = `Bearer ${DO_API_TOKEN}`;
const serversToTest = ['s-1vcpu-1gb'];

const getSizes = async (
  url = 'https://api.digitalocean.com/v2/sizes',
  sizes = []
) => {
  const { data } = await axios.get(url);
  data.sizes.map(size => sizes.push(size));
  if (data.links.pages.next) {
    return getSizes(data.links.pages.next, sizes);
  } else {
    return sizes;
  }
};

const spawnServer = size => {
  return axios.post('https://api.digitalocean.com/v2/droplets', {
    size,
    name: 'video-compression-tester',
    region: 'nyc3',
    image: 'ubuntu-18-04-x64',
    ssh_keys: ['26:e4:37:18:61:e9:29:76:20:68:e1:7f:eb:49:07:2e'],
    user_data:
      'sleep 30 && sudo apt update && sudo apt install git && touch /root/brendan-was-here',
    tags: ['testing'],
  });
};

const sleep = seconds => {
  return new Promise((resolve, reject) => {
    setInterval(() => {
      resolve();
    }, 1000 * seconds);
  });
};

const getServerResults = async (dropletId, attempts = 0) => {
  try {
    await sleep(10);

    if (attempts > 6) {
      throw new Error('failed to get server results');
    }

    console.log('querying for server information');
    const { data } = await axios.get(
      `https://api.digitalocean.com/v2/droplets/${dropletId}`
    );
    console.log('data', data);

    const serverIpv4 = data.droplet.networks.v4.ip_address;

    console.log('querying server for data');
    const serverStats = await axios.get(`http://${serverIpv4}:3000/stats`);

    if (serverStats.data) {
      return serverStats.data;
    }

    return getServerResults(dropletId, attempts++);
  } catch (error) {
    console.log(error);
  }
};

const removeServer = serverId => {
  return axios.delete(`https://api.digitalocean.com/v2/droplets/${serverId}`);
};

(async () => {
  try {
    console.log('getting server sizes from digitalocean');
    const sizes = await getSizes();
    await fs.writeFile('./data/sizes.json', JSON.stringify(sizes, null, 2));

    for (const serverSize of serversToTest) {
      console.log('creating server...');
      const { data: serverCreateRes } = await spawnServer(serverSize);
      const serverId = serverCreateRes.droplet.id;
      console.log(`server ${serverId} created!`);

      console.log('getting results from spaces');
      // await getServerResults(serverIp);

      console.log('removing server');
      await removeServer(serverId);
      console.log('server removed!');
    }
  } catch (error) {
    console.error(error);
  }
})();
