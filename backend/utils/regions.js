// Shared region/host/cluster mappings

const regionToHost = {
  na:   "na1.api.riotgames.com",
  na1:  "na1.api.riotgames.com",
  euw:  "euw1.api.riotgames.com",
  euw1: "euw1.api.riotgames.com",
  eun:  "eun1.api.riotgames.com",
  eun1: "eun1.api.riotgames.com",
  kr:   "kr.api.riotgames.com",
  jp:   "jp1.api.riotgames.com",
  jp1:  "jp1.api.riotgames.com",
  br:   "br1.api.riotgames.com",
  br1:  "br1.api.riotgames.com",
  la1:  "la1.api.riotgames.com",
  la2:  "la2.api.riotgames.com",
  oc1:  "oc1.api.riotgames.com",
  ru:   "ru.api.riotgames.com",
  tr:   "tr1.api.riotgames.com",
  tr1:  "tr1.api.riotgames.com",
};

const regionToPlatform = {
  na:   "NA1",
  na1:  "NA1",
  euw:  "EUW1",
  euw1: "EUW1",
  eun:  "EUN1",
  eun1: "EUN1",
  eune: "EUN1", // Add this line
  kr:   "KR",
  jp:   "JP1",
  jp1:  "JP1",
  br:   "BR1",
  br1:  "BR1",
  la1:  "LA1",
  la2:  "LA2",
  oc1:  "OC1",
  ru:   "RU",
  tr:   "TR1",
  tr1:  "TR1",
};

const regionToCluster = {
  na:   "americas",
  na1:  "americas",
  br:   "americas",
  br1:  "americas",
  la1:  "americas",
  la2:  "americas",
  oc1:  "sea",
  euw:  "europe",
  euw1: "europe",
  eun:  "europe",
  eun1: "europe",
  eune: "europe", // Add this line
  ru:   "europe",
  tr:   "europe",
  tr1:  "europe",
  kr:   "asia",
  jp:   "asia",
  jp1:  "asia",
};

module.exports = {
  regionToHost,
  regionToPlatform,
  regionToCluster,
};
