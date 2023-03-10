import { nanoid } from "nanoid";

export type Item = { id: string; checked: boolean }

declare global {
  var items: Item[];
}

let items: Item[];

if (global.items) {
  items = global.items;
} else {
  items = global.items = Array(10)
    .fill(null)
    .map(() => ({ id: nanoid(), checked: false }));
}

export { items };
