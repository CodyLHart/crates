import { render } from "@testing-library/react-native";

import { copies, crates, journalEntries, releases, tags } from "@/constants/demoData";
import { placeholderRoutes } from "@/constants/placeholders";
import { PlaceholderRouteScreen } from "@/features/app-shell/screens/PlaceholderRouteScreen";

describe("PlaceholderRouteScreen", () => {
  it("renders the route title and description", async () => {
    const { getByText } = await render(
      <PlaceholderRouteScreen route={placeholderRoutes.collection} />,
    );

    expect(getByText("Collection")).toBeTruthy();
    expect(getByText(/copy-centric browser/i)).toBeTruthy();
  });
});

describe("demo data", () => {
  it("keeps seed Copies connected to Releases, Crates, Tags, and Journal Entries", () => {
    const copy = copies.find((item) => item.id === "copy-hounds-love");
    const release = releases.find((item) => item.id === copy?.releaseId);
    const copyCrates = crates.filter((crate) => copy?.crateIds.includes(crate.id));
    const copyTags = tags.filter((tag) => copy?.tagIds.includes(tag.id));
    const copyJournalEntries = journalEntries.filter((entry) => entry.copyId === copy?.id);

    expect(release?.title).toBe("Hounds of Love");
    expect(copyCrates).toHaveLength(1);
    expect(copyTags.map((tag) => tag.name)).toContain("Gift");
    expect(copyJournalEntries[0].type).toBe("Memory");
    expect(copies).toHaveLength(5);
  });
});
