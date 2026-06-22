import React, { useState } from 'react';
import { useSelectedCharacter } from '../../utils/character/characterState';
import { getCharacterSheet, setCharacterSheet } from '../../utils/character/characterSheetState';

type EquipmentItem = {
  name: string;
  cost: string;
  weight: string;
  notes?: string;
};

type EquipmentListPanelProps = {
  onEquipLine?: (itemLine: string, itemName: string, equipmentBucket?: string, itemCost?: string) => string | void;
  actionLabel?: string;
};

const EQUIPMENT_CATEGORIES = [
  'Weapons',
  'Armor',
  'Helms',
  'Shields',
  'Clothing',
  'Daily Food and Lodging',
  'Household Provisioning',
  'Transport',
  'Animals',
  'Services',
  'Tack and Harness',
  'Miscellaneous Equipment',
];

const weapon = (
  name: string,
  cost: string,
  weight: string,
  size: string,
  type: string,
  speed: string,
  damageSmallMedium: string,
  damageLarge: string,
): EquipmentItem => ({
  name,
  cost,
  weight: weight ? `${weight} lbs.` : '',
  notes: [
    size ? `Size ${size}` : '',
    type ? `Type ${type}` : '',
    speed ? `Speed ${speed}` : '',
    damageSmallMedium ? `Damage S-M ${damageSmallMedium}` : '',
    damageLarge ? `L ${damageLarge}` : '',
  ].filter(Boolean).join('; '),
});

const WEAPON_ITEMS: EquipmentItem[] = [
  weapon('Soul Sword - Sirus', '', '', 'M', 'S', '5', '3d8', '3d8'),
  weapon('Soul Sword - Aelrik', '', '', 'M', 'S', '5', '3d8', '3d8'),
  weapon('Soul Sword - Balthrong', '', '', 'M', 'S', '5', '3d8', '3d8'),
  weapon('Arquebus', '500 gp', '10', 'M', 'P', '15', '1d10', '1d10'),
  weapon('Battle axe', '5 gp', '7', 'M', 'S', '7', '1d8', '1d8'),
  weapon('Blowgun', '5 gp', '2', 'L', '', '5', '', ''),
  weapon('Barbed dart', '1 sp', '*', 'S', 'P', '', '1d3', '1d2'),
  weapon('Needle', '2 cp', '*', 'S', 'P', '', '1', '1'),
  weapon('Short bow', '30 gp', '2', 'M', '', '7', '', ''),
  weapon('Long bow', '75 gp', '3', 'L', '', '8', '', ''),
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
  weapon('Dagger or dirk', '2 gp', '1', 'S', 'P', '2', '1d4', '1d3'),
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
  weapon('Long sword', '15 gp', '4', 'M', 'S', '5', '1d8', '1d12'),
  weapon('Scimitar', '15 gp', '4', 'M', 'S', '5', '1d8', '1d8'),
  weapon('Short sword', '10 gp', '3', 'S', 'P', '3', '1d6', '1d8'),
  weapon('Two-handed sword', '50 gp', '15', 'L', 'S', '10', '1d10', '3d6'),
  weapon('Trident', '15 gp', '5', 'L', 'P', '7', '1d6+1', '3d4'),
  weapon('Warhammer', '2 gp', '6', 'M', 'B', '4', '1d4+1', '1d4'),
  weapon('Whip', '1 sp', '2', 'M', '', '8', '1d2', '1'),
  weapon('Belt pistol', '', '3', 'S', 'P', 'Av(7)', '1d8', '1d8'),
  weapon('Blunderbuss pistol', '', '6', 'S', 'P', 'Sl(9)', '1d6', '1d6'),
  weapon('Blunderbuss', '', '10', 'M', 'P', 'Sl(10)', '1d8', '1d8'),
];

const gear = (name: string, cost: string, weight = '', notes = ''): EquipmentItem => ({
  name,
  cost,
  weight,
  notes,
});

