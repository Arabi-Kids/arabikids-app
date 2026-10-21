import { ArtBox } from './parts.jsx';
import * as Mammals from './Mammals.jsx';
import * as Birds from './Birds.jsx';
import * as Others from './Others.jsx';

// word key -> drawing. Filled in by each batch of illustrations.
const DRAWINGS = {
  lion: Mammals.Lion, rabbit: Mammals.Rabbit, camel: Mammals.Camel, horse: Mammals.Horse,
  sheep: Mammals.Sheep, giraffe: Mammals.Giraffe, fox: Mammals.Fox, deer: Mammals.Deer,
  gazelle: Mammals.Gazelle, elephant: Mammals.Elephant, monkey: Mammals.Monkey, dog: Mammals.Dog,
  duck: Birds.Duck, hen: Birds.Hen, falcon: Birds.Falcon, peacock: Birds.Peacock, sparrow: Birds.Sparrow, dove: Birds.Dove,
  crocodile: Others.Crocodile, frog: Others.Frog, fish: Others.Fish, bee: Others.Bee,
  corn: Others.Corn, pomegranate: Others.Pomegranate, lemon: Others.Lemon, banana: Others.Banana,
  sun: Others.Sun, flower: Others.Flower,
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
