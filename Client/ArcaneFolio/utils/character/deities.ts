export type Deity = {
  name: string;
  alias?: string;
  gender: string;
  domains: string[];
};

export type DeityGroup = {
  label: string;
  deities: Deity[];
};

export const DEITY_GROUPS: DeityGroup[] = [
  {
    label: 'Greater Gods',
    deities: [
      { name: 'Rangloris', gender: 'Male', domains: ['All Seeing', 'Knowledge', 'Observation'] },
      { name: 'Damagus', gender: 'Male', domains: ['Good Magic', 'Arcane Knowledge'] },
      { name: 'Siron', gender: 'Female', domains: ['Neutral Magic', 'Arcane Knowledge'] },
      { name: 'Fastred', gender: 'Male', domains: ['Evil Magic', 'Arcane Knowledge'] },
      { name: 'Eryn', gender: 'Female', domains: ['Storms', 'Wind', 'Thunder'] },
      { name: 'Kaiman', gender: 'Male', domains: ['Evil', 'Plagues', 'Nightmares', 'Sindar'] },
      { name: 'Istus', gender: 'Female', domains: ['Fate', 'Destiny'] },
      { name: 'Glarek', gender: 'Male', domains: ['Battle', 'Athletics', 'Brawling'] },
      { name: 'Uslu', gender: 'Female', domains: ['Peace', 'Reason', 'Fertility', 'Mothers', 'Beauty'] },
      { name: 'Olrik', gender: 'Male', domains: ['Time', 'History', 'The Chronicler'] },
      { name: 'Aglok', gender: 'Male', domains: ['Death', 'Darkness', 'The Underworld'] },
      { name: 'Flangor', gender: 'Male', domains: ['Poetry', 'Archery', 'Hunting'] },
      { name: 'Shanlish', gender: 'Female', domains: ['Nature'] },
      { name: 'Pelor', gender: 'Male', domains: ['Sun', 'Strength', 'Light', 'Healing'] },
      { name: 'Vlaa', gender: 'Female', domains: ['Mountains'] },
      { name: 'Procan', gender: 'Male', domains: ['Seas', 'Oceans'] },
      { name: 'Zilchus', gender: 'Male', domains: ['Money', 'Wealth', 'Influence'] },
      { name: 'Moresh', gender: 'Male', domains: ['Thieves', 'Luck', 'Trickery'] },
    ],
  },
  {
    label: 'Lesser Gods',
    deities: [
      { name: 'Beltar', gender: 'Male', domains: ['Malice', 'Pits', 'Deep Caves'] },
      { name: 'Sharik', alias: 'Lolth', gender: 'Female', domains: ['Spiders'] },
      { name: 'Berei', gender: 'Female', domains: ['Home', 'Family'] },
      { name: 'Bleredd', gender: 'Male', domains: ['Metal', 'Mines', 'Smithing'] },
      { name: 'Celest', gender: 'Female', domains: ['Stars', 'Wanderers'] },
      { name: 'Geshtai', gender: 'Female', domains: ['Rivers', 'Wells'] },
      { name: 'Hextor', gender: 'Male', domains: ['War', 'Discord'] },
      { name: 'Kerelis', gender: 'Female', domains: ['Fire', 'Volcanoes'] },
      { name: 'Lydia', gender: 'Female', domains: ['Music', 'Daylight'] },
      { name: 'Myhriss', gender: 'Female', domains: ['Love'] },
      { name: 'Noreebo', gender: 'Male', domains: ['Risk', 'Gambling'] },
      { name: 'Atroa', gender: 'Female', domains: ['Jealousy', 'Revenge'] },
      { name: 'Fortubo', gender: 'Male', domains: ['Stone'] },
      { name: 'Olidammara', gender: 'Female', domains: ['Music', 'Revelry', 'Dancing', 'Wine'] },
      { name: 'Pyremius', gender: 'Male', domains: ['Poison', 'Murder'] },
      { name: 'Syrul', gender: 'Female', domains: ['Deceit', 'Lies'] },
      { name: 'Wenta', gender: 'Female', domains: ['Autumn', 'Harvest'] },
      { name: 'Zedol', gender: 'Female', domains: ['Mercy', 'Hope'] },
      { name: 'Telchor', gender: 'Male', domains: ['Winter'] },
      { name: 'Raxivort', gender: 'Male', domains: ['Rats', 'Disease'] },
      { name: 'Cuthbert', gender: 'Male', domains: ['Wisdom', 'Dedication'] },
      { name: 'Deccon', gender: 'Male', domains: ['Honor', 'Truth', 'Vanar'] },
    ],
  },
  {
    label: 'Demi Gods',
    deities: [
      { name: 'Raven', gender: 'Female', domains: ['Cats', 'All Felines', 'Shadows'] },
      { name: 'Ruddimal', gender: 'Male', domains: ['Good Luck', 'Skill'] },
      { name: 'Wastri', gender: 'Male', domains: ['Humor', 'Eccentricity'] },
      { name: 'Zuoken', gender: 'Male', domains: ['Physical Mastery', 'Mental Mastery'] },
      { name: 'Zagyg', gender: 'Male', domains: ['Oppression', 'Pain'] },
    ],
  },
];

export const getDeityOptionLabel = (deity: Deity) => {
  const alias = deity.alias ? ` (${deity.alias})` : '';
  return `${deity.name}${alias} - ${deity.gender}; ${deity.domains.join(', ')}`;
};