const CLOTHING_ITEMS: EquipmentItem[] = [
  gear('Belt', '3 sp'),
  gear('Riding boots', '3 gp'),
  gear('Soft boots', '1 gp'),
  gear('Breeches', '2 gp'),
  gear('Cap, hat', '1 sp'),
  gear('Good cloth cloak', '8 sp'),
  gear('Fine fur cloak', '50 gp'),
  gear('Girdle', '3 gp'),
  gear('Gloves', '1 gp'),
  gear('Gown, common', '12 sp'),
  gear('Hose', '2 gp'),
  gear('Knife sheath', '3 cp'),
  gear('Mittens', '3 sp'),
  gear('Pin', '6 gp'),
  gear('Plain brooch', '10 gp'),
  gear('Common robe', '9 sp'),
  gear('Embroidered robe', '20 gp'),
  gear('Sandals', '5 cp'),
  gear('Sash', '2 sp'),
  gear('Shoes', '1 gp'),
  gear('Silk jacket', '80 gp'),
  gear('Surcoat', '6 sp'),
  gear('Sword scabbard, hanger, baldric', '4 gp'),
  gear('Tabard', '6 sp'),
  gear('Toga, coarse', '8 cp'),
  gear('Tunic', '8 sp'),
  gear('Vest', '6 sp'),
];

const FOOD_AND_LODGING_ITEMS: EquipmentItem[] = [
  gear('Ale (per gallon)', '2 sp'),
  gear('Banquet (per person)', '10 gp'),
  gear('Bread', '5 cp'),
  gear('Cheese', '4 sp'),
  gear('Common city room (per month)', '20 gp'),
  gear('Poor city room (per month)', '6 sp'),
  gear('Common wine (pitcher)', '2 sp'),
  gear('Egg or fresh vegetables', '1 cp'),
  gear('Grain and stabling for horse (daily)', '5 sp'),
  gear('Honey', '5 sp'),
  gear('Common inn lodging (per day/week)', '5 sp/3 gp'),
  gear('Poor inn lodging (per day/week)', '5 cp/2 sp'),
  gear('Meat for one meal', '1 sp'),
  gear('Good meals (per day)', '5 sp'),
  gear('Common meals (per day)', '3 sp'),
  gear('Poor meals (per day)', '1 sp'),
  gear('Separate latrine for rooms (per month)', '2 gp'),
  gear('Small beer (per gallon)', '5 cp'),
  gear('Soup', '5 cp'),
];

const HOUSEHOLD_PROVISIONING_ITEMS: EquipmentItem[] = [
  gear('Barrel of pickled fish', '3 gp'),
  gear('Butter (per lb.)', '2 sp'),
  gear('Coarse sugar (per lb.)', '1 gp'),
  gear('Dry rations (per week)', '10 gp'),
  gear('Eggs (per 100)', '8 sp'),
  gear('Eggs (per two dozen)', '2 sp'),
  gear('Figs (per lb.)', '3 sp'),
  gear('Firewood (per day)', '1 cp'),
  gear('Herbs (per lb.)', '5 cp'),
  gear('Nuts (per lb.)', '1 gp'),
  gear('Raisins (per lb.)', '2 sp'),
  gear('Rations, standard (1 wk)', '3 gp'),
  gear('Rations, iron (1 wk)', '5 gp'),
  gear('Rice (per lb.)', '2 sp'),
  gear('Salt (per lb.)', '1 sp'),
  gear('Salted herring (per 100)', '1 gp'),
  gear('Exotic spice (saffron, clove)', '15 gp'),
  gear('Rare spice (pepper, ginger)', '2 gp'),
  gear('Uncommon spice (cinnamon)', '1 gp'),
  gear('Tun of cider (250 gal.)', '8 gp'),
  gear('Tun of good wine (250 gal.)', '20 gp'),
];

