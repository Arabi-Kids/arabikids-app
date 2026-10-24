import { ArtBox } from './parts.jsx';
import * as Mammals from './Mammals.jsx';
import * as Birds from './Birds.jsx';
import * as Others from './Others.jsx';
import * as Places from './Places.jsx';
import * as Living from './Living.jsx';
import * as Things from './Things.jsx';

// word key -> drawing. Filled in by each batch of illustrations.
const DRAWINGS = {
  lion: Mammals.Lion, rabbit: Mammals.Rabbit, camel: Mammals.Camel, horse: Mammals.Horse,
  sheep: Mammals.Sheep, giraffe: Mammals.Giraffe, fox: Mammals.Fox, deer: Mammals.Deer,
  gazelle: Mammals.Gazelle, elephant: Mammals.Elephant, monkey: Mammals.Monkey, dog: Mammals.Dog,
  duck: Birds.Duck, hen: Birds.Hen, falcon: Birds.Falcon, peacock: Birds.Peacock, sparrow: Birds.Sparrow, dove: Birds.Dove,
  crocodile: Others.Crocodile, frog: Others.Frog, fish: Others.Fish, bee: Others.Bee,
  corn: Others.Corn, pomegranate: Others.Pomegranate, lemon: Others.Lemon, banana: Others.Banana,
  sun: Others.Sun, flower: Others.Flower,
  // objects, places and people for the beginning/middle/end words
  door: Places.Door, house: Places.House, school: Places.School, mosque: Places.Mosque, tower: Places.Tower,
  farm: Places.Farm, cave: Places.Cave, road: Places.Road, sea: Places.Sea, star: Places.Star, moon: Places.Moon,
  tree: Places.Tree, palm: Places.Palm, nest: Places.Nest, garden: Places.Garden, calendar: Places.Calendar,
  grapes: Living.Grapes, apple: Living.Apple, watermelon: Living.Watermelon, egg: Living.Egg, ear: Living.Ear,
  eye: Living.EyeArt, finger: Living.Finger, hair: Living.Hair, face: Living.Face, boy: Living.Boy,
  teacher: Living.Teacher, cow: Living.Cow, cat: Living.Cat, mule: Living.Mule, ant: Living.Ant,
  stick: Things.Stick, big: Things.Big, desk: Things.Desk, many: Things.Many, talk: Things.Talk, ten: Things.Ten,
  cage: Things.Cage, white: Things.White, carpet: Things.Carpet, glasses: Things.Glasses, brain: Things.Brain,
  lock: Things.Lock, pen: Things.Pen, knowledge: Things.Knowledge, cup: Things.Cup, bucket: Things.Bucket,
  chair: Things.Chair, lesson: Things.Lesson,
};

// letter id -> the picture word(s) shown for it. L26 (hoopoe) is Hudi himself.
export const LETTER_ART = {
  L01: ['lion', 'rabbit'], L02: ['duck'], L03: ['crocodile'], L04: ['fox'], L05: ['camel'], L06: ['horse'],
  L07: ['sheep'], L08: ['hen'], L09: ['corn'], L10: ['pomegranate'], L11: ['giraffe'], L12: ['fish'],
  L13: ['sun'], L14: ['falcon'], L15: ['frog'], L16: ['peacock'], L17: ['deer'], L18: ['sparrow'],
  L19: ['gazelle'], L20: ['elephant'], L21: ['monkey'], L22: ['dog'], L23: ['lemon'], L24: ['banana'],
  L25: ['bee'], L26: null, L27: ['flower'], L28: ['dove'],
};

export const ART_KEYS = Object.keys(DRAWINGS);
export const hasArt = (key) => !!DRAWINGS[key];

export default function AnimalArt({ name, size = 110, label }) {
  const Drawing = DRAWINGS[name];
  if (!Drawing) return null;
  return <ArtBox size={size} label={label}><Drawing /></ArtBox>;
}
