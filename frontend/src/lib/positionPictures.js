// Pictures for the "where does the letter sit" words (beginning / middle / end).
// `art` = one of the animated drawings in components/animals; `avatar` = a character.
// The one word without a picture is the knife (P22 middle): nothing sharp is shown
// to small children, so it gets a soft neutral tile with the English meaning.
// Key: "<position id>.<beg|mid|end>", e.g. "P02.mid".
export const POSITION_PICTURES = {
  'P01.beg': { art: 'lion' }, 'P01.mid': { art: 'door' }, 'P01.end': { art: 'stick' },
  'P02.beg': { art: 'duck' }, 'P02.mid': { art: 'big' }, 'P02.end': { art: 'grapes' },
  'P03.beg': { art: 'apple' }, 'P03.mid': { art: 'desk' }, 'P03.end': { art: 'house' },
  'P04.beg': { art: 'fox' }, 'P04.mid': { art: 'many' }, 'P04.end': { art: 'talk' },
  'P05.beg': { art: 'camel' }, 'P05.mid': { art: 'star' }, 'P05.end': { art: 'tower' },
  'P06.beg': { art: 'horse' }, 'P06.mid': { art: 'sea' }, 'P06.end': { art: 'apple' },
  'P07.beg': { art: 'sheep' }, 'P07.mid': { art: 'palm' }, 'P07.end': { art: 'watermelon' },
  'P08.beg': { art: 'hen' }, 'P08.mid': { art: 'school' }, 'P08.end': { art: 'boy' },
  'P09.beg': { art: 'corn' }, 'P09.mid': { art: 'ear' }, 'P09.end': { art: 'teacher' },
  'P10.beg': { art: 'pomegranate' }, 'P10.mid': { art: 'tree' }, 'P10.end': { art: 'moon' },
  'P11.beg': { art: 'giraffe' }, 'P11.mid': { art: 'farm' }, 'P11.end': { art: 'banana' },
  'P12.beg': { art: 'fish' }, 'P12.mid': { art: 'mosque' }, 'P12.end': { art: 'lesson' },
  'P13.beg': { art: 'sun' }, 'P13.mid': { art: 'ten' }, 'P13.end': { art: 'nest' },
  'P14.beg': { art: 'falcon' }, 'P14.mid': { art: 'sparrow' }, 'P14.end': { art: 'cage' },
  'P15.beg': { art: 'frog' }, 'P15.mid': { art: 'egg' }, 'P15.end': { art: 'white' },
  'P16.beg': { art: 'peacock' }, 'P16.mid': { art: 'cat' }, 'P16.end': { art: 'carpet' },
  'P17.beg': { art: 'deer' }, 'P17.mid': { art: 'glasses' }, 'P17.end': { art: 'brain' },
  'P18.beg': { art: 'sparrow' }, 'P18.mid': { art: 'hair' }, 'P18.end': { art: 'finger' },
  'P19.beg': { art: 'gazelle' }, 'P19.mid': { art: 'mule' }, 'P19.end': { art: 'brain' },
  'P20.beg': { art: 'elephant' }, 'P20.mid': { art: 'lock' }, 'P20.end': { art: 'cave' },
  'P21.beg': { art: 'monkey' }, 'P21.mid': { art: 'cow' }, 'P21.end': { art: 'road' },
  'P22.beg': { art: 'dog' }, 'P22.mid': null, 'P22.end': { art: 'fish' },
  'P23.beg': { art: 'lemon' }, 'P23.mid': { art: 'pen' }, 'P23.end': { art: 'camel' },
  'P24.beg': { art: 'banana' }, 'P24.mid': { art: 'ant' }, 'P24.end': { art: 'knowledge' },
  'P25.beg': { art: 'bee' }, 'P25.mid': { art: 'garden' }, 'P25.end': { art: 'eye' },
  'P26.beg': { avatar: 'hudi' }, 'P26.mid': { art: 'calendar' }, 'P26.end': { art: 'face' },
  'P27.beg': { art: 'flower' }, 'P27.mid': { art: 'cup' }, 'P27.end': { art: 'bucket' },
  'P28.beg': { art: 'dove' }, 'P28.mid': { art: 'house' }, 'P28.end': { art: 'chair' },
};

export function positionPicture(positionId, key) {
  return POSITION_PICTURES[`${positionId}.${key}`] ?? null;
}