const TRANSPORT_ITEMS: EquipmentItem[] = [
  gear('Barge', '500 gp'),
  gear('Small canoe', '30 gp'),
  gear('War canoe', '50 gp'),
  gear('Caravel', '10,000 gp'),
  gear('Common carriage', '150 gp'),
  gear('Ornamented coach carriage', '7,000 gp'),
  gear('Riding chariot', '200 gp'),
  gear('War chariot', '500 gp'),
  gear('Coaster', '5,000 gp'),
  gear('Cog', '10,000 gp'),
  gear('Curragh', '500 gp'),
  gear('Drakkar', '25,000 gp'),
  gear('Dromond', '15,000 gp'),
  gear('Galleon', '50,000 gp'),
  gear('Great galley', '30,000 gp'),
  gear('Knarr', '3,000 gp'),
  gear('Longship', '10,000 gp'),
  gear('Common oar', '2 gp'),
  gear('Galley oar', '10 gp'),
  gear('Raft or small keelboat', '100 gp'),
  gear('Sail', '20 gp'),
  gear('Sedan chair', '100 gp'),
  gear('Wagon or cart wheel', '5 gp'),
];

const ANIMAL_ITEMS: EquipmentItem[] = [
  gear('Boar', '10 gp'),
  gear('Bull', '20 gp'),
  gear('Calf', '5 gp'),
  gear('Camel', '50 gp'),
  gear('Capon', '3 cp'),
  gear('Cat', '1 sp'),
  gear('Chicken', '2 cp'),
  gear('Cow', '10 gp'),
  gear('Guard dog', '25 gp'),
  gear('Hunting dog', '17 gp'),
  gear('War dog', '20 gp'),
  gear('Donkey, mule, or ass', '8 gp'),
  gear('Labor elephant', '200 gp'),
  gear('War elephant', '500 gp'),
  gear('Falcon (trained)', '1,000 gp'),
  gear('Goat', '1 gp'),
  gear('Goose', '5 cp'),
  gear('Guinea hen', '2 cp'),
  gear('Draft horse', '200 gp'),
  gear('Heavy war horse', '400 gp'),
  gear('Light war horse', '150 gp'),
  gear('Medium war horse', '225 gp'),
  gear('Riding horse', '75 gp'),
  gear('Hunting cat (jaguar, etc.)', '5,000 gp'),
  gear('Ox', '15 gp'),
  gear('Partridge', '5 cp'),
  gear('Peacock', '5 sp'),
  gear('Pig', '3 gp'),
  gear('Pigeon', '1 cp'),
  gear('Pigeon, homing', '100 gp'),
  gear('Pony', '30 gp'),
  gear('Ram', '4 gp'),
  gear('Sheep', '2 gp'),
  gear('Songbird', '10 sp'),
  gear('Swan', '5 sp'),
];

const SERVICE_ITEMS: EquipmentItem[] = [
  gear('Bath', '3 cp'),
  gear('Clerk (per letter)', '2 sp'),
  gear('Doctor, leech, or bleeding', '3 gp'),
  gear('Guide, in city (per day)', '2 sp'),
  gear('Lantern or torchbearer (per night)', '1 sp'),
  gear('Laundry (by load)', '1 cp'),
  gear('Messenger, in city (per message)', '1 sp'),
  gear('Minstrel (per performance)', '3 gp'),
  gear('Mourner (per funeral)', '2 sp'),
  gear('Teamster w/wagon', '1 sp/mile'),
];

const TACK_AND_HARNESS_ITEMS: EquipmentItem[] = [
  gear('Chain barding', '500 gp', '70 lbs.'),
  gear('Full plate barding', '2,000 gp', '85 lbs.'),
  gear('Full scale barding', '1,000 gp', '75 lbs.'),
  gear('Half brigandine barding', '500 gp', '45 lbs.'),
  gear('Half padded barding', '100 gp', '25 lbs.'),
  gear('Half scale barding', '500 gp', '50 lbs.'),
  gear('Leather or padded barding', '150 gp', '60 lbs.'),
  gear('Bit and bridle', '15 sp', '3 lbs.'),
  gear('Cart harness', '2 gp', '10 lbs.'),
  gear('Halter', '5 cp', '*'),
  gear('Horseshoes & shoeing', '1 gp', '10 lbs.'),
  gear('Pack saddle', '5 gp', '15 lbs.'),
  gear('Riding saddle', '10 gp', '35 lbs.'),
  gear('Large saddle bags', '4 gp', '8 lbs.'),
  gear('Small saddle bags', '3 gp', '5 lbs.'),
  gear('Saddle blanket', '3 sp', '4 lbs.'),
  gear('Horse yoke', '5 gp', '15 lbs.'),
  gear('Ox yoke', '3 gp', '20 lbs.'),
];

