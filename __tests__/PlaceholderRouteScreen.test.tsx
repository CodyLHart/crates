import { render } from "@testing-library/react-native";

import { demoCopies, getCopyWithRelease } from "@/constants/demoData";
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
  it("keeps Copies connected to Releases, Crates, Tags, and Journal Entries", () => {
    const copy = getCopyWithRelease("copy-hounds-love");

    expect(copy?.release.title).toBe("Hounds of Love");
    expect(copy?.crates).toHaveLength(1);
    expect(copy?.tags.map((tag) => tag.name)).toContain("Gift");
    expect(copy?.journalEntries[0].type).toBe("Memory");
    expect(demoCopies).toHaveLength(5);
  });
});
