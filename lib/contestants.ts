export type Gender = "m" | "f";
export type Contestant = {
  id: string;
  no: string;
  name: string;
  first: string;
  dept: string;
  gender: Gender;
  /** 800x1000 jpg + 480x600 webp under /public/contestants */
  photo?: string;
  photoSm?: string;
};

const raw: [string, string, Gender][] = [
  ["Agara Abner Alexander", "Cyber Security", "m"],
  ["Amupitan Emmanuel Ayomide", "Accounting", "m"],
  ["Bewaran Rinji", "Economics", "m"],
  ["Christian Chukwuneme", "Business Administration & Management", "m"],
  ["David Ekerette Ekpenyong", "Medicine & Surgery", "m"],
  ["Edwin Samuel", "Software Engineering", "m"],
  ["Ezenwa Ugochukwu Onyekachi", "Electrical & Electronics", "m"],
  ["Joseph Angel", "Medicine & Surgery", "f"],
  ["Kazeem Emmanuella Funere", "Medical Laboratory Science", "f"],
  ["Kendra Oluwatobi Babatunde", "Medical Laboratory Science", "f"],
  ["Maxim Khakana Obo", "Software Engineering", "m"],
  ["Mba Ikechukwu Emmanuel", "Accounting", "m"],
  ["Muhydeen Olamilekan Mohammed", "Computer Science", "m"],
  ["Odoh Oche", "History & International Relations", "m"],
  ["Okali Emmanuel", "Computer Engineering", "m"],
  ["Onoteagbo Treasure Ochuwa", "Accounting", "f"],
  ["Senewo GunuguBari", "Law", "m"],
  ["Uchefuna Cynthia Chukwusomebi", "Medicine & Surgery", "f"],
];

// Every contestant has /public/contestants/<id>.jpg and <id>-sm.webp
const HAS_PHOTO = true;

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const contestants: Contestant[] = raw.map(([name, dept, gender], i) => {
  const id = slug(name);
  return {
    id,
    no: String(i + 1).padStart(2, "0"),
    name,
    first: name.split(" ")[0],
    dept,
    gender,
    photo: HAS_PHOTO ? `/contestants/${id}.jpg` : undefined,
    photoSm: HAS_PHOTO ? `/contestants/${id}-sm.webp` : undefined,
  };
});

export const byId = (id: string) => contestants.find((c) => c.id === id);

export const initials = (name: string) => {
  const p = name.split(" ").filter(Boolean);
  return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
};