const MISCELLANEOUS_ITEMS: EquipmentItem[] = [
  gear('Backpack', '2 gp', '2 lbs.'),
  gear('Barrel, small', '2 gp', '30 lbs.'),
  gear('Large basket', '3 sp', '1 lb.'),
  gear('Small basket', '5 cp', '*'),
  gear('Bell', '1 gp'),
  gear('Large belt pouch', '1 gp', '1 lb.'),
  gear('Small belt pouch', '7 sp', '1/2 lb.'),
  gear('Block and tackle', '5 gp', '5 lbs.'),
  gear('Bolt case', '1 gp', '1 lb.'),
  gear('Bucket', '5 sp', '3 lbs.'),
  gear('Heavy chain (per ft.)', '4 gp', '3 lbs.'),
  gear('Light chain (per ft.)', '3 gp', '1 lb.'),
  gear('Large chest', '2 gp', '25 lbs.'),
  gear('Small chest', '1 gp', '10 lbs.'),
  gear('Common cloth (per 10 sq. yds.)', '7 gp', '10 lbs.'),
  gear('Fine cloth (per 10 sq. yds.)', '50 gp', '10 lbs.'),
  gear('Rich cloth (per 10 sq. yds.)', '100 gp', '10 lbs.'),
  gear('Candle', '1 cp', '*'),
  gear('Canvas (per sq. yard)', '4 sp', '1 lb.'),
  gear('Chalk', '1 cp', '*'),
  gear('Crampons', '4 gp', '2 lbs.'),
  gear('Fishhook', '1 sp', '**'),
  gear('Fishing net, 10 ft. sq.', '4 gp', '5 lbs.'),
  gear('Flint and steel', '5 sp', '*'),
  gear('Glass bottle', '10 gp', '*'),
  gear('Grappling hook', '8 sp', '4 lbs.'),
  gear('Holy item (symbol, water, etc.)', '25 gp', '*'),
  gear('Hourglass', '25 gp', '1 lb.'),
  gear('Iron pot', '5 sp', '2 lbs.'),
  gear('Ladder, 10 ft.', '5 cp', '20 lbs.'),
  gear('Beacon lantern', '150 gp', '50 lbs.'),
  gear('Bullseye lantern', '12 gp', '3 lbs.'),
  gear('Hooded lantern', '7 gp', '2 lbs.'),
  gear('Good lock', '100 gp', '1 lb.'),
  gear('Poor lock', '20 gp', '1 lb.'),
  gear('Magnifying glass', '100 gp', '*'),
  gear('Map or scroll case', '8 sp', '1/2 lb.'),
  gear("Merchant's scale", '2 gp', '1 lb.'),
  gear('Mirror, small metal', '10 gp', '*'),
  gear('Musical instrument', '5-100 gp', '1/2-3 lbs.'),
  gear('Greek fire oil (per flask)', '10 gp', '2 lbs.'),
  gear('Lamp oil (per flask)', '6 cp', '1 lb.'),
  gear('Paper (per sheet)', '2 gp', '**'),
  gear('Papyrus (per sheet)', '8 sp', '**'),
  gear('Parchment (per sheet)', '1 gp', '**'),
  gear('Perfume (per vial)', '5 gp', '*'),
  gear('Piton', '3 cp', '1/2 lb.'),
  gear('Quiver', '8 sp', '1 lb.'),
  gear('Hemp rope (per 50 ft.)', '1 gp', '20 lbs.'),
  gear('Silk rope (per 50 ft.)', '10 gp', '8 lbs.'),
  gear('Large sack', '2 sp', '1/2 lb.'),
  gear('Small sack', '5 cp', '*'),
  gear('Sealing/candle wax (per lb.)', '1 gp', '1 lb.'),
  gear('Sewing needle', '5 sp', '*'),
  gear('Signal whistle', '8 sp', '*'),
  gear('Signet ring or personal seal', '5 gp', '*'),
  gear('Soap (per lb.)', '5 sp', '1 lb.'),
  gear('Spyglass', '1,000 gp', '1 lb.'),
  gear('Large tent', '25 gp', '20 lbs.'),
  gear('Pavilion tent', '100 gp', '50 lbs.'),
  gear('Small tent', '5 gp', '10 lbs.'),
  gear("Thieves' picks", '30 gp', '1 lb.'),
  gear('Torch', '1 cp', '1 lb.'),
  gear('Water clock', '1,000 gp', '200 lbs.'),
  gear('Whetstone', '2 cp', '1 lb.'),
  gear('Wineskin', '8 sp', '1 lb.'),
  gear('Winter blanket', '5 sp', '3 lbs.'),
  gear('Writing ink (per vial)', '8 gp', '*'),
];

