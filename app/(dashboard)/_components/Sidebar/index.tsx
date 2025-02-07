import { List } from "./list";
import { NewButton } from "./new-button";

export const Sidebar = () => {
  return (
    <aside className="fixed z-[1] left-0 h-full w-[60px] hidden md:flex p-3 flex-col gap-y-4 text-white bg-neutral-600">
      <List />
      <NewButton />
    </aside>
  );
};