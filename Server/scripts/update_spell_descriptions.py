#!/usr/bin/env python3
import json
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parents[1] / 'prisma' / 'data' / 'spells.json'

updates = {
    "Alarm": "When an alarm spell is cast, the wizard causes a selected area to\nreact to the presence of any creature larger than a normal rat-anything larger than about ½ cubic foot in volume or more than about\nthree pounds in weight. The area of effect can be a portal, a section of\nfloor, stairs, etc. As soon as any creature enters the warded area,\ntouches it, or otherwise contacts it without speaking a password established by the caster, the alarm spell lets out a loud ringing that can be\nheard clearly within a 60-foot radius. (Reduce the radius by 10 feet for\neach interposing door and by 20 feet for each substantial interposing\nwall.) The sound lasts for one round and then ceases. Ethereal or\nastrally projected creatures do not trigger an alarm, but flying or levitating creatures, invisible creatures, or incorporeal or gaseous creatures\ndo. The caster can dismiss the alarm with a single word.\nThe material components of this spell are a tiny bell and a piecе\nof very fine silver wire.",

    "Armor": "By means of this spell, the wizard creates a magical field of force\nthat serves as if it were scale mail armor (AC 6). The spell has no\neffect ona person already armored or a creature with Armor Class 6\nor better. It is not cumulative with the shield spell, but it is cumulative with Dexterity and, in case of fighter/mages, with the shield\nbonus. The armor spell does not hinder movement or prevent spellcasting, and adds no weight or encumbrance. It lasts until successfully dispelled or until the wearer sustains cumulative damage\ntotaling greater than 8 points + 1 per level of the caster. (It is important to note that the armor does not absorb this damage. The armor\nmerely grants an AC of 6; the wearer still suffers full damage from\nany successful attacks.) Thus, the wearer might suffer 8 points from\nan attack, then several minutes later sustain an additional 1 point of\ndamage. Unless the spell were cast by a wizard of 2nd level or\nhigher, it would be dispelled at this time. Until it is dispelled, the\narmor spell grants the wearer full benefits of the Armor Class\ngained.\nThe material component is a piece of finely cured leather that\nhas been blessed bya priest.",

    "Audible Glame": "When the audible glamer spell is cast, the wizard causes a volume of sound to arise, at whatever distance he desires (within\nrange), and seem to recede, approach, or remain at a fixed place as\ndesired. The volume of sound created, however, is directly related to\nthe level of the spellcaster. The volume is based upon the lowest\nlevel at which the spell can be cast, 1st level. The noise of the audible glamer at this level is that of four men, maximum. Each additional experience level of the wizard adds a like volume, so that at\n2nd level the wizard can have the spell cause sound equal to that of\neight men. Thus, talking, singing, shouting, walking, marching, or running sounds can be created. The auditory illusion created by an\naudible glamer spell can be virtually any type of sound, but the relative volume must be commensurate with the level of the wizard\ncasting the spell. A horde of rats running and squeaking is about the\nsame volume as eight men running and shouting. A roaring lion is\nequal to the noise volume of 16 men, while a roaring dragon is\nequal to the noise volume of no fewer than 24 men.\nA character stating that he does not believe the sound receives a\nsaving throw, and if it succeeds, the character then hears a faint and\nobviously false sound, emanating from the caster's direction. Note\nthat this spell can enhance the effectiveness of the phantasmal\nforce spell.\nThe material component of the spell is a bit of wool or a small\nlump of wax.",

    "Burning Hands": "When the wizard casts this spell, a jet of searing flame shoots\nfrom his fingertips. His hands must be held so as to send forth a\nfanlike sheet of flames: The wizard's thumbs must touch each other\nand the fingers must be spread. The burning hands send out flame\njets 5 feet long in a horizontal arc of about 120 degrees in front of\nthe wizard. Any creature in the area of the flames suffers 1 d3 points\nof damage, plus 2 points for each level of experience of the spellcaster, to a maximum of 1d3+20 points of fire damage. Those successfully saving vs. spell receive half damage. Flammable materials\ntouched by the fire burn (for example, cloth, paper, parchment, thin\nwood, etc.). Such materials can be extinguished in the next round if\nno other action is taken.",

    "Cantrip": "Cantrips are minor spells studied by wizards during their apprenticeship, regardless of school. The cantrip spell is a practice method\nfor the apprentice, teaching him how to tap minute amounts of\nmagical energy. Once cast, the cantrip spell enables the caster to\ncreate minor magical effects for the duration of the spell. However,\nthese effects are so minor that they have severe limitations. They\nare completely unable to cause a loss of hit points, cannot affect the\nconcentration of spellcasters, and can only create small, obviously\nmagical materials. Furthermore, materials created by a cantrip are\nextremely fragile and cannot be used as tools of any sort. Lastly, a\ncantrip lacks the power to duplicate any other spell effects.\nWhatever manifestation the cantrip takes, it remains in effect\nonly as long as the wizard concentrates. Wizards typically use\ncantrips to impress common folk, amuse children, and brighten dreary lives. Common tricks with cantrips include tinklings of ethereal music, brightening faded flowers, glowing balls that float over\nthe caster's hand, puffs of wind to flicker candles, spicing up aromas\nand flavors of bland food, and little whirlwinds to sweep dust under\nrugs. Combined with the unseen servant spell, it's a tool to make\nhousekeeping and entertaining simpler for the wizard." 
}


def main():
    data = json.loads(DATA_PATH.read_text())
    found = {name: False for name in updates}
    for entry in data:
        name = entry.get('name')
        if name in updates:
            entry['description'] = updates[name]
            found[name] = True

    DATA_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")

    for name, was_found in found.items():
        if was_found:
            print(f"Updated description for: {name}")
        else:
            print(f"Warning: spell not found in data: {name}")

if __name__ == '__main__':
    main()