const EQUIPMENT_ITEMS: Record<string, EquipmentItem[]> = {
  Weapons: WEAPON_ITEMS,
  Armor: [
    { name: 'Banded mail', cost: '200 gp', weight: '35 lbs.' },
    { name: 'Brigandine', cost: '120 gp', weight: '35 lbs.' },
    { name: 'Bronze plate mail', cost: '400 gp', weight: '45 lbs.' },
    { name: 'Chain mail', cost: '75 gp', weight: '40 lbs.' },
    { name: 'Elven Chain', cost: '4,000 gp', weight: '15 lbs.', notes: 'Rare armor' },
    { name: 'Field plate', cost: '2,000 gp', weight: '60 lbs.' },
    { name: 'Rigid Leather - Vanar/Sindar Armor', cost: '', weight: '20 lbs.', notes: 'Vanar/Sindar only; ask DM for magical bonus' },
    { name: 'Full plate', cost: '6,500 gp', weight: '70 lbs.' },
    { name: 'Hide', cost: '15 gp', weight: '30 lbs.' },
    { name: 'Leather', cost: '5 gp', weight: '15 lbs.' },
    { name: 'Padded', cost: '4 gp', weight: '10 lbs.' },
    { name: 'Plate mail', cost: '600 gp', weight: '50 lbs.' },
    { name: 'Ring mail', cost: '100 gp', weight: '30 lbs.' },
    { name: 'Scale mail', cost: '120 gp', weight: '40 lbs.' },
    { name: 'Splint mail', cost: '80 gp', weight: '40 lbs.' },
    { name: 'Studded leather', cost: '20 gp', weight: '25 lbs.' },
  ],
  Helms: [
    { name: 'Great helm', cost: '30 gp', weight: '10 lbs.' },
    { name: 'Basinet', cost: '8 gp', weight: '5 lbs.' },
  ],
  Shields: [
    { name: 'Body', cost: '10 gp', weight: '15 lbs.' },
    { name: 'Buckler', cost: '1 gp', weight: '3 lbs.' },
    { name: 'Medium', cost: '7 gp', weight: '10 lbs.' },
    { name: 'Small', cost: '3 gp', weight: '5 lbs.' },
  ],
  Clothing: CLOTHING_ITEMS,
  'Daily Food and Lodging': FOOD_AND_LODGING_ITEMS,
  'Household Provisioning': HOUSEHOLD_PROVISIONING_ITEMS,
  Transport: TRANSPORT_ITEMS,
  Animals: ANIMAL_ITEMS,
  Services: SERVICE_ITEMS,
  'Tack and Harness': TACK_AND_HARNESS_ITEMS,
  'Miscellaneous Equipment': MISCELLANEOUS_ITEMS,
};

const formatEquipmentLine = (item: EquipmentItem, category: string) => {
  const details = [item.cost, item.weight, item.notes].filter(Boolean).join(', ');
  return `${item.name}${details ? ` (${details})` : ''} - ${category}`;
};

const formatMagicalEquipmentLine = (item: EquipmentItem, category: string, modifier: string) => {
  const modifierText = modifier ? ` +${modifier}` : '';
  const details = [item.cost, item.weight, item.notes].filter(Boolean).join(', ');
  return `${item.name}${modifierText}${details ? ` (${details})` : ''} - ${category}`;
};

const getEquipmentBucket = (category: string) => {
  if (category === 'Armor' || category === 'Helms' || category === 'Shields') {
    return 'Armor';
  }

  if (category === 'Weapons') {
    return 'Weapons';
  }

  return 'Other';
};

