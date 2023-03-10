import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { useFetcher, useFormAction, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";

import { items, type Item } from "~/items.server";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type LoaderData = Item[];

export const loader: LoaderFunction = async () => {
  await sleep(5000);
  console.log("items", items);
  return json<LoaderData>(items);
};

export type ActionData<T> =
  | { response: T; error: null }
  | { response: null; error: string };

export const action: ActionFunction = async ({ request }) => {
  try {
    await sleep(500);
    const formData = await request.formData();
    const id = formData.get("id");
    const item = items.find((item) => item.id === id);
    if (!item) throw new Error(`Item ${id} not found. Try again later.`);
    item.checked = formData.get("checked") === "true";
    console.log("item", item);
    return json<ActionData<Item>>({ response: item, error: null });
  } catch (error) {
    let message = "Something went wrong. Try again later.";
    if (error instanceof Error) message = error.message;
    else message = error?.toString() ?? "null";
    return json<ActionData<Item>>({ response: null, error: message });
  }
};

export default function Index() {
  const items = useLoaderData<LoaderData>();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Welcome to Remix</h1>
      <ul>
        {items.map((item) => (
          <ListItem key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}

function ListItem({ item }: { item: Item }) {
  const fetcher = useFetcher<ActionData<Item>>();
  const fetcherAction = useFormAction();
  const checked = fetcher.submission
    ? fetcher.submission.formData.get("checked") === "true"
    : item.checked;
  return (
    <li>
      <input
        type="checkbox"
        id={item.id}
        name={item.id}
        value={item.id}
        checked={checked}
        onChange={(event) =>
          fetcher.submit(
            { id: item.id, checked: event.currentTarget.checked.toString() },
            { action: fetcherAction, method: "patch" }
          )
        }
      />
      <label style={{ margin: "8px" }}>{item.id}</label>
      {fetcher.type === "done" && fetcher.data.error !== null && (
        <span style={{ color: "red" }}>{fetcher.data.error}</span>
      )}
      {fetcher.state === "submitting" && (
        <span style={{ color: "blue" }}>Saving...</span>
      )}
      {fetcher.state === "loading" && (
        <span style={{ color: "green" }}>Loading...</span>
      )}
    </li>
  );
}
