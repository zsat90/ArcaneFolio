export type WeaponCatalogItem = {
  name: string;
  cost: string;
  weight: string;
  size: string;
  type: string;
  speed: string;
  damageSmallMedium: string;
  damageLarge: string;
  aliases?: string[];
};

const weapon = (
  name: string,
  cost: string,
  weight: string,
  size: string,
  type: string,
  speed: string,
  damageSmallMedium: string,
  damageLarge: string,
  aliases: string[] = [],
): WeaponCatalogItem => ({
  name,
  cost,
  weight,
  size,
  type,
  speed,
  damageSmallMedium,
  damageLarge,
  aliases,
});

export const WEAPON_CATALOG: WeaponCatalogItem[] = [
  weapon('Soul Sword - Sirus', '', '', 'M', 'S', '5', '3d8', '3d8'),
  weapon('Soul Sword - Aelrik', '', '', 'M', 'S', '5', '3d8', '3d8'),
  weapon('Soul Sword - Balthrong', '', '', 'M', 'S', '5', '3d8', '3d8'),
  weapon('Arquebus', '500 gp', '10', 'M', 'P', '15', '1d10', '1d10'),
  weapon('Battle axe', '5 gp', '7', 'M', 'S', '7', '1d8', '1d8', ['Battleaxe']),
  weapon('Blowgun', '5 gp', '2', 'L', '', '5', '', ''),
  weapon('Barbed dart', '1 sp', '*', 'S', 'P', '', '1d3', '1d2'),
  weapon('Needle', '2 cp', '*', 'S', 'P', '', '1', '1'),
  weapon('Short bow', '30 gp', '2', 'M', '', '7', '', '', ['Shortbow']),
  weapon('Long bow', '75 gp', '3', 'L', '', '8', '', '', ['Longbow']),
  weapon('Composite short bow', '75 gp', '2', 'M', '', '6', '', ''),
  weapon('Composite long bow', '100 gp', '3', 'L', '', '7', '', ''),
  weapon('Flight arrow', '3 sp/12', '*', 'S', 'P', '', '1d6', '1d6'),
  weapon('Sheaf arrow', '3 sp/6', '*', 'S', 'P', '', '1d8', '1d8'),
  weapon('Club', '', '3', 'M', 'B', '4', '1d6', '1d3'),
  weapon('Hand crossbow', '300 gp', '3', 'S', '', '5', '', ''),
  weapon('Light crossbow', '35 gp', '7', 'M', '', '7', '', ''),
  weapon('Heavy crossbow', '50 gp', '14', 'M', '', '10', '', ''),
  weapon('Hand quarrel', '1 gp', '*', 'S', 'P', '', '1d3', '1d2'),
  weapon('Light quarrel', '1 sp', '*', 'S', 'P', '', '1d4', '1d4'),
  weapon('Heavy quarrel', '2 sp', '*', 'S', 'P', '', '1d4+1', '1d6+1'),
  weapon('Dagger or dirk', '2 gp', '1', 'S', 'P', '2', '1d4', '1d3', ['Dagger', 'Dirk']),
  weapon('Dart', '5 sp', '', 'S', 'P', '2', '1d3', '1d2'),
  weapon("Footman's flail", '15 gp', '15', 'M', 'B', '7', '1d6+1', '2d4'),
  weapon("Footman's mace", '8 gp', '10', 'M', 'B', '7', '1d6+1', '1d6'),
  weapon("Footman's pick", '8 gp', '6', 'M', 'P', '7', '1d6+1', '2d4'),
  weapon('Hand or throwing axe', '1 gp', '5', 'M', 'S', '4', '1d6', '1d4'),
  weapon('Harpoon', '20 gp', '6', 'L', 'P', '7', '2d4', '2d6'),
  weapon("Horseman's flail", '8 gp', '5', 'M', 'B', '6', '1d4+1', '1d4+1'),
  weapon("Horseman's mace", '5 gp', '6', 'M', 'B', '6', '1d6', '1d4'),
  weapon("Horseman's pick", '7 gp', '4', 'M', 'P', '5', '1d4+1', '1d4'),
  weapon('Javelin', '5 sp', '2', 'M', 'P', '4', '1d6', '1d6'),
  weapon('Knife', '5 sp', '', 'S', 'P/S', '2', '1d3', '1d2'),
  weapon('Heavy horse lance', '15 gp', '15', 'L', 'P', '8', '1d8+1', '3d6'),
  weapon('Light horse lance', '6 gp', '5', 'L', 'P', '6', '1d6', '1d8'),
  weapon('Jousting lance', '20 gp', '20', 'L', 'P', '10', '1d3-1', '1d2-1'),
  weapon('Medium horse lance', '10 gp', '10', 'L', 'P', '7', '1d6+1', '2d6'),
  weapon('Mancatcher', '30 gp', '8', 'L', '', '7', '', ''),
  weapon('Morning star', '10 gp', '12', 'M', 'P/B', '7', '2d4', '1d6+1'),
  weapon('Awl pike', '5 gp', '12', 'L', 'P', '13', '1d6', '1d12'),
  weapon('Bardiche', '7 gp', '12', 'L', 'S', '9', '2d4', '2d6'),
  weapon('Bec de corbin', '8 gp', '10', 'L', 'P/B', '9', '1d8', '1d6'),
  weapon('Bill-guisarme', '7 gp', '15', 'L', 'P/S', '10', '2d4', '1d10'),
  weapon('Fauchard', '5 gp', '7', 'L', 'P/S', '8', '1d6', '1d8'),
  weapon('Fauchard-fork', '8 gp', '9', 'L', 'P/S', '8', '1d8', '1d10'),
  weapon('Glaive', '6 gp', '8', 'L', 'S', '8', '1d6', '1d10'),
  weapon('Glaive-guisarme', '10 gp', '10', 'L', 'P/S', '9', '2d4', '2d6'),
  weapon('Guisarme', '5 gp', '8', 'L', 'S', '8', '2d4', '1d8'),
  weapon('Guisarme-voulge', '8 gp', '15', 'L', 'P/S', '10', '2d4', '2d4'),
  weapon('Halberd', '10 gp', '15', 'L', 'P/S', '9', '1d10', '2d6'),
  weapon('Hook fauchard', '10 gp', '8', 'L', 'P/S', '9', '1d4', '1d4'),
  weapon('Lucern hammer', '7 gp', '15', 'L', 'P/B', '9', '2d4', '1d6'),
  weapon('Military fork', '5 gp', '7', 'L', 'P', '7', '1d8', '2d4'),
  weapon('Partisan', '10 gp', '8', 'L', 'P', '9', '1d6', '1d6+1'),
  weapon('Ranseur', '6 gp', '7', 'L', 'P', '8', '2d4', '2d4'),
  weapon('Spetum', '5 gp', '7', 'L', 'P', '8', '1d6+1', '2d6'),
  weapon('Voulge', '5 gp', '12', 'L', 'S', '10', '2d4', '2d4'),
  weapon('Quarterstaff', '', '4', 'L', 'B', '4', '1d6', '1d6'),
  weapon('Scourge', '1 gp', '2', 'S', '', '5', '1d4', '1d2'),
  weapon('Sickle', '6 sp', '3', 'S', 'S', '4', '1d4+1', '1d4'),
  weapon('Sling', '5 cp', '*', 'S', '', '6', '', ''),
  weapon('Sling bullet', '1 cp', '', 'S', 'B', '', '1d4+1', '1d6+1'),
  weapon('Sling stone', '', '', 'S', 'B', '', '1d4', '1d4'),
  weapon('Spear', '8 sp', '5', 'M', 'P', '6', '1d6', '1d8'),
  weapon('Staff sling', '2 sp', '2', 'M', '', '11', '', ''),
  weapon('Bastard sword, one-handed', '25 gp', '10', 'M', 'S', '6', '1d8', '1d12'),
  weapon('Bastard sword, two-handed', '25 gp', '10', 'M', 'S', '8', '2d4', '2d8'),
  weapon('Broad sword', '10 gp', '4', 'M', 'S', '5', '2d4', '1d6+1'),
  weapon('Khopesh', '10 gp', '7', 'M', 'S', '9', '2d4', '1d6'),
  weapon('Long sword', '15 gp', '4', 'M', 'S', '5', '1d8', '1d12', ['Longsword']),
  weapon('Scimitar', '15 gp', '4', 'M', 'S', '5', '1d8', '1d8'),
  weapon('Short sword', '10 gp', '3', 'S', 'P', '3', '1d6', '1d8', ['Shortsword']),
  weapon('Two-handed sword', '50 gp', '15', 'L', 'S', '10', '1d10', '3d6'),
  weapon('Trident', '15 gp', '5', 'L', 'P', '7', '1d6+1', '3d4'),
  weapon('Warhammer', '2 gp', '6', 'M', 'B', '4', '1d4+1', '1d4'),
  weapon('Whip', '1 sp', '2', 'M', '', '8', '1d2', '1'),
  weapon('Belt pistol', '', '3', 'S', 'P', 'Av(7)', '1d8', '1d8'),
  weapon('Blunderbuss pistol', '', '6', 'S', 'P', 'Sl(9)', '1d6', '1d6'),
  weapon('Blunderbuss', '', '10', 'M', 'P', 'Sl(10)', '1d8', '1d8'),
  weapon('Harbinger Sword', '', '', 'M', 'S', '4', '2d8', '2d8'),
];

const normalizeWeaponName = (weaponName: string) => (
  weaponName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\s+\+\d+$/, '')
);

export const getWeaponCatalogItem = (weaponName: string) => {
  const normalized = normalizeWeaponName(weaponName);

  if (!normalized) {
    return null;
  }

  return WEAPON_CATALOG.find((item) => (
    normalizeWeaponName(item.name) === normalized
    || item.aliases?.some((alias) => normalizeWeaponName(alias) === normalized)
  )) ?? null;
};

export const getDefaultWeaponDamage = (weaponName: string) => (
  getWeaponCatalogItem(weaponName)?.damageSmallMedium ?? ''
);

export const getDefaultWeaponSpeedFactor = (weaponName: string) => (
  getWeaponCatalogItem(weaponName)?.speed ?? ''
);

export const getWeaponOptionNames = () => (
  WEAPON_CATALOG.map((item) => item.name)
);