const getMagicalPromptName = (category: string) => {
  if (category === 'Helms') {
    return 'helm';
  }

  if (category === 'Shields') {
    return 'shield';
  }

  return category.toLowerCase();
};

export default function EquipmentListPanel({ onEquipLine, actionLabel = 'Equip' }: EquipmentListPanelProps) {
  const [activeCategory, setActiveCategory] = useState('Armor');
  const [notice, setNotice] = useState('');
  const [pendingMagicalItem, setPendingMagicalItem] = useState<EquipmentItem | null>(null);
  const [pendingMagicalCategory, setPendingMagicalCategory] = useState('');
  const [isMagicalItem, setIsMagicalItem] = useState(false);
  const [magicModifier, setMagicModifier] = useState('1');
  const selectedCharacter = useSelectedCharacter();
  const activeItems = EQUIPMENT_ITEMS[activeCategory] ?? [];
  const noticeIsError = notice.toLowerCase().includes('not enough') || notice.toLowerCase().includes('select or create');
  const isSoulSword = (item: EquipmentItem) => item.name.toLowerCase().startsWith('soul sword - ');

  const addEquipmentLine = (item: EquipmentItem, itemLine: string, equipmentBucket: string) => {
    if (onEquipLine) {
      const errorMessage = onEquipLine(itemLine, item.name, equipmentBucket, item.cost);
      if (errorMessage) {
        setNotice(errorMessage);
        return;
      }
      setNotice(`${item.name} added to equipment.`);
      return;
    }

    if (!selectedCharacter) {
      setNotice('Select or create a character before equipping items.');
      return;
    }

    const characterId = Number(selectedCharacter.id);
    const sheet = getCharacterSheet(characterId);
    const currentEquipment = sheet.equipmentDetails[equipmentBucket]?.trim();
    const nextSheet = {
      ...sheet,
      equipmentDetails: {
        ...sheet.equipmentDetails,
        [equipmentBucket]: currentEquipment ? `${currentEquipment}\n${itemLine}` : itemLine,
      },
    };

    setCharacterSheet(characterId, nextSheet);
    setNotice(`${item.name} equipped to ${selectedCharacter.name}.`);
  };

  const handleEquip = (item: EquipmentItem) => {
    if (activeCategory === 'Armor' || activeCategory === 'Helms' || activeCategory === 'Shields' || activeCategory === 'Weapons') {
      setPendingMagicalItem(item);
      setPendingMagicalCategory(activeCategory);
      const soulSword = activeCategory === 'Weapons' && isSoulSword(item);
      setIsMagicalItem(soulSword);
      setMagicModifier(soulSword ? '3' : '1');
      setNotice('');
      return;
    }

    addEquipmentLine(item, formatEquipmentLine(item, activeCategory), getEquipmentBucket(activeCategory));
  };

  const handleMagicModifierChange = (value: string) => {
    const parsed = Number(value);

    if (!value) {
      setMagicModifier('');
      return;
    }

    if (!Number.isFinite(parsed)) {
      return;
    }

    setMagicModifier(String(Math.min(Math.max(Math.floor(parsed), 1), 6)));
  };

  const confirmMagicalItem = () => {
    if (!pendingMagicalItem || !pendingMagicalCategory) {
      return;
    }

    const modifier = isMagicalItem ? magicModifier : '';

    const promptName = getMagicalPromptName(pendingMagicalCategory);

    if (isMagicalItem && !modifier) {
      setNotice(`Enter a magical ${promptName} modifier from 1 to 6.`);
      return;
    }

    addEquipmentLine(
      pendingMagicalItem,
      formatMagicalEquipmentLine(pendingMagicalItem, pendingMagicalCategory, modifier),
      getEquipmentBucket(pendingMagicalCategory),
    );
    setPendingMagicalItem(null);
    setPendingMagicalCategory('');
    setIsMagicalItem(false);
    setMagicModifier('1');
  };

  return (
    <section style={styles.layout}>
      <aside style={styles.menuPanel} aria-label="Equipment categories">
        {EQUIPMENT_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => {
              setActiveCategory(category);
              setNotice('');
            }}
            style={{
              ...styles.menuButton,
              ...(activeCategory === category ? styles.menuButtonActive : {}),
            }}
          >
            {category}
          </button>
        ))}
      </aside>

      <section style={styles.listPanel}>
        <div style={styles.listHeader}>
          <div>
            <h2 style={styles.categoryTitle}>{activeCategory}</h2>
            <p style={styles.categorySubtitle}>{activeItems.length ? `${activeItems.length} items` : 'No items added yet'}</p>
          </div>
        </div>

        {notice && (
          <div style={{ ...styles.notice, ...(noticeIsError ? styles.noticeError : styles.noticeSuccess) }}>
            {notice}
          </div>
        )}

        <div style={styles.tableShell}>
          <div style={styles.tableHeader}>Item</div>
          <div style={styles.tableHeader}>Cost</div>
          <div style={styles.tableHeader}>Weight</div>
          <div style={styles.tableHeader}>Notes</div>
          <div style={styles.tableHeader}>Action</div>

          {activeItems.length === 0 && (
            <div style={styles.emptyRow}>No equipment added yet.</div>
          )}

          {activeItems.map((item) => (
            <React.Fragment key={`${activeCategory}-${item.name}`}>
              <div style={styles.tableCell}>{item.name}</div>
              <div style={styles.tableCell}>{item.cost || '-'}</div>
              <div style={styles.tableCell}>{item.weight || '-'}</div>
              <div style={styles.tableCell}>{item.notes || '-'}</div>
              <div style={styles.actionCell}>
                <button type="button" onClick={() => handleEquip(item)} style={styles.equipButton}>
                  {actionLabel}
                </button>
              </div>
            </React.Fragment>
          ))}
        </div>

        {activeCategory === 'Armor' && (
          <p style={styles.footnote}>* See table 46 for Armor Class ratings of various armor types.</p>
        )}
        {activeCategory === 'Weapons' && (
          <p style={styles.footnote}>* These items weigh little individually. Ten of these weigh one pound.</p>
        )}
      </section>

      {pendingMagicalItem && (
        <div style={styles.promptBackdrop} role="presentation">
          <div style={styles.promptDialog} role="dialog" aria-modal="true" aria-label={`Magical ${pendingMagicalCategory.toLowerCase()}`}>
            <h3 style={styles.promptTitle}>Is this {getMagicalPromptName(pendingMagicalCategory)} magical?</h3>
            <p style={styles.promptText}>{pendingMagicalItem.name}</p>
            <label style={styles.checkLine}>
              <input
                type="checkbox"
                checked={isMagicalItem}
                onChange={(event) => setIsMagicalItem(event.target.checked)}
              />
              <span>Magical {getMagicalPromptName(pendingMagicalCategory)}</span>
            </label>
            {isMagicalItem && (
              <label style={styles.modifierField}>
                <span style={styles.modifierLabel}>Modifier</span>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={magicModifier}
                  onChange={(event) => handleMagicModifierChange(event.target.value)}
                  style={styles.modifierInput}
                />
              </label>
            )}
            <div style={styles.promptActions}>
              <button type="button" onClick={() => setPendingMagicalItem(null)} style={styles.cancelButton}>
                Cancel
              </button>
              <button type="button" onClick={confirmMagicalItem} style={styles.equipButton}>
                {actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  layout: {
    alignItems: 'start',
    display: 'grid',
    gap: 16,
    gridTemplateColumns: 'minmax(190px, 0.35fr) minmax(0, 1fr)',
  },
  menuPanel: {
    background: 'rgba(15,23,42,0.88)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    display: 'grid',
    gap: 8,
    padding: 10,
  },
  menuButton: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 6,
    color: '#cbd5e1',
    cursor: 'pointer',
    fontWeight: 800,
    minHeight: 38,
    padding: '0 10px',
    textAlign: 'left',
  },
  menuButtonActive: {
    background: 'rgba(169,255,247,0.12)',
    borderColor: 'rgba(169,255,247,0.42)',
    color: '#a9fff7',
  },
  listPanel: {
    background: 'rgba(15,23,42,0.88)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    boxShadow: '0 18px 42px rgba(0,0,0,0.24)',
    display: 'grid',
    gap: 12,
    padding: 14,
  },
  listHeader: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  categoryTitle: {
    color: '#a9fff7',
    fontSize: 24,
    fontWeight: 900,
    margin: 0,
  },
  categorySubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: 800,
    margin: '4px 0 0',
  },
  notice: {
    backdropFilter: 'blur(10px)',
    borderRadius: 8,
    boxShadow: '0 12px 28px rgba(0,0,0,0.24)',
    fontSize: 14,
    fontWeight: 900,
    padding: '10px 12px',
    position: 'sticky',
    textAlign: 'center',
    top: 0,
    zIndex: 5,
  },
  noticeSuccess: {
    background: 'rgba(20,83,45,0.94)',
    border: '1px solid rgba(74,222,128,0.62)',
    color: '#dcfce7',
  },
  noticeError: {
    background: 'rgba(127,29,29,0.94)',
    border: '1px solid rgba(248,113,113,0.68)',
    color: '#fee2e2',
  },
  tableShell: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: 'minmax(150px, 1.2fr) minmax(100px, 0.5fr) minmax(90px, 0.45fr) minmax(130px, 1fr) minmax(86px, 0.4fr)',
    overflowX: 'auto',
  },
  tableHeader: {
    background: 'rgba(169,255,247,0.12)',
    color: '#dffcff',
    fontSize: 12,
    fontWeight: 900,
    minHeight: 30,
    padding: '7px 8px',
  },
  tableCell: {
    alignItems: 'center',
    background: 'rgba(255,255,255,0.05)',
    color: '#f8fafc',
    display: 'flex',
    fontSize: 14,
    minHeight: 38,
    padding: '8px',
  },
  actionCell: {
    alignItems: 'center',
    background: 'rgba(255,255,255,0.05)',
    display: 'flex',
    minHeight: 38,
    padding: '6px 8px',
  },
  equipButton: {
    background: 'rgba(20,83,45,0.38)',
    border: '1px solid rgba(74,222,128,0.42)',
    borderRadius: 6,
    color: '#bbf7d0',
    cursor: 'pointer',
    fontWeight: 800,
    minHeight: 30,
    padding: '0 10px',
  },
  emptyRow: {
    background: 'rgba(255,255,255,0.05)',
    color: '#94a3b8',
    fontSize: 14,
    gridColumn: '1 / -1',
    minHeight: 42,
    padding: '12px 8px',
  },
  footnote: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: 700,
    margin: 0,
  },
  promptBackdrop: {
    alignItems: 'center',
    background: 'rgba(2,6,23,0.66)',
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    left: 0,
    padding: 18,
    position: 'fixed',
    right: 0,
    top: 0,
    zIndex: 40,
  },
  promptDialog: {
    background: '#0f172a',
    border: '1px solid rgba(169,255,247,0.36)',
    borderRadius: 8,
    boxShadow: '0 24px 70px rgba(0,0,0,0.45)',
    color: '#f8fafc',
    display: 'grid',
    gap: 14,
    maxWidth: 360,
    padding: 18,
    width: '100%',
  },
  promptTitle: {
    color: '#a9fff7',
    fontSize: 20,
    fontWeight: 900,
    margin: 0,
  },
  promptText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: 800,
    margin: 0,
  },
  checkLine: {
    alignItems: 'center',
    color: '#f8fafc',
    display: 'flex',
    fontSize: 14,
    fontWeight: 800,
    gap: 8,
  },
  modifierField: {
    display: 'grid',
    gap: 6,
  },
  modifierLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: 900,
    textTransform: 'uppercase',
  },
  modifierInput: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 6,
    color: '#f8fafc',
    fontSize: 16,
    minHeight: 38,
    padding: '0 10px',
  },
  promptActions: {
    display: 'flex',
    gap: 10,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.16)',
    borderRadius: 6,
    color: '#cbd5e1',
    cursor: 'pointer',
    fontWeight: 800,
    minHeight: 34,
    padding: '0 12px',
  },
};
